require('dotenv').config();

if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('FATAL ERROR: GOOGLE_CLIENT_ID is not defined.');
  process.exit(1);
}

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const path = require('path');

const adminRoutes = require('./routes/adminRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const { ensureAlumniAuthenticated } = require('./middleware/alumniAuthMiddleware');

const app = express();

// ✅ Database connection
mongoose.connect('mongodb://localhost:27017/alumniDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Apply `express-session` BEFORE Passport
app.use(session({
    secret: 's0m3SuPer$ecreT!123', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(session({
    secret: 's0m3SuPer$ecreT!123',
    resave: false,
    saveUninitialized: false, // Changed to false for security
    cookie: { 
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use((req, res, next) => {
  // Security headers
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Content-Type-Options': 'nosniff'
  });
  next();
});

// Add this route for clearing session
app.get('/clear-session', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// ✅ API Routes
  app.use('/', alumniRoutes); // Mount at root level
app.use('/api/admin', adminRoutes);
app.use('/admin/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/yearbook', express.static(path.join(__dirname, 'uploads/yearbook')));

// ✅ Serve static frontend
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Ensure middleware is properly loaded
require('./middleware/alumniAuthMiddleware');

