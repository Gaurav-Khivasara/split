const frontendLink = process.env.FRONTEND_LINK;
const frontendPort = process.env.FRONTEND_PORT;

const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get("",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${frontendLink}:${frontendPort}/login/failure` }),
  (req, res) => {
    const { user, token } = req.user;
    // res.json({ token, user });
    res.redirect(frontendLink + ":" + frontendPort + "/?token=" + token);
  }
);

module.exports = router;
