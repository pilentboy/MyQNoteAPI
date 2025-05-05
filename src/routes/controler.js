const autoBind = require("auto-bind");
const { validationResult } = require("express-validator");

module.exports = class {
  constructor() {
    autoBind(this);
  }

  validationBody(req, res) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array();
      const messages = [];
      errors.forEach((error) => {
        messages.push({ field: error.path, msg: error.msg });
      });
      this.response(
        res,
        "An error occured, check the error field",
        null,
        messages.length ? messages : null,
        400
      );

      return false;
    }
    return true;
  }

  validate(req, res, next) {
    if (!this.validationBody(req, res)) {
      return;
    }
    next();
  }

  response(res, message, data = {}, errors = {}, code = 200) {
    res.status(code).json({
      message: message,
      data: data,
      error: errors,
    });
  }
};
