const express = require("express");
const mongoose = require("mongoose")
const users = require('./routes/apis/users');
const profile = require('./routes/apis/profile');
const posts = require('./routes/apis/post');
const bodyParser = require('body-parser');
const passport = require('passport');

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/SocialMedia")
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));


const port = process.env.PORT || 5000;


const app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json())

//Passport middleware
app.use(passport.initialize());

//Password config
require('./config/passport')(passport);

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/post', posts);



app.listen(port, () => console.log(`Server on port on ${port}`));