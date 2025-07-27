const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const db = require('../config/db');

router.get('/', (req, res) => {
  res.status(200).json({ message: 'This is users route' });
});

// router.get('/register', (req, res) => {
//   res.send(`
//     <html>
//       <head>
//         <title>User Registration</title>
//       </head>
//       <body>
//         <h2>User Registration</h2>

//         <form action="/users/register" method="POST" >
//           <label for="name">Name:</label>
//           <input type="text" id="name" name="name" required />
//           <br /><br />

//           <label for="email">Email:</label>
//           <input type="email" id="email" name="email" required />
//           <br /><br />

//           <label for="password">Password:</label>
//           <input type="password" id="password" name="password" required />
//           <br /><br />

//           <input type="submit" value="Submit" />
//         </form>

//         <script>
//           function validate(event) {
//             const pass = document.getElementById("password").value;

//             const hasUpper = /[A-Z]/.test(pass);
//             const hasLower = /[a-z]/.test(pass);
//             const hasNumber = /[0-9]/.test(pass);
//             const hasSymbol = /[^A-Za-z0-9]/.test(pass);

//             if (pass.length < 8 ||
//               !hasUpper ||
//               !hasLower ||
//               !hasNumber ||
//               !hasSymbol
//             ) {
//               alert("Choose a strong password! (Capital, Small, Number, Symbol, Min 8)");
//               event.preventDefault();
//               return false;
//             }

//             return true;
//           }
//         </script>
//       </body>
//     </html>
//   `);
// });

// Not required as using Google OAuth 2.0
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     console.log('Request -- User details:', name + ', ' + email + ', ' + password);

//     // TODO 0
//     // passwordHash and password_hash not needed as using Google OAuth 2.0
//     const passwordHash = await bcrypt.hash(password, 10);

//     // const result = await db.query(
//     await db.query(
//       `INSERT INTO users (name, email, password_hash)
//       VALUES ($1, $2, $3) RETURNING *`,
//       [name, email, passwordHash]
//     );

//     res.status(201).json({
//       message: 'User created successfully!',
//       name,
//       email
//     });
//   } catch (err) {
//     console.error('Error inserting user:', err.message);

//     if (err.code === '23505') {
//       res.status(409).json({ message: 'Email already exist!' });
//     } else {
//       res.status(500).json({ message: 'An error occured!' });
//     }
//   }
// });

module.exports = router;
