// require("dotenv").config();
// let secrete = process.env.SECRETE;

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const bcrypt = require ("bcrypt");
const saltRounds = 10;

const app = express();

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


// DATABASE CONNECTION
// URI
const uri = "mongodb+srv://Admin-Avis:Password123@db1.s2pl8.mongodb.net/auth-level-2";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});



const User = mongoose.model("User", userSchema);

//------- Home Route--------//
app.route("/")
.get(function(req, res){
  let body =  new Body("", "", "Home");
  res.render("home", {body:body});
})


//------- Login Route--------//
app.route("/login")
.get(function(req, res){
  let body =  new Body("", "", "Login");
  res.render("login", {body:body});
})
.post(function(req,res){
  let body =  new Body("", "", "Login");
  let password = req.body.password;
  let email = req.body.email;
  User.findOne({email:email}, {}, function(err, foundUser) {
    console.log(foundUser);
    console.log(err);
    if(!err){
      if(foundUser){
        bcrypt.compare(password, foundUser.password, function(err, result){
          if (result) {
            body.message = "Login Successful";
            body.title = "Secrete";
            res.render("secretes", {body:body});
          }else{
            body.error = "Invalid username or password";
            res.render("login",{body:body});
          }
        });
      }
    }else{
      console.log(err);
      body.error = err;
      res.render("login", {body:body})
    }
  })
})


//------- Register Route--------//
app.route("/register")
.get(function(req,res){
  let body =  new Body("", "", "Register");
  res.render("register", {body:body});
})
.post(function(req, res){
  let body =  new Body("", "", "Register");
  bcrypt.hash(req.body.password, saltRounds, function(err,hash){
    const newUser = new User({
      email: req.body.email,
      password: hash
    });

    newUser.save(function(err,savedUser){
      if(!err){
        body.message = "Successfully Registered";
        res.render("secretes", {body:body});
      }else{
        body.error = err;
        res.render("register", {body:body});
      }
    });
  })

})



// app.route("/secretes")
// .get(function(req, res){
//   let body = {
//     error: "",
//     message: "",
//     title: "Secretes"
//   }
//   res.render("secretes", {body:body});
// })


function Body(error, message, title){
  this.error = error;
  this.message = message;
  this.title = title;
}

app.listen(3000, function(){
  console.log("Whisper running on 3000");
})
