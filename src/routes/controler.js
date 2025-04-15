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
      console.log(messages);
      this.response(
        res,
        "authentication  error",
        messages.length ? messages : null,
        null,
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

  response(res, message, errors = {}, data = {}, code = 200) {
    res.status(code).json({
      message: message,
      error: errors,
      data: data,
    });
  }
};
