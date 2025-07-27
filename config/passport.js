const link = process.env.LINK;
const port = process.env.PORT;

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
const jwt = require('jsonwebtoken');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${link}:${port}/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id: googleId, displayName, emails: [email] } = profile;

        const existingUser = await db.query(
          `SELECT * FROM users WHERE google_id = $1`,
          [googleId]
        );

        let user;
        if (existingUser.rowCount == 0) {
          const newUser = await db.query(
            `INSERT INTO users (name, email, google_id)
            VALUES ($1, $2, $3) RETURNING *`,
            [displayName, email, googleId]
          );

          user = newUser.rows[0];
        }

        user = existingUser.rows[0];

        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '1d' }
        );

        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );

    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});
