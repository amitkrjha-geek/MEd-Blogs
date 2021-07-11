const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');
const app = express();
let blogPosts = [];
const title = "MEd Blogs";
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))

app.get("/", function(req, res) {
    res.render("index", { blogPosts: blogPosts });
})

app.get("/contact", function(req, res) {
    res.render("contact");
})
app.get("/compose", function(req, res) {
    res.render("compose");
})
app.get("/singlepost", function(req, res) {
    res.render("singlepost", { post: blogPosts[0] });
})

app.get("/header", function(req, res) {
    res.render("header", { bTitle: title });
})
app.get("/singlepost/:postName", function(req, res) {
    const reqTitlle = _.lowerCase(req.params.postName);
    blogPosts.forEach(function(post) {
        if (_.lowerCase(post.heading) === reqTitlle) {
            res.render("singlepost", { post: post });
        }
    })

})

app.post("/compose", function(req, res) {
    var today = new Date();
    let options = {
        day: "numeric",
        month: "long",
        year: "numeric",
    };
    var day = today.toLocaleDateString("en-US", options);

    const blogPost = {
        author: req.body.bName,
        heading: req.body.bHeading,
        email: req.body.bEmail,
        tags: (req.body.bTags).split(" "),
        date: day,
        message: req.body.bMsg,
        comments: [],
    }
    blogPosts.push(blogPost);
    res.redirect("/")
})



app.listen('3000', function() {
    console.log("server at 3000");
})