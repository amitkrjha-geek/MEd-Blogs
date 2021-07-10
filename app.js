const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
let blogPosts = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))

app.get("/", function(req, res) {
    res.render("index");
    console.log(blogPosts);
})

app.get("/contact", function(req, res) {
    res.render("contact");
})
app.get("/compose", function(req, res) {
    res.render("compose");
})
app.post("/compose", function(req, res) {
    var blogPost = {
        author: req.body.bName,
        heading: req.body.bHeading,
        email: req.body.bEmail,
        tags: (req.body.bTags).split(" "),
        date: new Date(),
        message: req.body.bMessage,
    }
    blogPosts.push(blogPost);
    res.redirect("/")
})

app.listen('3000', function() {
    console.log("server at 3000");
})