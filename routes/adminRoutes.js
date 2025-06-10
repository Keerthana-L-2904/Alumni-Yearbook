const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getAdminProfile, getPending, updateStatus, updateAdminProfile } = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const { News, Event } = require('../models/NewsEvent');

// Routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/profile', protect, getAdminProfile); // protected route
router.get('/pending', getPending);
router.post('/verify', updateStatus);
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});
router.put('/profile', protect, updateAdminProfile);
router.post('/news', protect, async (req, res) => {
  try {
    const { title, content } = req.body;
    const news = new News({
      title,
      content,
      createdBy: req.user.id
    });
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/events', protect, async (req, res) => {
  try {
    const { title, content, eventDate } = req.body;
    const event = new Event({
      title,
      content,
      eventDate,
      createdBy: req.user.id
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/news', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 }).limit(5);
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/events', async (req, res) => {
  try {
    const events = await Event.find({ eventDate: { $gte: new Date() } })
      .sort({ eventDate: 1 })
      .limit(5);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
module.exports = router;