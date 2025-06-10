const Admin = require('../models/Admin');
const Alumni = require('../models/Alumni'); // adjust path as needed

const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// Register Admin
exports.registerAdmin = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const newAdmin = new Admin({ name, email, phone, password });
    await newAdmin.save();

    const token = generateToken(newAdmin._id);

    res.status(201).json({
      token,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login Admin
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id);

    res.status(200).json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 

// Add this to adminController.js
exports.logoutAdmin = async (req, res) => {
  try {
    // In a real app, you might want to implement token blacklisting here
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Get Admin Profile
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password'); // exclude password
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.getPending = async (req, res) => {
  const pending = await Alumni.find({ isVerified: false, isRejected: false });
  res.json(pending);
};

exports.updateStatus = async (req, res) => {
  const { email, approve } = req.body;

  const updated = await Alumni.findOneAndUpdate(
    { email },
    {
      isVerified: approve,
      isRejected: !approve
    },
    { new: true }
  );

  res.json(updated);
};
exports.updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const { name, email, phone, password } = req.body;

    // Update fields if they exist in the request
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;
    if (password) admin.password = password;

    const updatedAdmin = await admin.save();

    res.status(200).json({
      admin: {
        id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        phone: updatedAdmin.phone,
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

