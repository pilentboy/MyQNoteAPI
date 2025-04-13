const express = require("express");
const router = express.Router();
const controler = require("./controler");
const validator = require("./validator");

router.post(
  "/login",
  validator.loginValidator(),
  controler.validate,
  controler.login
);
router.post(
  "/register",
  validator.registerValidator(),
  controler.validate,
  controler.register
);

module.exports = router;
