# Social Medai Project
This is an social media App api build in node.js.
* User can login and create their account. 
* JWT is used for authentication.
* After successfully signup user can Post the their qoutes with images in the dashboard, which will visible to other users. 
* Other users can link and comment on the post.
* All Posts are protected, means only the authenticate user can delete their post.

## For access and run the code you need to make a keys.js file in config folder. After successfully create the file copy this code and config it according to your credentials 

```javascript
module.exports = {
    secretOrkey: "secret", //no change
    mailerUserName: "Your_email_id",
    mailerPass: "password",
    mailerFrom: '"Janardan 👻" email_id',
    mailerService: 'Gmail', //no change
    cloudinary_cloud_name: 'Cloudinary_name', //create a account in cloudinary you will get all of these credentials
    cloudinary_api_key: 'Cloudinary_keys',
    cloudinary_api_secret: 'Cloudinary_seceret',
    sendgridApi: 'sendgrid_api' //optional
}

```
