let express = require('express');
let bodyParser = require('body-parser');
let ejs = require('ejs');
let _ = require('lodash');
let multer = require('multer');;
let app = express();
let upload = multer({ dest: __dirname + '/public/blogpage-assets/img/' });
let mongoose = require('mongoose');
const { post } = require('request');
const passport = require('passport')
const facebookStrategy = require('passport-facebook').Strategy


//mongoose.connect('mongodb://localhost:27017/MEdBlogsDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb+srv://admin-cosmoknight:iamDev1!@cluster0.oxvbw.mongodb.net/MEdBlogsDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());

//let blogPosts = []; //array containing posts
//let contacts = []; //array containing contacts
let title = "MEd Blogs";

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}





let userSchema = {
    userName: String,
    email: String,
    clg: String,
    fbUrl: String,
    posts: Array,
    occ: String,
    password: String,
    interest: Array,
}
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

let commentsSchema = {
    user: Object,
    Author: String,
    Password: String,
    Email: String,
    Date: String,
    Msg: String,
    likes: Number,
    dislikes: Number,
}
const taggedPostSchema = {
    tagName: String,
    posts: Array
}
let contactsSchema = {
    name: String,
    email: String,
    subject: String,
    msg: String,
    date: {},
    //img is imagename
}
let mainContactsSchema = {
    name: String,
    email: String,
    subject: String,
    msg: String,
    date: {},
}
let User = mongoose.model('User', userSchema);
let BlogPost = mongoose.model('BlogPost', blogPostsSchema);
let Comment = mongoose.model('Comment', commentsSchema);
let TaggedPost = mongoose.model('TaggedPost', taggedPostSchema);
let Contact = mongoose.model('Contact', contactsSchema);
let MainContact = mongoose.model('MainContact', mainContactsSchema);







passport.use(new facebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID: "242251471053853",
        clientSecret: "6b7ea030fe77327a4d115b938970f296",
        callbackURL: "https://ronchon-monsieur-17347.herokuapp.com/facebook/callback",
        profileFields: ['id', 'displayName', , 'emails']

    }, // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {
        User.findOne({ email: profile.email }, function(err, user) {
            if (user === null) {
                let newUser = new User({
                    userName: profile.displayName,
                    email: profile.emails[0].value,
                    clg: "",
                    posts: [],
                    occ: "",
                    fbUrl: "",
                    password: "",
                    interest: [],
                })
                newUser.save();
                console.log(newUser);

            }
        })
        console.log(profile.emails[0].value);
        return done(null, profile)
    }));
passport.serializeUser(function(user, done) {
    done(null, user);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    return done(null, user)
})






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
app.get('/msgsend', function(req, res) {
    res.render('msgsend');
})


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
        res.redirect("/msgsend");
    })
    //...................contact route end..........................


//......................compose route begin......................
app.get("/compose", function(req, res) {
    res.render("compose");
})
app.get("/blogadded", function(req, res) {
    res.render("blogadded");
})
app.post("/compose", upload.single('photo'), function(req, res) {
        User.findOne({ email: req.body.bEmail, password: req.body.bPassword }, function(err, user) {
            if (err) {
                console.log(err);
            } else if (user !== null) {
                var today = new Date();
                let options = {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                };
                let rtags = (req.body.bTags).split(" ");
                for (let i = 0; i < rtags.length; i++) {
                    rtags[i] = _.lowerCase(rtags[i]);
                    if (user.interest.indexOf(rtags[i]) === -1) {
                        user.interest.push(rtags[i]);
                    }
                }
                var day = today.toLocaleDateString("en-US", options);
                if (req.file) {
                    console.log(req.file.filename);
                    let blogPost = new BlogPost({
                        author: user.userName,
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
                    user.posts.push(blogPost);

                    user.save();
                    blogPost.save();

                    blogPost.tags.forEach(function(tag) {
                        TaggedPost.findOne({ tagName: tag }, function(err, taggedPost) {
                            if (taggedPost !== null) {
                                taggedPost.posts.push(blogPost);
                                taggedPost.save();
                            } else {
                                let newTp = new TaggedPost({
                                    tagName: tag,
                                    posts: blogPost,
                                })
                                console.log(newTp);
                                newTp.save();
                            }
                        })

                    })
                    res.redirect("/blogadded");
                } else throw 'error';
            } else if (user === null) {
                res.redirect('/notregistered');
            }

        })


        // } 
    })
    //....................compose route ends.............................

app.get("/notregistered", function(req, res) {
    res.render("notregistered");
})

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
        //user->ineterst ,post->tags
        var today = new Date();
        let options = {
            day: "numeric",
            month: "long",
            year: "numeric",
        };
        var day = today.toLocaleDateString("en-US", options);
        User.findOne({ email: req.body.email, password: req.body.password }, function(err, user) {
            if (user !== null) {
                let comment = new Comment({
                    Author: user.userName,
                    Email: req.body.email,
                    Date: day,
                    Msg: req.body.message,
                    likes: 0,
                    dislikes: 0,
                    user: user
                });
                comment.save();
                post.tags.forEach(function(tag) {
                    if (user.interest.indexOf(tag) === -1) {
                        user.interest.push(tag);
                    }
                })
                user.save();
                post.comments.push(comment);
                console.log(comment);
                post.save();
                res.redirect("/singlepost/" + reqTitlle);
            } else {
                res.redirect("/notregistered");
            }


        })





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


app.get('/tagnotfound', function(req, res) {
    res.render("tagnotfound");

})

app.post('/searchTag', function(req, res) {
    let stagName = _.lowerCase(req.body.query);

    res.redirect('/tagsshow/' + stagName);


})

app.get('/tagsshow/:tag', function(req, res) {
    let reqTag = req.params.tag;
    var lfound = 0;

    TaggedPost.findOne({ tagName: reqTag }, function(err, tag) {
        if (err) {
            console.log(lfound);
            res.redirect('/tagnotfound');
        } else if (tag !== null) {

            lfound = 1;
            console.log(tag);
            res.render('tagsshow', { blogPosts: tag.posts, tagName: tag.tagName });
        } else if (tag === null) {
            res.redirect('/tagnotfound');
        }
    })
})
app.get('/userposts/:email', function(req, res) {
    let email = req.params.email;
    User.findOne({ email: email }, function(err, user) {
        if (err) {
            console.log(err);
        } else if (user !== null) {
            res.render('userposts', { blogPosts: user.posts, user: user });

        }
    })
})
app.get('/login', function(req, res) {
    res.render('login');
})
app.get('/loginfailed', function(req, res) {
    res.render('loginfailed');
})
app.get('/auth/facebook', passport.authenticate("facebook", { scope: 'email' }))
app.get('/facebook/callback', passport.authenticate("facebook", {
    successRedirect: '/register',
    failureRedirect: '/loginfailed'
}))




app.get('/register', function(req, res) {
    res.render('register');
})
app.get('/loginsuccess', function(req, res) {
    res.render('loginsuccess');
})
app.post('/register', function(req, res) {
    console.log(req.body.bPassword)
    User.findOne({ email: req.body.bEmail }, function(err, user) {
        if (user !== null) {
            user.fbUrl = req.body.bUrl;
            user.clg = req.body.bedu;
            user.occ = req.body.bocc;
            user.password = req.body.bPassword;
            user.save();
            console.log(user);
        } else res.redirect('/loginfailed');
    })

    res.redirect('/loginsuccess');
})

app.listen(port, function() {
    console.log("server started Successfully");
})


//tag