const { Pool } = require("pg"); // to connect to postgres db
require("dotenv").config(); // to access env variables
const config = require("config");

// database connection info
const pool = new Pool({
  user: config.get("db.user"),
  host: "localhost",
  database: config.get("db.database"),
  password: config.get("db.password"),
  port: config.get("db.port") || 5432,
});

// const pool = new Pool({
//   user: config.get("database.user"),
//   host: config.get("database.host"),
//   database: config.get("database.name"),
//   password: config.get("database.password"),
//   port: config.get("db.port") || 5432,
//   charset: "utf8",
// });

//connect event
http: pool.on("connect", () => {
  console.log("Connected to the database");
});

module.exports = pool;
