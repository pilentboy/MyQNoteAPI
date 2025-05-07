const express = require("express");
const bodyParser = require("body-parser");
const router = require("./src/routes");
require("dotenv").config();
const debug = require("debug")("app:main");
const config = require("config");
const checkApiKey = require("./src/middlewares/checkAPIKey");
const cors = require("cors");

const app = express();

debug("App name: ", config.get("name"));

// configs
app.use(bodyParser.json());
app.use(express.json());
app.use(checkApiKey);
app.use(express.static("public"));
app.use(cors());
app.use("/api", router);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
