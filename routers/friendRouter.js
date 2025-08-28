const serverLink = process.env.SERVER_LINK;
const serverPort = process.env.SERVER_PORT;

const express = require("express");
const router = express.Router();

const db = require("../config/db");
const sendMail = require("../config/email");

router.get("", (req, res) => {
  res.status(200).json({ message: "This is friends route" });
});

router.post("/add", async (req, res) => {
  try {
    const sentBy = req.user.email;
    const { sentTo } = req.body;
    console.log("Request -- Friend request details:", sentBy + ", " + sentTo);

    if (sentBy === sentTo) {
      const sameEmailFriendsError = new Error("Same emails need not be friends!");
      sameEmailFriendsError.code = "00000";
      throw sameEmailFriendsError;
    }

    const isRequestSent = (await db.query(
      `INSERT INTO friends (sent_by, sent_to)
      SELECT $1, $2 WHERE NOT EXISTS (
        SELECT 1 FROM friends
        WHERE (sent_by = $3 AND sent_to = $4) OR (sent_to = $3 AND sent_by = $4)
      ) RETURNING *`,
       [sentBy, sentTo, sentBy, sentTo]
    )).rowCount === 0;

    if (isRequestSent) {
      const pendingFriendRequestError = new Error("A request is already sent!");
      pendingFriendRequestError.code = "23505";
      throw pendingFriendRequestError;
    }

    // TODO 0
    // Send email friend request with accept button

    // Friend request can be accepted only in the app, email link will redirect to the in-app activities
      // list where accept button for the request will be there
    // No need for this, because at last while verifying with DB the request won't exist
    // So, accept button will be there in both Email and in-app activities

    const html = `
    <html>
      <head>
        <title>Friend Request</title>
        <style>
          a {
          	display: block;
            width: 16vw;
            border: 1.5px solid black;
            text-align: center;
            text-decoration: none;
            font-size: 3vw;
            background-color: #00ce52;
            color: #FFF;
            padding: 1.5vh 0;
            border-radius: 1.5vh;
          }
          a:hover {
          	box-shadow: 1px 1px 0px #000000;
          }
        </style>
      </head>
      <body>
        <h2>user has sent a friend request</h2>
        <a href="${serverLink}:${serverPort}/api/friends/accept?sentTo=${sentTo}" >Accept</a>
      </body>
    <html>`;

    // sendMail(sentTo, `New Friend Request from ${sentBy}`, html);

    // TODO Front-end
    // users({sentBy}).name sent a request to users({sentTo}).name -- Accept button
      // Date Time
    // Add to activities table (activities for each user will be different)
      // Instead of adding to activities table (as no table for friend activities)
      // Just add to activities list in app whenever a request is sent and if it is accepted it will
        // disappear from the list

    // TODO GLOBAL
    // Transactions for DB
      // Including updated_at COLUMNS of related Tables

    res.status(201).json({
      message: "Friend request sent successfully!",
      sentBy,
      sentTo
    });
  } catch (err) {
    console.error("Error adding friend:", err);

    if (err.code === "00000") {
      res.status(400).json({ message: err.message });
    } else if (err.code === "23505") {
      res.status(409).json({ message: err.message });
    } else {
      res.status(500).json({ message: "An error occured!" });
    }
  }
});

router.get("/get-all-by-user", async (req, res) => {
  try {
    console.log("Request -- User email:", req.user.email);

    const { rowCount: friendCount, rows: friends } = await db.query(
      `SELECT u.id, u.name, u.email, f.are_friends FROM users u
      JOIN friends f ON u.email = f.sent_to
      WHERE f.sent_by = $1 AND f.are_friends = true
      UNION
      SELECT u.id, u.name, u.email, f.are_friends FROM users u
      JOIN friends f ON u.email = f.sent_by
      WHERE f.sent_to = $1`,
      [req.user.email]
    );

    if (friendCount == 0) {
      const noFriendError = new Error("No friends exist!");
      noFriendError.code = "00000";
      throw noFriendError;
    }

    res.status(200).json({ friendCount, friends });
  } catch (err) {
    console.error("Error fetching all friends:", err);

    if (err.code === "00000") {
      res.status(200).json({ message: err.message });
    } else {
      res.status(500).json({ message: "An error occured!" });
    }
  }
});

router.put("/accept", async (req, res) => {
  try {
    const sentBy = req.query.sentBy;
    const sentTo = req.user.email;
    console.log("Request -- Sent by:", sentBy);
    console.log("        -- Sent to:", sentTo);
    
    const rowCount = (await db.query(
      `UPDATE friends SET are_friends = true
      WHERE sent_by = $1 AND sent_to = $2 AND are_friends = false
      RETURNING *`,
      [sentBy, sentTo]
    )).rowCount;
    
    if (rowCount == 0) {
      const noFriendRequestError = new Error("No pending friend request exist or Already friends!");
      noFriendRequestError.code = "000000";
      throw noFriendRequestError;
    }

    res.status(200).json({ message: "Friend request accepted!" });
  } catch (err) {
    console.error("Error accepting request:", err);

    if (err.code === "000000") {
      res.status(403).json({ message: err.message });
    } else {
      res.status(500).json({ message: "An error occured!" });
    }
  }
});

module.exports = router;
