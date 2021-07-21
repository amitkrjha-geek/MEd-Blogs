let express = require('express');
let bodyParser = require('body-parser');
let ejs = require('ejs');
let _ = require('lodash');
let multer = require('multer');;
let app = express();
let upload = multer({ dest: __dirname + '/public/blogpage-assets/img/' });
let mongoose = require('mongoose');
const { post } = require('request');
mongoose.connect('mongodb://localhost:27017/MEdBlogsDB', { useNewUrlParser: true, useUnifiedTopology: true });
//mongoose.connect('mongodb+srv://admin-cosmoknight:iamDev1!@cluster0.oxvbw.mongodb.net/MEdBlogsDB', { useNewUrlParser: true, useUnifiedTopology: true });


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))

//let blogPosts = []; //array containing posts
//let contacts = []; //array containing contacts
let title = "MEd Blogs";


let blogPostsSchema = {
    author: String,
    heading: String,
    email: String,
    tags: [],
    date: String,
    message: String,
    comments: [],
    img: String, //img is imagename
    likes: Number,
    dislikes: Number,
    time: Number
}
let BlogPost = mongoose.model('BlogPost', blogPostsSchema);

let commentsSchema = {
    cAuthor: String,
    cEmail: String,
    cDate: String,
    cMsg: String,
    clikes: Number,
    cdislikes: Number,
}
let Comment = mongoose.model('Comment', commentsSchema);

const taggedPostSchema = {
    tagName: String,
    posts: Array
}
let TaggedPost = mongoose.model('TaggedPost', taggedPostSchema);

function displayTags() {
    TaggedPost.find({}, function(err, tags) {
        tags.forEach(function(tag) {
            if (!err) {
                console.log("   " + tag.tagName);
                for (let i = 0; i < tag.posts.length; i++) {
                    console.log("-->>" + tag.posts[i]);
                }
            }
        })

    })
}

let contactsSchema = {
    name: String,
    email: String,
    subject: String,
    msg: String,
    date: {},
    //img is imagename
}
let Contact = mongoose.model('Contact', contactsSchema);

let mainContactsSchema = {
    name: String,
    email: String,
    subject: String,
    msg: String,
    date: {},
}
let MainContact = mongoose.model('MainContact', mainContactsSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));





app.get('/', function(req, res) {
    res.render('index');
})
app.post('/', function(req, res) {
    let nDate = new Date();
    let contact = new MainContact({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        msg: req.body.msg,
        date: nDate,

    })
    contact.save();
    console.log(contact);
    res.redirect("/");
})


app.get("/blog-home", function(req, res) {


        BlogPost.find({}, function(err, blogPosts) {
            res.render("blog-index", { blogPosts: blogPosts });
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
        let rtags = (req.body.bTags).split(" ");
        for (let i = 0; i < rtags.length; i++) {
            rtags[i] = _.lowerCase(rtags[i]);
        }
        var day = today.toLocaleDateString("en-US", options);
        if (req.file) {
            console.log(req.file.filename);
            let blogPost = new BlogPost({
                author: _.capitalize(req.body.bName),
                heading: _.capitalize(req.body.bHeading),
                email: req.body.bEmail,
                tags: rtags,
                date: day,
                message: req.body.bMsg,
                comments: [],
                img: req.file.filename, //img is imagename
                likes: 0,
                dislikes: 0,
                time: today.getTime() / 1000,

            });

            blogPost.tags.forEach(function(tag) {
                TaggedPost.find({}, function(err, tagposts) { //taggpost is array of objects
                    tagposts.forEach(function(tagpost) {
                        if (tagpost.tagName === tag) {
                            tagpost.posts.push(blogPost);
                            tagpost.save();
                        }
                    })
                })
                let taggedpost = new TaggedPost({
                    tagName: tag,
                    posts: []
                })
                taggedpost.posts.push(blogPost);
                taggedpost.save();
            })
            blogPost.save();
            res.redirect("/blog-home");
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
    let reqTitlle = (req.params.postName);
    BlogPost.findOne({ heading: reqTitlle }, function(err, post) {
        res.render("singlepost", { post: post });

    });


})

app.post("/singlepost/:postName", function(req, res) {
    let reqTitlle = (req.params.postName);
    BlogPost.findOne({ heading: reqTitlle }, function(err, post) {

        var today = new Date();
        let options = {
            day: "numeric",
            month: "long",
            year: "numeric",
        };
        var day = today.toLocaleDateString("en-US", options);

        let comment = new Comment({
            cAuthor: req.body.name,
            cEmail: req.body.email,
            cDate: day,
            cMsg: req.body.message,
            clikes: 0,
            cdislikes: 0
        });
        comment.save();
        post.comments.push(comment);
        console.log(comment);
        post.save();






        res.redirect("/");


    });
})
app.get('/about', function(req, res) {
    res.render('about');
})




app.post('/likePost', function(req, res) {
    console.log(req.body.btn);
    BlogPost.findOne({ heading: req.body.btn }, function(err, post) {
        if (err) {
            console.log(err);
        } else {
            post.likes = post.likes + 1;
            post.save();
            console.log("likes : " + post.likes);
        }
    })
    console.log("liked");
    res.redirect('/blog-home');
})

app.post('/dislikePost', function(req, res) {
    console.log(req.body.btn);
    BlogPost.findOne({ heading: req.body.btn }, function(err, post) {
        if (err) {
            console.log(err);
        } else {
            post.dislikes = post.dislikes + 1;
            post.save();
            console.log("dislikes : " + post.dislikes);
        }
    })
    res.redirect('/blog-home');
})



app.post('/searchTag', function(req, res) {
    let stagName = _.lowerCase(req.body.query);
    console.log(stagName);
    res.redirect('/tagsshow/' + stagName);
})

app.get('/tagsshow/:tag', function(req, res) {
    let reqTag = req.params.tag;
    TaggedPost.findOne({ tagName: reqTag }, function(err, tag) {
        console.log(tag.posts);
        res.render('tagsshow', { blogPosts: tag.posts, tagName: tag.tagName });
    })

})

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function() {

    console.log("server started Successfully");
})












//tag