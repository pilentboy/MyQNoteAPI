const expressValidator = require("express-validator");
const check = expressValidator.check;

module.exports = new (class {
  registerValidator() {
    return [
      check("username")
        .notEmpty()
        .withMessage("نام کاربری یا رمز عبور نمی تواند خالی باشد.")
        .isString()
        .withMessage("نام کاربری باید یک رشته باشد.")
        .isLength({ min: 5, max: 14 })
        .withMessage("نام کاربری باید بین 5 تا 14 کاراکتر باشد.")
        .matches(/^[A-Za-z]+$/)
        .withMessage("نام کاربری باید فقط شامل حروف انگلیسی باشد."),
      check("password")
        .isString()
        .withMessage("رمز عبور باید یک رشته باشد.")
        .isLength({ min: 8, max: 16 })
        .withMessage("رمز عبور باید بین 8 تا 14 کاراکتر باشد.")
        .notEmpty()
        .withMessage("نام کاربری یا رمز عبور نمی تواند خالی باشد."),
    ];
  }
  loginValidator() {
    console.log(this);
    return [
      check("username")
        .notEmpty()
        .withMessage("نام کاربری یا رمز عبور نمی تواند خالی باشد."),
      check("password")
        .notEmpty()
        .withMessage("نام کاربری یا رمز عبور نمی تواند خالی باشد."),
    ];
  }
})();
