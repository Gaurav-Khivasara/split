const frontendLink = process.env.FRONTEND_LINK;
const frontendPort = process.env.FRONTEND_PORT;

const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.get("",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${frontendLink}:${frontendPort}/login/failure` }),
  (req, res) => {
    // const { user } = req.user;
    // res.json({ token, user });
    const token = jwt.sign(
      { id: req.user.id, name: req.user.name, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(frontendLink + ":" + frontendPort + "/auth/callback?token=" + token);
  }
);

module.exports = router;
