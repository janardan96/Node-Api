const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const mailer = require("../../resetPassword/mailer");
const tokenGenerate = require('../../resetPassword/generateToken');
const passport = require("passport");

//Load input Register
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateForgotPassword = require("../../validation/forgotPassword");
const validateResetPassword = require("../../validation/resetPassword");


//User model
const User = require("../../models/User");

//Sign Token
signToken = (payload) => {
  return jwt.sign(payload, keys.secretOrkey, {
    expiresIn: "24h"
  });
};

//Get api/users/test
//Tests Users Route
//access- public

router.get("/test", (req, res) =>
  res.json({
    msg: "Users works"
  })
);

//Get api/users/register
//Registration User
//access- public

router.post("/register", async (req, res) => {
  try {
    const { errors, isValid } = validateRegisterInput(req.body);

    //Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const user = await User.findOne({
      email: req.body.email
    });
    const userContact = await User.findOne({
      mobile: req.body.mobile
    });
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json({
        errors: errors.email
      });
    } else if (userContact) {
      errors.mobile = "Mobile no. is already register";
      return res.status(400).json({
        error: errors.mobile
      });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size
        r: "pg", //Rating
        d: "mm" //Default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: avatar,
        password: req.body.password,
        mobile: req.body.mobile
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, async (err, hash) => {
          try {
            // Store hash in your password DB.
            if (err) throw err;
            newUser.password = hash;
            const user = await newUser.save();

            //Sign Token
            const payload = {
              id: user.id,
              name: user.name,
              avatar: user.avatar
            };

            //Generate Token
            const token = await signToken(payload);
            //console.log(token)
            res.json({
              user,
              success: true,
              token: "Bearer " + token
            });
          } catch (err) {
            console.log(err);
          }
        });
      });
    }
  } catch (e) {
    res.status(404).json("Error occurs");
  }
});

//Get api/users/login
//Registration User
//access- public
router.post("/login", async (req, res) => {
  //find user by email
  try {
    const email = req.body.email;
    const password = req.body.password;
    const { errors, isValid } = validateLoginInput(req.body);

    //Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const user = await User.findOne({
      email
    });

    if (!user) {
      errors.email = "User not found";
      res.status(404).json({
        error: errors.email
      });
    }
    //check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      //user match
      const payload = {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      };

      //Generate Token
      const token = await signToken(payload);
      //console.log(token)
      res.json({
        success: true,
        token: "Bearer " + token
      });
    } else {
      errors.password = "Password is incorrect";
      return res.status(400).json({
        password: errors.password
      });
    }
  } catch (e) {
    res.status(400).json(e);
  }
});


//Get api/users/forgot
//Registration user
//access- public
router.post("/forgot", async (req, res) => {
  const email = req.body.email;
  const { errors, isValid } = validateForgotPassword(req.body);
  const success = {};

  //Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    const user = await User.findOne({
      email
    });

    if (!user) {
      errors.email = "User not found";
      return res.status(404).json({
        error: errors.email
      });
    }

    //Token Generate for reset Password
    const token = await tokenGenerate.generateToken().catch((err) => console.log(`Error occur in generatong token ${err}`));
    console.log(token);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; //1 hr
    await user.save().catch((err) => console.log(`Error in saving the token into database`));

    //mailing token
    const link = `${req.protocol}://${req.headers.host}/api/users/reset/${token}`;
    await mailer.sendMailPassword(email, link).catch((err) => res.status(400).json(`Error in sending Link ${err}`));
    success.sended = `Link is sended successfully to ${email}`
    res.json({ success: success.sended })
  } catch (error) {
    res.status(400).json(`error Occure`)
  }
})


//Get api/users/reset/:token
//Registration user
//access- public
router.post('/reset/:token', async (req, res) => {
  const { errors, isValid } = validateResetPassword(req.body);

  try {
    const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });


    if (!user) {
      errors.token = "Invalid token or expired tdfsfsoken"
      return res.status(400).json({ error: errors.token })
    }
    //Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }


    user.password = req.body.password;
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, async (err, hash) => {
        try {
          // Store hash in your password DB.
          if (err) throw err;
          user.password = hash;
          await user.save();

          //Sign Token
          const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          };

          //Generate Token
          const token = await signToken(payload);
          //console.log(token)
          res.json({
            user,
            success: true,
            token: "Bearer " + token
          });
        } catch (err) {
          console.log(err);
        }
      });
    });

  } catch (error) {
    errors.token = "Invalid token or expired token"
    return res.status(400).json({ error: errors.token })
  }

})

//Get api/users/current
//Return current user
//access- private

router.get(
  "/current",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
