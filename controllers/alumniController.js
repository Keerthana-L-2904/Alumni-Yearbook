const { PendingAlumni, VerifiedAlumni } = require('../models/Alumni');
const { YearbookStory, YearbookPhoto } = require('../models/Yearbook');
exports.registerAlumni = async (req, res) => {
  try {
    const { name, email, phone, occupation, company, graduationYear } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        message: 'College ID is required',
        error: true
      });
    }
    if (!req.body.email || !req.body.name) {
      return res.status(400).json({
        message: 'Name and email are required',
        error: true
      });
    }
    // Check for duplicate email
    const existingPending = await PendingAlumni.findOne({ email });
    const existingVerified = await VerifiedAlumni.findOne({ email });
    
    if (existingPending || existingVerified) {
      return res.status(400).json({ 
        message: 'Email already registered',
        error: true
      });
    }
    // Create new alumni
    const newAlumni = new PendingAlumni({ 
      ...req.body, 
      collegeIdPath: req.file.path 
    });
    await newAlumni.save();
    
    // Send proper response
    return res.status(201).json({ 
      message: 'Registration submitted for admin approval',
      status: 'pending',
      alumniId: newAlumni._id, // Add concrete data to verify reception
      error: false,
      success:true
    });
    
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ 
      message: err.message,
      error: true,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingAlumni = await PendingAlumni.find({
      isVerified: false // ONLY those not yet handled
    });
    res.json(pendingAlumni);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.approveAlumni = async (req, res) => {
  try {
    const pendingAlumni = await PendingAlumni.findById(req.params.id);
    if (!pendingAlumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    const verifiedAlumni = new VerifiedAlumni({
      ...pendingAlumni.toObject(),
      isVerified: true,
      isApproved: true,
      isRejected: false,
      _id: pendingAlumni._id
    });
    await verifiedAlumni.save();

    await PendingAlumni.findByIdAndDelete(req.params.id);

    res.json({ message: 'Alumni approved and verified', alumni: verifiedAlumni });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.rejectAlumni = async (req, res) => {
  try {
    const alumni = await PendingAlumni.findById(req.params.id);
    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    alumni.isRejected = true;
    alumni.isVerified = true; // Admin has reviewed
    alumni.isApproved = false; // Explicitly mark not approved

    await alumni.save();

    res.json({ message: 'Alumni rejected' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.googleAuthCallback = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.redirect('/alumniLogin.html?error=auth_failed');
    }

    const alumni = await VerifiedAlumni.findOne({ email: req.user.email });
    if (!alumni) {
      req.logout();
      return res.redirect('/alumniLogin.html');
    }

    // Successful authentication
    return res.redirect('/alumni/alumniDashboard.html');
  } catch (err) {
    console.error('Google auth callback error:', err);
    return res.redirect('/alumniLogin.html?error=server_error');
  }
};

exports.getCurrentAlumni = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const alumni = await VerifiedAlumni.findOne({ email: req.user.email });
    if (!alumni) {
      return res.status(403).json({ error: 'Not a verified alumni' });
    }

    res.json({
      id: alumni._id,
      name: alumni.name,
      email: alumni.email,
      phone: alumni.phone,
      occupation: alumni.occupation,
      company: alumni.company,
      graduationYear: alumni.graduationYear,
      // Add other fields you want to expose
    });
  } catch (err) {
    console.error('Get current alumni error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.checkStatus = async (req, res) => {
  try {
    const email = req.query.email;

    const verified = await VerifiedAlumni.findOne({ email });
    if (verified) {
      return res.json({
        isVerified: true,
        isRejected: false,
        isApproved: true
      });
    }

    const pending = await PendingAlumni.findOne({ email });
    if (pending) {
      return res.json({
        isVerified: pending.isVerified || false,
        isRejected: pending.isRejected || false,
        isApproved: pending.isApproved || false
      });
    }

    res.status(404).json({ message: 'Alumni not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  
};
// Add this to alumniController.js
exports.logoutAlumni = async (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.redirect('/');
    });
  });
};
// Add this to alumniController.js
exports.updateAlumniProfile = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, phone, occupation, company, graduationYear } = req.body;
    
    // Find the alumni by email (from authenticated user)
    const alumni = await VerifiedAlumni.findOne({ email: req.user.email });
    
    if (!alumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    // Update editable fields (excluding email and college ID)
    alumni.name = name || alumni.name;
    alumni.phone = phone || alumni.phone;
    alumni.occupation = occupation || alumni.occupation;
    alumni.company = company || alumni.company;
    alumni.graduationYear = graduationYear || alumni.graduationYear;

    await alumni.save();

    res.json({ 
      message: 'Profile updated successfully',
      alumni: {
        id: alumni._id,
        name: alumni.name,
        email: alumni.email,
        phone: alumni.phone,
        occupation: alumni.occupation,
        company: alumni.company,
        graduationYear: alumni.graduationYear
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add this to alumniController.js
exports.searchAlumni = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { phone, year, name, email } = req.query;
    let query = {};

    if (phone) query.phone = { $regex: phone, $options: 'i' };
    if (year) query.graduationYear = year;
    if (name) query.name = { $regex: name, $options: 'i' };
    if (email) query.email = { $regex: email, $options: 'i' };

    // Only return basic info (exclude sensitive data)
    const results = await VerifiedAlumni.find(query, {
      name: 1,
      email: 1,
      phone: 1,
      occupation: 1,
      company: 1,
      graduationYear: 1,
      _id: 0
    }).limit(50); // Limit results to prevent abuse

    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error during search' });
  }
};

// Add these methods to alumniController.js
exports.submitStory = async (req, res) => {
  try {
    const { name, graduationYear, title, story } = req.body;
    
    // Save to database (you'll need to create a YearbookStory model)
    const newStory = new YearbookStory({
      name,
      graduationYear,
      title,
      story,
      submittedBy: req.user._id,
      createdAt: new Date()
    });
    
    await newStory.save();
    
    res.status(201).json({ 
      message: 'Story submitted successfully',
      story: newStory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Photo is required' });
    }
    
    const { name, batch, description } = req.body;
    
    // Save to database (you'll need to create a YearbookPhoto model)
    const newPhoto = new YearbookPhoto({
      name,
      batch,
      description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      submittedBy: req.user._id,
      createdAt: new Date()
    });
    
    await newPhoto.save();
    
    res.status(201).json({ 
      message: 'Photo submitted successfully',
      photo: newPhoto
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStories = async (req, res) => {
  try {
    const stories = await YearbookStory.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPhotos = async (req, res) => {
  try {
    const photos = await YearbookPhoto.find().sort({ createdAt: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};