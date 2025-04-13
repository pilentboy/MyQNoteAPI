const autoBind = require("auto-bind");
const { validationResult } = require("express-validator");
module.exports = class {
  constructor() {
    autoBind(this);
  }

  validationBody(req, res) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const erros = result.array();
      const messages = [];
      erros.forEach((error) => {
        messages.push(error.msg);
      });
      res.status(400).json({
        message: "validation error",
        data: messages,
      });
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

  response(res, message, data = {}, code = 200) {
    res.status(code).json({
      message: message,
      data: data,
    });
  }
};
