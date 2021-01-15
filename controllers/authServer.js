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
    username: "junxian",
    password: "$2b$10$Y44M1TaBRCAxFxh74UF9cerBGjVirIDBGjOJFPaVZ6umAz79bYt7K",
  },
  {
    user_id: 1,
    username: "jiahwee",
    password: "$2b$10$eSrNKBrOVljqh1v1SD0dp.fj5hwvNk.GPuxfPN6lmwOYUmCMCT0Bm",
  },
];

let refreshTokens = [];

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "20s",
  });
}

// Generate a new token when existing one expires using refresh token
exports.postToken = (req, res) => {
  const refreshToken = req.body.refreshToken;
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
  const { username, password } = req.body;
  const user = db.find((user) => user.username == username);

  if (!user) return res.sendStatus(401);

  bcrypt.compare(password, user.password, function (err, result) {
    if (err) return res.sendStatus(401);

    if (result) {
      const accessToken = generateAccessToken({ user_id: user.user_id });
      const refreshToken = jwt.sign(
        { user_id: user.user_id },
        process.env.REFRESH_TOKEN_SECRET
      );

      refreshTokens.push(refreshToken);

      res.json({ accessToken, refreshToken });
    } else {
      return res.sendStatus(403);
    }
  });
};

exports.deleteLogout = (req, res) => {
  refreshTokens = refreshTokens.filter(
    (token) => token !== req.body.refreshToken
  );
  res.sendStatus(204);
};
