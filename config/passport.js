const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("./db");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id: googleId, displayName, emails: [{ value: email }], photos: [{ value: avatar }] } = profile;

        const existingUser = await db.query(
          `SELECT * FROM users WHERE google_id = $1`,
          [googleId]
        );

        let user = existingUser.rows[0];
        if (existingUser.rowCount == 0) { // if (!user) {
          const newUser = await db.query(
            `INSERT INTO users (name, email, google_id, avatar)
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [displayName, email, googleId, avatar]
          );

          user = newUser.rows[0];
        }

        // const token = jwt.sign(
        //   { id: user.id, email: user.email },
        //   process.env.JWT_SECRET,
        //   { expiresIn: "1d" }
        // );

        // return done(null, { user, token });
        console.log("User id:", user.id);
        return done(null, user);
      } catch (err) {
        console.log("Error during auth:", err);
        return done(err, null);
      }
    }
  )
);

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const result = await db.query(
//       `SELECT * FROM users WHERE id = $1`,
//       [id]
//     );

//     done(null, result.rows[0]);
//   } catch (err) {
//     done(err, null);
//   }
// });
