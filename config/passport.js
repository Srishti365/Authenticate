const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const GoogleStrategy = require('passport-google-oauth20');
const facebookStrategy = require("passport-facebook");

// Load User model
const models = require('../models/User');
User = models.User;

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        if(user.active == false){
          return done(null, false, { message: 'Please Verify your email first!!'});
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};


// passport.use(new GoogleStrategy({

// }),() => {
  
// })