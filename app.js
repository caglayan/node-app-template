const express = require("express");
const dbConfig = require("./config/db.json");
const mongoose = require("mongoose");
const chalk = require("chalk"); // For logging colorfull
require("console-stamp")(console, { pattern: "dd/mm/yyyy HH:MM:ss.l" }); // For time logs in console
const cors = require("cors"); // Cors
const logger = require("morgan"); // HTTP request logger middleware
const bodyParser = require("body-parser"); // Parse incoming request bodies in a middleware before handlers
const api = require("./routes/api.js");

// setup exprees js
var app = express();

//--------------------------------------------------- Database Coonection ----------------------------------------------
//connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || dbConfig.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  // we're connected!
  console.log(
    chalk.blue(
      "----------DB connection is OK. STARTING JOURNEY-------------------"
    )
  );
});
//-----------------------------------------------  Express App MiddleWares ---------------------------------------------
app.use(cors());
app.use(logger("tiny")); //tiny || dev
app.use(bodyParser.json());

app.use("/api", api);

// catch 404 and forward to error handler

app.use(function (req, res, next) {
  console.log("This route is not found");
  return res.status(404).json({
    status: 404,
    desc: "not found",
  });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.error("last error: " + err);
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    status: err.status || 500,
    desc: err.message,
  });
});

module.exports = app;
