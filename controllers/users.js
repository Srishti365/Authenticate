const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const randomstring = require('randomstring');

// Load User model
const models = require('../models/User');
User = models.User;
const { forwardAuthenticated } = require('../config/auth');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'email here',
    pass: 'password here'
  }
});



module.exports = {
  signUp: async (req, res, next) => {

    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please enter all fields' });
    }

    var passw = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/;
    if (!password.match(passw)) {
      errors.push({ msg: 'Password must have 1 upper case character and a digit' });
    }

    if (password != password2) {
      errors.push({ msg: 'Passwords do not match' });
    }



    if (errors.length > 0) {
      res.render('register', {
        errors,
        name,
        email,
        password,
        password2
      });
    } else {
      const foundUser = await User.findOne({ "email": email });
      if (foundUser) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      }
      else {
        const secretToken = randomstring.generate();
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const active = true;

        const newUser = await new User({
          name: name,
          email: email,
          password: hash,
          secretToken: secretToken,
          active: active
        });



        const html = `Hi there,
            Thank you for registering!!
            
            Please verify your email.
            On the following page:
            http://localhost:5000/users/verify?token=${secretToken}&email=${email}
            Have a pleasant day.`

        const mailOptions = {
          from: 'email here',
          to: email,
          subject: 'Please verify your email',
          text: html
        };

        await transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent' + info.response);
          }
        });

        newUser
          .save()
          .then(user => {
            req.flash(
              'success_msg',
              'You are now registered and can log in'
            );
            res.redirect('/users/login');
          })


      }
    }

  },
  verify: async (req, res, next) => {
    token = req.query.token;
    email = req.query.email;
    const foundUser = await User.findOne({ "email": email });
    if (foundUser.active == true) {
      req.flash(
        'error_msg',
        'You have already verified it...'
      );
      res.redirect('/users/login');
    }

    foundUser.active = true;
    foundUser.secretToken = ''
    foundUser.save();

    res.redirect('/users/login');

  },
  forgotPassword: async (req, res, next) => {
    const email = req.body.email;
    console.log(email);
    let errors = [];
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      errors.push({ msg: 'Please enter valid email..' });
      res.render('forgotPassword', {
        errors
      });
    } else {
      const html = `Hi there,

            Please update your password.
            On the following page:
            http://localhost:5000/users/update?email=${email}
            Have a pleasant day.`

      const mailOptions = {
        from: 'projectrasoise@gmail.com',
        to: email,
        subject: 'Please check your email',
        text: html
      };

      await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent' + info.response);
        }
      });

      let success_msg = 'Please check your email..';

      res.render('forgotPassword', {
        success_msg
      })


    }



  },
  update: async (req, res, next) => {
    const email = req.query.email;

    const { password, password2 } = req.body;
    let errors = [];

    var passw = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/;
    if (!password.match(passw)) {
      errors.push({ msg: 'Incorrect Password' });
    }

    if (password != password2) {
      errors.push({ msg: 'Passwords do not match' });
    }

    if (errors.length > 0) {
      res.render('update', {
        errors
      });
    } else {

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      await User.findOneAndUpdate({ 'email': email }, {
        $set: { 'password': hash }
      }, function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
      });

      res.redirect('/users/login');


    }
  },

}