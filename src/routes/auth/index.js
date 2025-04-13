const express = require("express");
const router = express.Router();
const controler = require("./controler");

router.post("/login", controler.login);
router.post("/register", controler.register);

module.exports = router;
