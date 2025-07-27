const link = process.env.LINK;
const port = process.env.PORT;

const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${link}:${port}` }),
  (req, res) => {
    const { user, token } = req.user;
    res.json({ token, user });
  }
);

module.exports = router;
