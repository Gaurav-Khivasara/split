// TODO 0
// payments table in DB and its logic

require("dotenv").config();
const serverLink = process.env.SERVER_LINK;
const serverPort = process.env.SERVER_PORT;
const frontendLink = process.env.FRONTEND_LINK;
const frontendPort = process.env.FRONTEND_PORT;

const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const cors = require("cors");
app.use(cors({
  origin: `${frontendLink}:${frontendPort}`,
}));

require("./config/passport");

const authRouter = require("./routers/authRouter");
app.use("/auth/google", authRouter);

const apiRouters = require("./routers/apiRouters");
app.use("/api", (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or Invalid token!" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT middleware auth error:", err.message);

    res.status(401).json({ message: "Invalid token!" });
  }
}, apiRouters);

app.listen(serverPort, () => {
  console.log(`${serverLink}:${serverPort}`)
});
