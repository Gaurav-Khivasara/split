const express = require('express');
const router = express.Router();

const db = require('../config/db');
const sendMail = require('../config/email');

router.get('/', (req, res) => {
  res.status(200).json({ message: 'This is friends route' });
});

router.post('/add', async (req, res) => {
  try {
    const { sentBy, sentTo } = req.body;
    console.log('Request -- Friend request details:', sentBy + ', ' + sentTo);

    if (sentBy == sentTo) {
      const sameIdsFriendError = new Error('Same ids need not be friends!');
      sameIdsFriendError.code = '00000';
      throw sameIdsFriendError;
    }

    const isRequestSent = (await db.query(
      `SELECT * FROM friends
      WHERE (sent_to = $1 AND sent_by = $2) OR (sent_by = $1 AND sent_to = $2)`,
      [sentBy, sentTo]
    )).rowCount !== 0;

    if (isRequestSent) {
      const pendingFriendRequestError = new Error(`A request is already is sent!`);
      pendingFriendRequestError.code = '23505';
      throw pendingFriendRequestError;
    }

    await db.query(
      `INSERT INTO friends (sent_by, sent_to)
      VALUES ($1, $2) RETURNING *`,
      [sentBy, sentTo]
    );
    
    // TODO 0
    // Send email friend request with accept button
    const [{ email: sentByEmail }, { email: sentToEmail }] = (await db.query(
      `SELECT email FROM users WHERE id IN ($1, $2)`,
      [sentBy, sentTo]
    )).rows;

    // TODO 5
    // Email acceptance of friend request not completed, use some code for that request verification

    const html = `
    <html>
      <head>
        <title>Friend Request</title>
      </head>
      <body>
        <h2>${sentByEmail} has sent a friend request</h2>
        <a href="${process.env.LINK}:${process.env.PORT}/api/friends/accept-request/" >Accept</a>
      </body>
    <html>`;
      
    // sendMail(sentToEmail, 'New Friend Request', html);

    // TODO Front-end
    // users({sentBy}).name sent a request to users({sentTo}).name -- Accept button
      // Date Time
    // Add to activities table (activities for each user will be different)
      // Instead of adding to activities table (as no table for frined activities)
      // Just add to activities whenever a request is sent and if it is accepted it will
        // disappear from the list

    // TODO GLOBAL
    // Transactions for DB

    res.status(201).json({
      message: 'Friend request sent successfully!',
      sentByEmail,
      sentToEmail
    });
  } catch (err) {
    console.error('Error adding friend:', err.message);

    if (err.code === '00000' || err.code === '23505') {
      res.status(409).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'An error occured!' });
    }
  }
});

router.get('/get-all-by-user-id/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Request -- User id:', userId);

    const { rowCount: friendCount, rows: friends } = await db.query(
      `SELECT * FROM friends
      WHERE (sent_by = $1 OR sent_to = $1) AND are_friends = true`,
      [userId]
    );

    if (friendCount == 0) {
      const noFriendError = new Error('No friends exist!');
      noFriendError.code = '00000';
      throw noFriendError;
    }

    res.status(200).json({ friendCount, friends});
  } catch (err) {
    console.error('Error fetching all friends:', err.message);

    if (err.code === '00000') {
      res.status(403).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'An error occured!' });
    }
  }
});

module.exports = router;
