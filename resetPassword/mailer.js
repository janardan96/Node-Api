var nodemailer = require('nodemailer');
var keys = require('../config/keys');
var sgTransport = require('nodemailer-sendgrid-transport');



async function sendMailPassword(sender, link) {

    var transporter = nodemailer.createTransport({
        // service: keys.mailerService,
        service: 'Gmail',
        auth: {
            user: keys.mailerUserName, // generated ethereal user
            pass: keys.mailerPass // generated ethereal password
            // api_key: keys.sendgridApi
        }
    });
    // setup email data with unicode symbols
    var email = {
        from: keys.mailerFrom, // sender address
        to: sender, // list of receiver
        subject: "Password reset", // Subject line
        html: `<p>You are receiving this because you have requested the reset of password.Click the link for resetting the password <a href="${link}">${link}</p>`,
    }
    // send mail with defined transport object
    let info = transporter.sendMail(email).catch(err => console.log(err))
}

//   main().catch(console.error);
module.exports.sendMailPassword = sendMailPassword;