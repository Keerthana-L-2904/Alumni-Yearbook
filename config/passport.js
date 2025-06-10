const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Alumni = require("../models/Alumni");

module.exports = (passport) => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const user = await Alumni.findOne({ email });

    if (user && user.isVerified) {
      return done(null, user);
    }
    return done(null, false);
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    Alumni.findById(id, (err, user) => done(err, user));
  });
};
