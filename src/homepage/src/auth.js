const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const mysql = require('mysql2/promise');

// ✅ Create database connection pool (reuse your .env values)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

// ✅ GOOGLE STRATEGY
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name = profile.displayName;
    const oauth_id = profile.id;

    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    let user;
    if (users.length > 0) {
      user = users[0];
    } else {
      const [result] = await pool.execute(
        'INSERT INTO users (email, name, oauth_id, provider) VALUES (?, ?, ?, ?)',
        [email, name, oauth_id, 'google']
      );
      user = { id: result.insertId, email, name, provider: 'google' };
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// ✅ FACEBOOK STRATEGY (optional - fill credentials)
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID || 'dummy',
  clientSecret: process.env.FACEBOOK_APP_SECRET || 'dummy',
  callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name', 'displayName']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || `${profile.id}@facebook.com`;
    const name = profile.displayName;
    const oauth_id = profile.id;

    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    let user;
    if (users.length > 0) {
      user = users[0];
    } else {
      const [result] = await pool.execute(
        'INSERT INTO users (email, name, oauth_id, provider) VALUES (?, ?, ?, ?)',
        [email, name, oauth_id, 'facebook']
      );
      user = { id: result.insertId, email, name, provider: 'facebook' };
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// ✅ SERIALIZATION
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
