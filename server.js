require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const apiRouters = require('./routers/apiRouters');
app.use('/api', apiRouters);

app.listen(port, () => {
  console.log(`${process.env.LINK}:${port}`)
});
