var nodemailer = require('nodemailer');
var keys = require('../../config/keys');
var sgTransport = require('nodemailer-sendgrid-transport');



async function sendMailSignup(sender) {

    var transporter = nodemailer.createTransport(sgTransport({
        // service: keys.mailerService,
        auth: {
            // user: keys.mailerUserName, // generated ethereal user
            // pass: keys.mailerPass // generated ethereal password
            api_key: keys.sendgridApi
        }
    }));
    // setup email data with unicode symbols
    var email = {
        from: keys.mailerFrom, // sender address
        to: sender, // list of receiver
        subject: "Succesfully Sign Up", // Subject line
        html: `<h3>Successfully Sign Up</h3>`,
    }
    // send mail with defined transport object
    let info = transporter.sendMail(email).catch(err => console.log(err))
}

//   main().catch(console.error);
module.exports.sendMailSignup = sendMailSignup;