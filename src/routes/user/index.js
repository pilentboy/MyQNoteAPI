const express = require("express");
const router = express.Router();
const controler = require("./controler");
const validator = require("./validator");
const auth = require("../../middlewares/authenticate");
router.use(auth);

router.get("/user_notes", controler.userNotes);
router.get(
  "/search_users",
  validator.searchUsersValidator(),
  controler.validate,
  controler.searchUsers
);
router.get("/user_friends", controler.userFriends);

router.get("/user_shared_notes", controler.getSharedNotes);
router.get("/pending_requests", controler.pendingRequest);
router.get("/notification", controler.getNotifications);

router.delete(
  "/delete_note/:post_id",
  validator.deleteNoteValidator(),
  controler.validate,
  controler.deleteNote
);
router.delete("/delete_notes", controler.deleteNotes);
router.delete(
  "/delete_friend_request",
  validator.deleteFriendRequestValidator(),
  controler.validate,
  controler.deleteFriendRequest
);
router.put(
  "/edit_note",
  validator.editNoteValidator(),
  controler.validate,
  controler.editNote
);
router.put(
  "/accept_friend_request",
  validator.acceptFriendRequestValidator(),
  controler.validate,
  controler.acceptFriendRequest
);

router.post(
  "/add_note",
  validator.addNoteValidator(),
  controler.validate,
  controler.addNote
);

router.post(
  "/friend_request",
  validator.addFriendValidator(),
  controler.validate,
  controler.friendRequest
);

router.post("/share_note", controler.shareNote);

module.exports = router;
