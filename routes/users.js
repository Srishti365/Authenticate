const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const randomstring = require('randomstring');
const transporter = require('../config/keys');
const UsersController = require('../controllers/users');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));
router.get('/x', forwardAuthenticated, (req, res) => res.render('login2'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', UsersController.signUp);


router.get('/verify', UsersController.verify);

router.get('/forgotPassword', (req, res) => res.render('forgotPassword'));

router.post('/forgotPassword', UsersController.forgotPassword);

router.get('/update', (req, res) => res.render('update', { email: req.query.email }));

router.post('/update', UsersController.update);


// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
