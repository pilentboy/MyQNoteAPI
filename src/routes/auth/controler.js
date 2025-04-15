const controler = require("../controler");
const pool = require("../../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = new (class extends controler {
  async register(req, res) {
    const { username, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        "INSERT INTO users (username, password) VALUES ($1, $2)",
        [username, hashedPassword]
      );

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      if (error.code === "23505") {
        this.response(res, "register error", [
          { field: "username", msg: "کاربری با این نام در سیستم وجود دارد" },
          null,
          400,
        ]);
        return;
      }
      res.status(500).json({ error: "خطای سرور" });
    }
  }

  async login(req, res) {
    const { username, password } = req.body;

    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = result.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password))) {
        this.response(
          res,
          "authentication  error",
          [{ field: "username", msg: "نام کاربری یا رمز عبور اشتباه است" }],
          null,
          401
        );
        return;
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        {
          expiresIn: "200d",
        }
      );

      const setToken = await pool.query(
        "INSERT INTO access_key (key,user_id) VALUES ($1,$2)",
        [token, user.id]
      );

      this.response(res, "logged in successfully", null, {
        token: token,
        msg: "hii",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "خطای سرور" });
    }
  }
})();
