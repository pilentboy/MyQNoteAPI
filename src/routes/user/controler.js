const controler = require("../controler");
const pool = require("../../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = new (class extends controler {
  async userNotes(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM notes WHERE username = $1",
        [req.user.username]
      );
      this.response(res, "user notes", result.rows, null, 201);
    } catch (error) {
      this.response(res, "server error", null, { error: "خطای سرور" }, 500);
    }
  }
  async deleteNote(req, res) {
    const { post_id } = req.params;

    try {
      const result = await pool.query(
        "DELETE FROM notes WHERE username = $1 AND id = $2 RETURNING *",
        [req.user.username, post_id]
      );

      if (result.rows.length === 0) {
        this.response(
          res,
          "deleting note error",
          null,
          "چنین یادداشتی وجود ندارد",
          404
        );
        return;
      }

      this.response(res, "با موفقیت حذف شد", null, null, 201);
    } catch (error) {
      this.response(res, "server error", null, "server خطای سرو", 500);
    }
  }
})();
