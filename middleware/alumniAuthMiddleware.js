const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { VerifiedAlumni } = require('../models/Alumni');

// Verify environment variables are loaded
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials in environment variables');
}


passport.use('google-alumni', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/google/alumni/callback', // Must match Google Cloud Console
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      return done(null, {
        provider: 'google',
        id: profile.id,
        email: profile.emails[0].value.toLowerCase(),
        name: profile.displayName
      });
    } catch (err) {
      return done(err);
    }
  }
));

// Serialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});