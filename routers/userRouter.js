const express = require("express");
const router = express.Router();

// const bcrypt = require("bcrypt");
const db = require("../config/db");

router.get("", (req, res) => {
  res.status(200).json({ message: "This is users route" });
});

router.get("/get-by-token", async (req, res) => {
  try {
    const user = (await db.query(
      `SELECT id, name, email, avatar FROM users WHERE id = $1`,
      [req.user.id]
    )).rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    
    res.status(500).json({ message: "An error occured!" });
  }
});

module.exports = router;
