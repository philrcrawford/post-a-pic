const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {ensureAuthenticated} = require('../config/auth');


// User Model
const User = require('../models/User');
// Image Model
const Image = require('../models/Image');

// Login Page
router.get('/login', (req, res, next) => {
  res.render('login');
});

// Register
router.get('/register', (req, res, next) => {
  res.render('register');
});

// Register Handle
router.post('/register', (req, res, next) => {
  const { name, email, password, password2 } = req.body;
  const date = new Date;
  let errors = [];

  // Check required form fields
  if (!name || !email || !password || !password2) {
    errors.push({msg: 'Please fill in all fields'});
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({msg: 'Passwords do not match'});
  }

  // Check password length
  if (password.length < 8) {
    errors.push({msg: 'Password must be at least 8 characters'});
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
    // Validation passed
    User.findOne({email: email})
      .then(user => {
        if (user) {
          // User exists in the database
          errors.push({msg: 'Email is already registerd'});
          res.render('register', {
            errors,
            name,
            email,
            password,
            password2
          });
        } else {
          const newUser = new User({
            name,
            email,
            password,
            date
          });
          // Hash Password
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              // Set password to hashed
              newUser.password = hash;
              // Save user
              newUser.save()
                .then(user => {
                  req.flash('success_msg', 'You are now registered and can log in');
                  res.redirect('/users/login');
                })
                .catch(err => console.log(err));
          }));
        }
      })
  }
});

// Update User Info
router.get('/update', ensureAuthenticated, (req, res, next) => {
  User.find({name: req.user.name}, (err, user) => {
    res.render('update', {
      name: req.user.name,
      email: req.user.email
    });
  })
});

// Update User Handle
router.patch('/update', (req, res, next) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Check required form fields
  if (!name || !email || !password || !password2) {
    errors.push({msg: 'Please fill in all fields'});
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({msg: 'Passwords do not match'});
  }

  // Check password length
  if (password.length < 8) {
    errors.push({msg: 'Password must be at least 8 characters'});
  }

  if (errors.length > 0) {
    res.render('update', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    // Validation passed
    User.find({email: email})
      .then(users => {
        if (users.length > 1) {
          // User exists in the database
          errors.push({msg: 'Email is already registerd'});
          res.render('update', {
            errors,
            name,
            email,
            password,
            password2
          });
        } else {
          User.update({email: email}, {
            name,
            email,
            password
          });
          // Hash Password
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              // Set password to hashed
              newUser.password = hash;
              // Save user
              newUser.save()
                .then(user => {
                  req.flash('success_msg', 'You are now registered and can log in');
                  res.redirect('/dashboard');
                })
                .catch(err => console.log(err));
          }));
        }
      })
  }
});

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res, next) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
