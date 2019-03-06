const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');

// Image Model
const Image = require('../models/Image');
// User Model
const User = require('../models/User');

// Nav
router.get('/nav', (req, res, next) => {
  res.render('nav', {
    authenticated: ensureAuthenticated
  })
});

// Welcome Page
router.get('/', (req, res, next) => res.render('welcome'));

// Dashbaord
router.get('/dashboard', ensureAuthenticated, (req, res, next) =>
  Image.find({author: req.user.name}, (err, images) => {
    res.render('dashboard', {
      name: req.user.name,
      date: req.user.date,
      images: images
  })
  }));

// Gallery
router.get('/gallery', (req, res, next) => {
  Image.find({}, (err, images) => {
    res.render('gallery', {images: images});
  });
});

// Gallery Post New Image
router.get('/gallery/new', ensureAuthenticated, (req, res, next) => {
  res.render('new');
});

// Gallery Handler
router.post('/gallery/new', ensureAuthenticated, (req, res, next) => {
  const {title, url} = req.body;
  const author = req.user.name;
  const date = new Date;
  let errors = [];

  // Check required form fields
  if (!title || !url || !author) {
    errors.push({msg: 'Please fill in all fields'});
  }

  if (errors.length > 0) {
    res.render('new', {
      errors,
      title,
      url,
      author
    });
  } else {
    // Validation passed
    Image.findOne({url: url})
      .then(image => {
        if (image) {
          // Url exists in the database
          errors.push({msg: 'This image has already been posted'});
          res.render('new', {
            errors,
            title,
            url,
            author
          });
        } else {
          const newImage = new Image({
            title,
            url,
            author,
            date
          });
          newImage.save()
            .then(url => {
              req.flash('success_msg', 'You have posted a new image');
              res.redirect('/gallery');
            })
            .catch(err => console.log(err));
        }
      })
  }
});
module.exports = router;
