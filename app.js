require("dotenv").config();
const clientSecrete = process.env.CLIENT_SECRETE;
const clientID = process.env.CLIENT_ID;

const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

//Authentication & Session Management
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// GoogleStrategy Authentication
const GoogleStrategy = require('passport-google-oauth20').Strategy;


app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//Authentication & Session Management Config
app.use(session({secret:"My nig secret",resave:false, saveUninitialized:false}));
app.use(passport.initialize());
app.use(passport.session());


// DATABASE CONNECTION
// URI
const uri = "mongodb+srv://Admin-Avis:Password123@db1.s2pl8.mongodb.net/auth-level-3";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String
});

// Tell the Schema to use the passportLocalMongoose plugin
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
//Serialize implementation
passport.serializeUser(function(user, done) {
  done(null, user);
});
//deserialize implementation
passport.deserializeUser(function(user, done) {
  done(null, user);
});

//telling passport to use GoogleStrategy
passport.use(new GoogleStrategy({
    clientID: clientID,
    clientSecret: clientSecrete,
    callbackURL: "http://localhost:3000/auth/google/secretes",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

//------- Home Route--------//
app.route("/")
.get(function(req, res){
  let body =  new Body("", "", "Home");
  res.render("home", {body:body});
})

app.route("/secretes")
.get(function(req,res){
  const body = new Body("","","Secretes")
  if(req.isAuthenticated()){
    body.message = "Session Active"
    res.render("secretes", {body:body});
  }else{
    body.error = "Session Expired please login"
    res.render("login", {body:body});
  }
})

//------- Login Route--------//
app.route("/login")
.get(function(req, res){
  if(req.isAuthenticated()){
    const body = new Body("","","Secretes")
    body.message = "Session Active"
    res.render("secretes", {body:body});
  }else{
    const body =  new Body("", "", "Login");
    res.render("login", {body:body});
  }
})
.post(function(req,res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })
  req.login(user, function(err){
    if(err){
      console.log(err);
      res.render("login", {body:new Body(err,"","Login")})
    }else{
      passport.authenticate("local")(req,res, function(){
        res.render("secretes", {body:new Body(err,"Login Successful","Secretes")})
      });
    }
  })

})


//------- Register Route--------//
app.route("/register")
.get(function(req,res){
  if(req.isAuthenticated()){
    const body = new Body("","","Secretes")
    body.message = "Session Active"
    res.render("secretes", {body:body});
  }else{
    let body =  new Body("", "", "Register");
    res.render("register", {body:body});
  }
})
.post(function(req, res){
  const body = new Body("","Registered Successfully","Secret");
  User.register({username: req.body.username}, req.body.password, function(err,user){
    if(err){
      console.log(err);
      body.title = "Register";
      body.error = err;
      res.render("register", {body:body});
    }else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secretes");
      })
    }
  });

})


app.route("/logout")
.get(function(req,res){
  req.logout();
  res.render("home", {body:new Body("","Logout Successful","Home")})
});



app.route("/auth/google")
.get(
  passport.authenticate("google", {scope:["profile"]} )
);


app.route("/auth/google/secretes")
.get(
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect user page.
    console.log("Logged IN");
    res.render('secretes', {body:new Body("","Google Authentication Successful", "Secretes")});
  }
);



function Body(error, message, title){
  this.error = error;
  this.message = message;
  this.title = title;
}

app.listen(3000, function(){
  console.log("Whisper running on 3000");
});
