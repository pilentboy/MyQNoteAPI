const controler = require("../controler");
const pool = require("../../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = new (class extends controler {
  async register(req, res) {
    const { username, password } = req.body;

    // set body errors
    const error = { error: [] };

    // checking body
    if (!username || !password) {
      error.error.push({
        required_values: "نام کاربری یا رمز عبور نمی تواند خالی باشد.",
      });
    }

    if (password?.length < 8 || password?.length > 16) {
      error.error.push({
        password_length: "رمز عبور باید بین 8 تا 16 کاراکتر باشد.",
      });
    }

    if (error.error.length > 0) {
      return res.status(400).json(error);
    }
    // end checking body

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        "INSERT INTO users (username, password) VALUES ($1, $2)",
        [username, hashedPassword]
      );

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      if (error.code === "23505") {
        return res
          .status(400)
          .json({ error: "کاربری با این نام کاربری وجود دارد." });
      }
      res.status(500).json({ error: "خطای سرور" });
    }
  }

  async login(req, res) {
    console.log(this);
    const { username, password } = req.body;
    // checking body
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "نام کاربری و رمز عبور نمی تواند خالی باشد." });
    }
    // end checking body`

    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = result.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res
          .status(401)
          .json({ error: "نام کاربری یا رمز عبور اشتباه است." });
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

      res.status(200).json({ message: "Logged in successfully", token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "خطای سرور" });
    }
  }
})();
