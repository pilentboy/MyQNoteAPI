const { Pool } = require("pg"); // to connect to postgres db
require("dotenv").config(); // to access env variables

// database connection info
const pool = new Pool({
  user: "root",
  host: "myqnote",
  database: "myqnote",
  password: "9WCS0GPGUWwst1lISIVKdY1i",
  port: 5432,
  charset: "utf8"
});

//connect event
pool.on("connect", () => {
  console.log("Connected to the database");
});

module.exports = pool;
