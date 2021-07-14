const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');
const multer = require('multer');;
const app = express();
const upload = multer({ dest: __dirname + '/public/img' });
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin-cosmoknight:iamDev1!@cluster0.oxvbw.mongodb.net/MEdBlogsDB', { useNewUrlParser: true, useUnifiedTopology: true });


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))

//let blogPosts = []; //array containing posts
//let contacts = []; //array containing contacts
const title = "MEd Blogs";



const blogPostsSchema = {
    author: String,
    heading: String,
    email: String,
    tags: [],
    date: String,
    message: String,
    comments: [],
    img: String //img is imagename
}
const BlogPost = mongoose.model('BlogPost', blogPostsSchema);


const contactsSchema = {
    name: String,
    email: String,
    subject: String,
    msg: String,
    date: {},
    //img is imagename
}
const Contact = mongoose.model('Contact', contactsSchema);




app.get("/", function(req, res) {
    BlogPost.find({}, function(err, blogPosts) {
        res.render("index", { blogPosts: blogPosts });
    })
})

//..................contact route begin........................
app.get("/contact", function(req, res) {
    res.render("contact");
})
app.post("/contact", function(req, res) {
        let nDate = new Date();
        let contact = new Contact({
            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject,
            msg: req.body.message,
            date: nDate,

        })
        contact.save();
        Contact.find({}, function(err, contact) {
            console.log(contact);
        })
        res.redirect("#");
    })
    //...................contact route end..........................


//......................compose route begin......................
app.get("/compose", function(req, res) {
    res.render("compose");
})
app.post("/compose", upload.single('photo'), function(req, res) {
        var today = new Date();
        let options = {
            day: "numeric",
            month: "long",
            year: "numeric",
        };
        var day = today.toLocaleDateString("en-US", options);
        if (req.file) {
            console.log(req.file.filename);
            const blogPost = new BlogPost({
                author: req.body.bName,
                heading: req.body.bHeading,
                email: req.body.bEmail,
                tags: (req.body.bTags).split(" "),
                date: day,
                message: req.body.bMsg,
                comments: [],
                img: req.file.filename //img is imagename
            });
            blogPost.save();
            res.redirect("/");
        } else throw 'error';
    })
    //....................compose route ends.............................

app.get("/singlepost", function(req, res) {
    res.render("singlepost", { post: blogPosts[0] });
})

app.get("/header", function(req, res) {
    res.render("header", { bTitle: title });
})

//....................dynamic post route.............................

app.get("/singlepost/:postName", function(req, res) {
    const reqTitlle = (req.params.postName);
    BlogPost.findOne({ heading: reqTitlle }, function(err, post) {
        res.render("singlepost", { post: post });

    });


})

app.post("/singlepost/:postName", function(req, res) {
    const reqTitlle = (req.params.postName);
    BlogPost.findOne({ heading: reqTitlle }, function(err, post) {

        if ((post.heading) === reqTitlle) {
            var today = new Date();
            let options = {
                day: "numeric",
                month: "long",
                year: "numeric",
            };
            var day = today.toLocaleDateString("en-US", options);
            post.comments.push({
                cAuthor: req.body.name,
                cEmail: req.body.email,
                cDate: day,
                cMsg: req.body.message,
            });
            post.save();

            res.redirect("#");
        }


    });
})
app.get('/about', function(req, res) {
    res.render('about');
})
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}


app.listen(port, function() {
    console.log("server started Successfully");
})