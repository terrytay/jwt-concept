const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

const authServerRoutes = require("./routes/authServer");
const serverRoutes = require("./routes/server");

require("dotenv").config();
app.use(express.json());

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
