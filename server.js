const express = require("express");
const mongoose = require("mongoose")
const users = require('./routes/apis/users');
const profile = require('./routes/apis/profile');
const posts = require('./routes/apis/post');


const app = express();
const port = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost/SocialMedia")
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Hello"));

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);



app.listen(port, () => console.log(`Server on port on ${port}`));