const expressValidator = require("express-validator");
const check = expressValidator.check;

module.exports = new (class {
  deleteNoteValidator() {
    return [
      check("post_id")
        .notEmpty()
        .withMessage("آی دی یادداشت نمی تواند خالی باشد"),
    ];
  }

  searchUsersValidator() {
    return [
      check("username")
        .notEmpty()
        .withMessage("حداقل یک حرف برای جستوجو نیاز است"),
    ];
  }

  addNoteValidator() {
    return [
      check("title").notEmpty().withMessage("عنوان نمی تواند خالی باشد"),
      check("content").notEmpty().withMessage("یادداشت نمی تواند خالی باشد"),
    ];
  }

  editNoteValidator() {
    return [
      check("title").notEmpty().withMessage("عنوان نمی تواند خالی باشد"),
      check("content").notEmpty().withMessage("یادداشت نمی تواند خالی باشد"),
      check("post_id")
        .notEmpty()
        .withMessage("آی دی یادداشت نمی تواند خالی باشد"),
      check("time").notEmpty().withMessage("زمان ویرایش نمی تواند خالی باشد"),
      check("direction")
        .notEmpty()
        .withMessage("جهت یادداشت نمی تواند خالی باشد"),
    ];
  }

  deleteFriendRequestValidator() {
    return [
      check("friendRequestID")
        .notEmpty()
        .withMessage("آی دی دوست نمی تواند خالی باشد"),
    ];
  }

  addFriendValidator() {
    return [
      check("receiver_username")
        .notEmpty()
        .withMessage("آی دی دوست نمی تواند خالی باشد"),
    ];
  }

  acceptFriendRequestValidator() {
    return [
      check("friendRequestID")
        .notEmpty()
        .withMessage("آی دی دوست نمی تواند خالی باشد"),
    ];
  }

  shareNoteValidator() {
    return [
      check("sharingNoteID")
        .notEmpty()
        .withMessage("آی دی یادداشت نمی تواند خالی باشد"),
      check("friendUsername")
        .notEmpty()
        .withMessage("آی دی دوست نمی تواند خالی باشد"),
    ];
  }
})();
