// // TODO 0
// // payments table in DB and its logic

require("dotenv").config();
const serverLink = process.env.SERVER_LINK;
const serverPort = process.env.SERVER_PORT;
const frontendLink = process.env.FRONTEND_LINK;
const frontendPort = process.env.FRONTEND_PORT;

const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const cors = require("cors");
app.use(cors({
  origin: `${frontendLink}:${frontendPort}`,
}));

app.use(passport.initialize());
require("./config/passport");

const authRouter = require("./routers/authRouter");
app.use("/auth/google", authRouter);

const apiRouters = require("./routers/apiRouters");
app.use("/api", (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT middleware auth error:", err);

    res.status(401).json({ message: "Missing or Invalid token!" });
  }
}, apiRouters);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found!" })
});

const cyanANSI = "\x1b[36m";
const boldANSI = "\x1b[1m";
const endANSI = "\x1b[0m";
app.listen(serverPort, () => {
  console.log(boldANSI + "Local:\t" + endANSI + cyanANSI + serverLink + ":" + boldANSI + serverPort + endANSI);
});
// server/index.js
// --- Required Modules ---

// const express = require('express');
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// const { Pool } = require('pg'); // PostgreSQL client

// --- Application Setup ---
// const app = express();
// const PORT = 3000;

// require("dotenv").config();
// --- Configuration (Replace with your own credentials) ---
// It's highly recommended to use environment variables for these
// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const JWT_SECRET = 'your_super_secret_jwt_key_that_is_long_and_random';
// const FRONTEND_URL = 'http://localhost:5173'; // Your React app's URL

// --- Database Connection ---
// Ensure you have a PostgreSQL server running and have created a database.
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

/*
  SQL to create the users table:
  
  CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

*/

// --- Middleware ---
// app.use(cors({ origin: FRONTEND_URL })); // Allow requests from our React app
// app.use(passport.initialize());

// --- Passport.js Configuration ---
// passport.use(new GoogleStrategy({
//   clientID: GOOGLE_CLIENT_ID,
//   clientSecret: GOOGLE_CLIENT_SECRET,
//   callbackURL: `/auth/google/callback` // The URL Google will redirect to
// },
  // async (accessToken, refreshToken, profile, done) => {
    // This function is called after successful authentication with Google.
    // 'profile' contains the user's Google profile information.
    // const { id, displayName, emails, photos } = profile;
    
    // const email = emails[0].value;
    // const avatar = photos[0].value;
    
    // try {
      // Check if the user already exists in our database
      // let userResult = await pool.query('SELECT * FROM users WHERE google_id = $1', [id]);
      // let user = userResult.rows[0];

      // if (!user) {
        // If the user doesn't exist, create a new one
        // const newUserResult = await pool.query(
        //   'INSERT INTO users (name, email, google_id, avatar) VALUES ($1, $2, $3, $4) RETURNING *',
        //   [displayName, email, id, avatar]
        // );
        // user = newUserResult.rows[0];
      //   console.log('New user created:', user);
      // } else {
      //   console.log('User already exists:', user);
      // }

      // Pass the user object to the next step in the auth process
    //   return done(null, user);
    // } catch (err) {
    //   console.error('Database error during authentication:', err);
    //   return done(err, null);
    // }
//   }
// ));

// --- Authentication Routes ---

// 1. Initial Login Route
// This route starts the Google OAuth flow.
// Passport redirects the user to Google's login page.
// app.get('/auth/google',
//   passport.authenticate('google', {
//     scope: ['profile', 'email'], // We request access to profile and email info
//     session: false // We are using JWTs, not sessions
//   })
// );

// 2. Google Callback Route
// Google redirects the user back to this URL after they log in.
// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/', session: false }),
//   (req, res) => {
//     // At this point, `req.user` is populated by Passport with the user's data from our DB.

//     // We create a JWT for the user.
//     const payload = {
//       id: req.user.id,
//       name: req.user.name,
//       email: req.user.email,
//     };

//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1m' });

//     // Redirect the user back to the React app, passing the token as a URL parameter.
//     res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
//   }
// );


// --- Protected API Route ---

// Middleware to verify JWT
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

//   if (!token) {
//     return res.sendStatus(401); // Unauthorized
//   }

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.sendStatus(403); // Forbidden (invalid token)
//     }
//     req.user = user;
//     next();
//   });
// };


// This route is protected. Only users with a valid JWT can access it.
// app.get('/api/profile', verifyToken, async (req, res) => {
//   try {
//     // The user's ID is available from the decoded token in `req.user`
//     const userResult = await pool.query('SELECT id, name, email, avatar FROM users WHERE id = $1', [req.user.id]);
//     const user = userResult.rows[0];
    
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//     res.json({ user });
    
//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


// --- Server Start ---
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on http://localhost:${PORT}`);
// });
