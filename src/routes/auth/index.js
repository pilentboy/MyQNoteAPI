const express = require("express");
const router = express.Router();
const controler = require("./controler");
const validator = require("./validator");

router.post("/login", validator.loginValidator(), controler.login);
router.post("/register", validator.registerValidator(), controler.register);

module.exports = router;
