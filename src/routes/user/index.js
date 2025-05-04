const express = require("express");
const router = express.Router();
const controler = require("./controler");
const validator = require("./validator");
const auth = require("./../../../authenticate");
router.use(auth);

router.get("/user_notes", controler.userNotes);
router.delete(
  "/delete_note/:post_id",
  validator.deleteNoteValidator(),
  controler.validate,
  controler.deleteNote
);

module.exports = router;
