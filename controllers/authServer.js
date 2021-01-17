const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Fake user db
// To generate password:
// bcrypt.hash(password, 10, function(err, hash) {
// Store hash in your password DB.
// });
const db = [
  {
    user_id: 0,
    username: "jx",
    password: "$2b$10$Y44M1TaBRCAxFxh74UF9cerBGjVirIDBGjOJFPaVZ6umAz79bYt7K",
  },
  {
    user_id: 1,
    username: "jh",
    password: "$2b$10$eSrNKBrOVljqh1v1SD0dp.fj5hwvNk.GPuxfPN6lmwOYUmCMCT0Bm",
  },
];

let refreshTokens = [];

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30s",
  });
}

// Generate a new token when existing one expires using refresh token
exports.postToken = (req, res) => {
  const refreshToken = req.cookies["refreshToken"];
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ user_id: user.user_id });
    res.json({ accessToken });
  });
};

// If login successful, return accessToken
exports.postLogin = (req, res) => {
  // check for basic auth header
  if (
    !req.headers.authorization ||
    req.headers.authorization.indexOf("Basic ") === -1
  ) {
    return res.status(401).json({ message: "Missing Authorization Header" });
  }
  // verify auth credentials
  const base64Credentials = req.headers.authorization.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");
  // const [username, password] = base64Credentials.split(":");
  const user = db.find((user) => user.username == username);

  if (!user) return res.sendStatus(401);

  // Checks password
  bcrypt.compare(password, user.password, function (err, result) {
    if (err) return res.sendStatus(401);

    // If password valid, generate accessToken
    if (result) {
      const accessToken = generateAccessToken({ user_id: user.user_id });
      const refreshToken = jwt.sign(
        { user_id: user.user_id },
        process.env.REFRESH_TOKEN_SECRET
      );

      refreshTokens.push(refreshToken);

      res.cookie("refreshToken", refreshToken, {
        maxAge: 24 * 60 * 60,
        // You can't access these tokens in the client's javascript
        httpOnly: true,
        // Forces to use https in production
        secure: false,
      });
      res.json({ accessToken });
      // Else, send back status 403
    } else {
      return res.sendStatus(403);
    }
  });
};

// Function to logout by deleting refreshToken from db
exports.postLogout = (req, res) => {
  refreshTokens = refreshTokens.filter(
    (token) => token !== req.cookies["refreshToken"]
  );
  res.cookie("refreshToken", undefined);
  res.sendStatus(204);
};
