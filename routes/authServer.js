const express = require("express");

const authServerController = require("../controllers/authServer");

const router = express.Router();

router.post("/token", authServerController.postToken);
router.post("/login", authServerController.postLogin);
router.post("/logout", authServerController.postLogout);

module.exports = router;
