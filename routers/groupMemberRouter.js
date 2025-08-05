const express = require("express");
const router = express.Router();

const db = require("../config/db");

router.get("", (req, res) => {
  res.status(200).json({ message: "This is group members route" });
});

// TODO 6
// User A adding user B to a group should be friends with B
  // and A should also be in that group

// TODO 7 (Doubt ??)
// User A is friends of user B, so A added B in a group G
  // B is friends of user C, so B added C in the group G
  // A and C are not friends
  // So make them friends

router.post("/add", async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    console.log("Request -- Group & Member details:", groupId + ", " + userId);

    const rowCount = (await db.query(
      `INSERT INTO group_members (group_id, user_id)
      SELECT $1, $2 WHERE EXISTS (
        SELECT 1 FROM groups
        WHERE is_deleted = false AND id = $1
      ) RETURNING *`,
      [groupId, userId]
    )).rowCount;

    if (rowCount == 0) {
      const groupNotFoundError = new Error("Group does not exist!");
      groupNotFoundError.code = "00000";
      throw groupNotFoundError;
    }

    const groupName = (await db.query(
      `SELECT name FROM groups WHERE id = $1`,
      [groupId]
    )).rows[0].name;

    const userEmail = (await db.query(
      `SELECT email FROM users WHERE id = $1`,
      [userId]
    )).rows[0].email;

    // TODO Front-end
    await db.query(
      `INSERT INTO group_activities (performed_by, description, performed_on_user, group_id)
      VALUES ($1, "added" , $1, $2)`,
      [userId, groupId]
    );

    res.status(201).json({
      message: "Member added successfully!",
      groupName,
      userEmail
    });
  } catch (err) {
    console.error("Error adding member:", err.message);

    if (err.code === "23505") {
      res.status(409).json({ message: "User already exists in the group!" });
    } else if (err.code === "00000") {
      res.status(403).json({ message: err.message });
    } else {
      res.status(500).json({ message: "An error occured!" });
    }
  }
});

module.exports = router;
