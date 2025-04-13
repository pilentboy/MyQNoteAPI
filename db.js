const { Pool } = require("pg"); // to connect to postgres db
require("dotenv").config(); // to access env variables

// database connection info
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "myqnote",
  password: "1111",
  port: 5432,
});

// const pool = new Pool({
//   user: "root",
//   host: "myqnote",
//   database: "myqnote",
//   password: process.env.DATABASE_PASSWORD,
//   port: 5432,
//   charset: "utf8"
// });

//connect event
pool.on("connect", () => {
  console.log("Connected to the database");
});

module.exports = pool;
