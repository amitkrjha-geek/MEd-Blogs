let express = require('express');
let bodyParser = require('body-parser');
let ejs = require('ejs');
let _ = require('lodash');
let multer = require('multer');;
let app = express();
let upload = multer({ dest: __dirname + '/public/blogpage-assets/img/' });
let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/MEdBlogsDB', { useNewUrlParser: true, useUnifiedTopology: true });

// mongoose.connect('mongodb+srv://admin-cosmoknight:iamDev1!@cluster0.oxvbw.mongodb.net/MEdBlogsDB', { useNewUrlParser: true, useUnifiedTopology: true });

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
}
let BlogPost = mongoose.model('BlogPost', blogPostsSchema);


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
        var day = today.toLocaleDateString("en-US", options);
        if (req.file) {
            console.log(req.file.filename);
            let blogPost = new BlogPost({
                author: req.body.bName,
                heading: req.body.bHeading,
                email: req.body.bEmail,
                tags: (req.body.bTags).split(" "),
                date: day,
                message: req.body.bMsg,
                comments: [],
                img: req.file.filename, //img is imagename
                likes: 0,
                dislikes: 0,

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
    let reqTitlle = (req.params.postName);
    BlogPost.findOne({ heading: reqTitlle }, function(err, post) {
        res.render("singlepost", { post: post });

    });


})

app.post("/singlepost/:postName", function(req, res) {
    let reqTitlle = (req.params.postName);
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
app.get('/tagsshow', function(req, res) {
    res.render('tagsshow');
})
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}




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
    res.redirect('#');
})

// app.post('/dislikeComment', function(req, res) {
//     console.log(req.body.btn);
//     BlogPost.findOne({ comments.cMsg: req.body.btn }, function(err, post) {
//         if (err) {
//             console.log(err);
//         } else {
//             post.dislikes = post.dislikes + 1;
//             post.save();
//             console.log("dislikes : " + post.dislikes);
//         }
//     })
//     res.redirect('#');
// })


app.listen(port, function() {
    console.log("server started Successfully");
})