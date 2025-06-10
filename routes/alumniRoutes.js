const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');
const adminProtect = require('../middleware/authMiddleware'); // Your admin JWT auth

const multer = require('multer');
const passport = require('passport');

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Authentication middleware
const ensureAlumniAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
};

// Public routes
router.post('/registerAlumni', upload.single('collegeId'), alumniController.registerAlumni);
router.get('/api/alumni/statusAlumni', alumniController.checkStatus);

// Google OAuth routes
router.get('/auth/google/alumni',
  passport.authenticate('google-alumni', { scope: ['profile', 'email'] })
);

router.get('/auth/google/alumni/callback',
  passport.authenticate('google-alumni', { 
    failureRedirect: '/index.html?error=auth_failed',  // or custom error
    failureFlash: true 
  }),
  alumniController.googleAuthCallback
);

router.get('/api/alumni/pendingAlumni', adminProtect, alumniController.getPendingApprovals);
router.put('/api/alumni/approveAlumni/:id', adminProtect, alumniController.approveAlumni);
router.put('/api/alumni/rejectAlumni/:id', adminProtect, alumniController.rejectAlumni);



// Authenticated alumni routes
router.get('/api/alumni/me', ensureAlumniAuthenticated, alumniController.getCurrentAlumni);
router.put('/api/alumni/me', ensureAlumniAuthenticated, alumniController.updateAlumniProfile);

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect('/');
  });
});
// Add this to alumniRoutes.js (before module.exports)
router.get('/api/alumni/search', ensureAlumniAuthenticated, alumniController.searchAlumni);
// Add these routes before module.exports
const yearbookUpload = multer({ 
  dest: 'uploads/yearbook/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.post('/api/yearbook/stories', ensureAlumniAuthenticated, alumniController.submitStory);
router.post('/api/yearbook/photos', ensureAlumniAuthenticated, yearbookUpload.single('photo'), alumniController.submitPhoto);
router.get('/api/yearbook/stories', alumniController.getStories);
router.get('/api/yearbook/photos', alumniController.getPhotos);

module.exports = router;