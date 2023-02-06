require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require('express-session');
const passport = require('passport');
const routes = require(__dirname+'/routes.js');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { faker } = require('@faker-js/faker');


const port = process.env.PORT || 3000;
const app = express();
module.exports.app = app;


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
    secret: process.env.SECRET_CLIENT_SESSIONS,
    resave: false,
    saveUninitialized: false,
  }))
app.use(passport.initialize());
app.use(passport.session());


const db = require(__dirname+'/database.js');
passport.use(db.User.createStrategy());
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.email,
      picture: user.picture
    });
  });
});
passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets"
},
function(accessToken, refreshToken, profile, cb) {
  // console.log(profile);
  db.User.findOrCreate({ googleId: profile.id }, 
    {
      name: profile.displayName, 
      picture: profile.photos[0].value, 
      username: profile.emails[0].value}, 
    function (err, user) {
    return cb(err, user);
  });
}
));


db.main().catch(err => console.log(err));
routes.setRoutes(app, db, passport, faker);
app.listen(port, function() {
  console.log("Server listening at http://localhost:"+port);
});
