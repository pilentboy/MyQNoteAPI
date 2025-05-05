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
router.get(
  "/search_users",
  validator.searchUsersValidator(),
  controler.validate,
  controler.searchUsers
);
router.post(
  "/add_note",
  validator.addNoteValidator(),
  controler.validate,
  controler.addNote
);
router.put(
  "/edit_note",
  validator.editNoteValidator(),
  controler.validate,
  controler.editNote
);
router.delete("/delete_notes", controler.deleteNotes);
router.get("/user_friends", controler.userFriends);
router.delete(
  "/delete_friend_request",
  validator.deleteFriendRequestValidator(),
  controler.validate,
  controler.deleteFriendRequest
);

router.post(
  "/friend_request",
  validator.addFriendValidator(),
  controler.validate,
  controler.friendRequest
);
router.get("/pending_requests", controler.pendingRequest);
router.get("/notification", controler.getNotifications);
router.put(
  "/accept_friend_request",
  validator.acceptFriendRequestValidator(),
  controler.validate,
  controler.acceptFriendRequest
);

router.post("/share_note", controler.shareNote);
router.get("/user_shared_notes", controler.getSharedNotes);

module.exports = router;
