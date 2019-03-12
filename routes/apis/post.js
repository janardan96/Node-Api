const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const uploadFiles = require('../../uploadImage/multer');
const cloudinary = require('cloudinary');
require('../../uploadImage/cloudinary');


//Post database
const Post = require('../../models/Post');

//Profile database
const Profile = require('../../models/Profile');

//validation
const validatePostInput = require('../../validation/post')

//GET api/posts/test
//Test Post route
//access Public

router.get('/test', (req, res) => res.json({
    msg: "Posts works"
}))


//GET api/posts/
//Get Post
//access Public
router.get('/', async (req, res) => {
    const posts = await Post.find().sort({ date: -1 }).catch((err) => res.status(404).json(`No Post is here`));
    res.json(posts)

})


//GET api/post/:id
//Get Post
//access Public
router.get('/:id', async (req, res) => {
    const post = await Post.findById(req.params.id).sort({ date: -1 }).catch((err) => res.status(404).json(`No Post is here`));
    res.json(post)

})



//Post api/post
//Create Post
//Private
router.post('/', passport.authenticate('jwt', { session: false }), uploadFiles.single('image'), async (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    try {

        //Check Validation
        if (!isValid) {
            //if any error
            return res.status(400).json(errors)
        }

        var newPost = {}
        if (req.file) {
            //Upload image on Cloudinary
            const result = await cloudinary.v2.uploader.upload(req.file.path);

            newPost = new Post({
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id,
                imageUrl: result.secure_url,
                imageId: result.public_id
            });
        }

        else {

            newPost = new Post({
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id,
            });
        }
        const post = await newPost.save().catch(err => res.status(400).json(`Error in Saving the Post`))

        const profile = await Profile.findOne({ user: req.user.id }).catch((err) => res.status(400).json(`Error in finding the user`));

        if (post.user.toString() === req.user.id) {

            profile.posts.unshift(post);
            //save Profile
            const profileSave = await profile.save().catch((err) => `error in saving the data ${err}`);
            res.json(post);
            // console.log(profileSave)
        }


    } catch (error) {

    }
})


//Delete api/post/:id
//Delete Post
//Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const profile = await Profile.findOne({ user: req.user.id }).catch(err => res.status(404).json(`Can't find the profile`));

    const post = await Post.findById(req.params.id).catch(err => res.status(404).json(`Post not found`))

    if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ notauthorized: 'User not authorized' })
    }

    //Delete from cloudinary
    if (post.imageId) {
        await cloudinary.v2.uploader.destroy(post.imageId).catch(err => res.status(400).json(`Error in deleting image`));
    }

    //Delete from Post model
    await post.remove().catch(err => res.status(400).json(`Error in deleting image`));

    //Delete from Profile Model
    const postFromProfile = profile.posts.map(item => item.id).indexOf(req.params.id)
    profile.posts.splice(postFromProfile, 1);

    await profile.save().catch((err) => res.status(400).json(`error Occur`));

    res.json({ success: true })
}
)



//Post api/post/like/:id
//Add and Remove like
//Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const profile = await Profile.findOne({ user: req.user.id }).catch(err => res.status(404).json(`Can't find the profile`));

    const post = await Post.findById(req.params.id).catch(err => res.status(404).json(`Post not found`))

    if ((post.likes.filter(like => like.user.toString() === req.user.id)).length > 0) {
        //Get remove index
        const removeLike = post.likes.map(item => item.user.toString()).indexOf(req.user.id)

        //Splice out of array
        post.likes.splice(removeLike, 1);
        const dislike = await post.save().catch(`Error in removing likes`)
        res.json(dislike)
    }
    else {
        post.likes.unshift({ user: req.user.id });
        const likes = await post.save().catch(err => `Error in saving the likes`)
        res.json(likes)
    }
}
)



//Post api/post/comment/:id
//Add comment to post
//Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {

    const { errors, isValid } = validatePostInput(req.body);
    //Check Validation
    if (!isValid) {
        //if any error
        return res.status(400).json(errors)
    }

    const post = await Post.findById(req.params.id).catch(err => res.status(404).json(`Post not found`))

    const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    }
    post.comments.unshift(newComment);
    const saveComment = await post.save().catch(err => `Error in saving comment`);
    res.json(saveComment)
})



//Post api/post/comment/:id/:comment_id
//Remove comment from post
//Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const post = await Post.findById(req.params.id).catch(err => res.status(404).json(`Post not found`))

    //Check to see if comment exists
    if (post.comments.filter(comments => comments._id.toString() === req.params.comment_id).length === 0) {
        return res.status(404).json({ commentnotexists: "Comment does not exist" });

    }
    //Getting index
    const removeIndex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id);

    //Splicing from array of comment
    post.comments.splice(removeIndex, 1);

    const removeComment = await post.save().catch(err => res.status(400).json(`Error in removing comment`));

    res.json(removeComment)

})


module.exports = router;