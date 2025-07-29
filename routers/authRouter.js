const frontendLink = process.env.FRONTEND_LINK;
const frontendPort = process.env.FRONTEND_PORT;

const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${frontendLink}:${frontendPort}` }),
  (req, res) => {
    const { user, token } = req.user;
    res.json({ token, user });
  }
);

module.exports = router;
