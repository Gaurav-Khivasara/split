const serverLink = process.env.SERVER_LINK;
const serverPort = process.env.SERVER_PORT;

const express = require('express');
const router = express.Router();

const db = require('../config/db');
const sendMail = require('../config/email');

const crypto = require('crypto');

function generateRequestCode() {
  const alphaNumerics = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456';
  
  let requestCode = '';
  for (let i = 0; i < 6; i++) {
    requestCode += alphaNumerics[Math.floor(Math.random() * 62)];
  }

  return requestCode;
}

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
    )).rowCount > 0;

    if (isRequestSent) {
      const pendingFriendRequestError = new Error(`A request is already is sent!`);
      pendingFriendRequestError.code = '23505';
      throw pendingFriendRequestError;
    }
    
    const requestCode = generateRequestCode();
    const requestHash = crypto.createHash('sha256').update(sentBy + requestCode + sentTo).digest('hex');
    console.log("::" + sentBy + requestCode + sentTo);
    console.log("::" + requestHash);
    
    await db.query(
      `INSERT INTO friends (sent_by, sent_to, request_hash)
      VALUES ($1, $2, $3) RETURNING *`,
      [sentBy, sentTo, requestHash]
    );
    
    // TODO 0
    // Send email friend request with accept button
    const [{ email: sentByEmail }, { email: sentToEmail }] = (await db.query(
      `SELECT email FROM users WHERE id IN ($1, $2)`,
      [sentBy, sentTo]
    )).rows;

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
        <a href="${serverLink}:${serverPort}/api/friends/accept?request=${sentTo}-${requestCode}-${sentBy}" >Accept</a>
      </body>
    <html>`;
      
    // sendMail(sentToEmail, 'New Friend Request', html);

    // TODO Front-end
    // users({sentBy}).name sent a request to users({sentTo}).name -- Accept button
      // Date Time
    // Add to activities table (activities for each user will be different)
      // Instead of adding to activities table (as no table for frined activities)
      // Just add to activities list in app whenever a request is sent and if it is accepted it will
        // disappear from the list

    // TODO GLOBAL
    // Transactions for DB
      // Including updated_at COLUMNS of related Tables

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

router.put('/accept', async (req, res) => {
  const friendRequest = req.query.request;
  const [sentTo, requestCode, sentBy] = friendRequest.split('-');
  const requestHash = crypto.createHash('sha256').update(sentBy + requestCode + sentTo).digest('hex');

  try {
    const rowCount = (await db.query(
      `UPDATE friends SET are_friends = true
      WHERE request_hash = $1 AND are_friends = false
      RETURNING *`,
      [requestHash]
    )).rowCount;

    if (rowCount == 0) {
      const noFriendRequestError = new Error('No pending friend request exist OR Already friends!');
      noFriendRequestError.code = '000000';
      throw noFriendRequestError;
    }
    
    res.status(200).json({ message: '' });
  } catch (err) {
    console.error('Error accepting request:', err.message);

    if (err.code === '000000') {
      res.status(403).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'An error occured!' });
    }
  }
});

module.exports = router;
