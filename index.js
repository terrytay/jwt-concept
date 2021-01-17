const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const authServerRoutes = require("./routes/authServer");
const serverRoutes = require("./routes/server");

require("dotenv").config();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use(cookieParser());
app.use("/auth", authServerRoutes);

// Middlware to protect serverRoutes
app.use((req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
});

app.use(serverRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Running on port ${process.env.PORT}`)
);

// Method to use to generate TOKEN SECRET:
// Using node in terminal, require('crypto').randomBytes(64).toString('hex')
