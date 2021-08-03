require('dotenv').config();
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
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')
const session = require('express-session');

//mongoose.connect('mongodb://localhost:27017/MEdBlogsDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb+srv://admin-cosmoknight:iamDev1!@cluster0.oxvbw.mongodb.net/MEdBlogsDB', { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.set("useCreateIndex", true);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//let blogPosts = []; //array containing posts
//let contacts = []; //array containing contacts
let title = "MEd Blogs";

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}





let userSchema = new mongoose.Schema({
    userName: String,
    email: String,
    clg: String,
    fbUrl: String,
    posts: Array,
    occ: String,
    password: String,
    interest: Array,
    googleId: String,
    facebookId: String,
    registered: {
        type: Boolean,
        default: false
    },
});
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

userSchema.plugin(findOrCreate);


let User = mongoose.model('User', userSchema);


let BlogPost = mongoose.model('BlogPost', blogPostsSchema);
let Comment = mongoose.model('Comment', commentsSchema);
let TaggedPost = mongoose.model('TaggedPost', taggedPostSchema);
let Contact = mongoose.model('Contact', contactsSchema);
let MainContact = mongoose.model('MainContact', mainContactsSchema);




passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://ronchon-monsieur-17347.herokuapp.com/auth/google/register",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log(profile.displayName);
        console.log(profile);
        User.findOrCreate({ googleId: profile.id, email: profile.emails[0].value, userName: profile.displayName, }, function(err, user) {

            return cb(err, user);
        });
    },

));



passport.use(new facebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID: "2637659449874702",
        clientSecret: "4237fadc60a5c810ecb5a4fcdd57bcd7",
        callbackURL: "https://ronchon-monsieur-17347.herokuapp.com/facebook/callback",
        profileFields: ['id', 'displayName', 'emails']

    }, // facebook will send back the token and profile
    function(accessToken, refreshToken, profile, cb) {
        console.log(profile.displayName);
        console.log(profile);

        User.findOrCreate({ facebookId: profile.id, email: profile.emails[0].value, userName: profile.displayName, }, function(err, user) {
            console.log(profile.id);
            return cb(err, user);
        });
    },

));





app.get('/', function(req, res) {
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
    } else {

    }
    res.render('index');
})
app.get("/auth/google",
    passport.authenticate('google', { scope: ["profile", "email"] })
);
app.get("/auth/google/register",
    passport.authenticate('google', { failureRedirect: "/loginfailed" }),
    function(req, res) {
        // Successful authentication, redirect to secrets.
        res.redirect("/register");
    });
app.get("/blog-home", function(req, res) {
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
    } else {

    }

    BlogPost.find({}, function(err, blogPosts) {
        res.render("blog-index", { blogPosts: blogPosts, userName: userName, userEmail: userEmail });
    })

})
app.get('/msgsend', function(req, res) {
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
    } else {

    }
    res.render('msgsend', { userName: userName, userEmail: userEmail });
})
app.get("/contact", function(req, res) {
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
    } else {

    }
    res.render("contact", { userName: userName, userEmail: userEmail });
})
app.get("/compose", function(req, res) {
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
        res.render("compose", { userName: userName, userEmail: userEmail });
    } else {
        res.redirect("/signup");
    }
})
app.get("/blogadded", function(req, res) {
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
    } else {

    }
    res.render("blogadded", { userName: userName, userEmail: userEmail });
})
app.get("/notregistered", function(req, res) {
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
    } else {

    }
    res.render("notregistered", { userName: userName, userEmail: userEmail });
})


app.get("/header", function(req, res) {
    res.render("header", { bTitle: title });
})
app.get('/about', function(req, res) {
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
    } else {

    }
    res.render('about', { userName: userName, userEmail: userEmail });
})


//....................dynamic post route.............................

app.get("/singlepost/:postName", function(req, res) {
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
    } else {

    }
    let reqTitlle = (req.params.postName);
    BlogPost.findOne({ heading: reqTitlle }, function(err, post) {
        res.render("singlepost", { post: post, userName: userName, userEmail: userEmail });

    });


})
app.get('/tagsshow/:tag', function(req, res) {
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
    } else {

    }
    let reqTag = req.params.tag;
    var lfound = 0;

    TaggedPost.findOne({ tagName: reqTag }, function(err, tag) {
        if (err) {
            console.log(lfound);
            res.redirect('/tagnotfound');
        } else if (tag !== null) {

            lfound = 1;
            console.log(tag);
            res.render('tagsshow', { blogPosts: tag.posts, tagName: tag.tagName, userName: userName, userEmail: userEmail });
        } else if (tag === null) {
            res.redirect('/tagnotfound');
        }
    })
})
app.get('/userposts/:email', function(req, res) {
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
    } else {

    }
    let email = req.params.email;
    User.findOne({ email: email }, function(err, user) {
        if (err) {
            console.log(err);
        } else if (user !== null) {
            res.render('userposts', { blogPosts: user.posts, user: user, userName: userName, userEmail: userEmail });

        }
    })
})
app.get('/signup', function(req, res) {
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
    } else {

    }
    res.render('signup', { userName: userName, userEmail: userEmail });
})
app.get('/signout', function(req, res) {
    req.logout();
    res.redirect('/blog-home');
});
app.get('/loginfailed', function(req, res) {
    res.render('loginfailed');
})
app.get('/auth/facebook', passport.authenticate("facebook", { scope: 'email' }))
app.get('/facebook/callback', passport.authenticate("facebook", {
    successRedirect: '/register',
    failureRedirect: '/loginfailed'
}))




app.get('/register', function(req, res) {
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
    } else {

    }

    if (req.isAuthenticated()) {
        if (req.user.registered === true) {
            res.redirect('/loginsuccess')
        } else {
            res.render('register', { userName: userName, userEmail: userEmail });
        }
    } else res.render('signup');
})
app.get('/change-info', function(req, res) {
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
    } else {

    }
    if (req.isAuthenticated()) {
        res.render('register', { userName: userName, userEmail: userEmail });
    } else res.render('signup');
})
app.get('/loginsuccess', function(req, res) {
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
    } else {

    }
    res.render('loginsuccess', { userName: userName, userEmail: userEmail });
})
app.get('/tagnotfound', function(req, res) {
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
    } else {

    }
    res.render("tagnotfound", { userName: userName, userEmail: userEmail });

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

//..................contact route begin........................
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

app.post("/compose", upload.single('photo'), function(req, res) {
        User.findOne({ email: req.user.email }, function(err, user) {
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
                        email: req.user.email,
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


app.post("/singlepost/:postName", function(req, res) {
    let reqTitlle = (req.params.postName);
    let userName = "";
    let userEmail = "";
    if (req.isAuthenticated()) {
        //console.log("->>>>>>>>" + req.user);
        userName = req.user.userName;
        userEmail = req.user.email;
        BlogPost.findOne({ heading: reqTitlle }, function(err, post) {
            //user->ineterst ,post->tags
            var today = new Date();
            let options = {
                day: "numeric",
                month: "long",
                year: "numeric",
            };
            var day = today.toLocaleDateString("en-US", options);
            User.findOne({ email: req.user.email }, function(err, user) {
                if (user !== null) {
                    let comment = new Comment({
                        Author: req.user.userName,
                        Email: req.user.email,
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


    } else {
        res.redirect("/signup")

    }

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

    res.redirect('/tagsshow/' + stagName);


})


app.post('/register', function(req, res) {
    console.log(req.body.bPassword)
    User.findOne({ email: req.user.email }, function(err, user) {
        if (user !== null) {
            user.userName = req.body.bName;
            user.fbUrl = req.body.bUrl;
            user.registered = true;
            user.clg = req.body.bedu;
            user.occ = req.body.bocc;
            user.password = req.body.bPassword;
            user.save();
            console.log(user.userName + " registered");
            res.redirect('/loginsuccess');
        } else {
            res.redirect('/loginfailed')
        }

    })


})

app.listen(port, function() {
    console.log("server started Successfully");
})


//tag