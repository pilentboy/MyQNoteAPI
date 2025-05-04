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
})();
