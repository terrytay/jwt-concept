const express = require("express");

const serverController = require("../controllers/server");

const router = express.Router();

router.get("/posts", serverController.getPosts);

module.exports = router;
