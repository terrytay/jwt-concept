const express = require("express");

const authServerController = require("../controllers/authServer");

const router = express.Router();

router.post("/login", authServerController.postLogin);

router.delete("/logout", authServerController.deleteLogout);

router.post("/token", authServerController.postToken);

module.exports = router;
