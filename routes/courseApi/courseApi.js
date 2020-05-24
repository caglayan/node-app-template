const express = require("express");
const router = express.Router();
const chalk = require("chalk");

const courseNonAuth = require("./courseNonAuth");
const courseAuth = require("./courseAuth");
const User = require("../../core/userCore");

/* log all request for login page*/
router.all("/*", function(req, res, next) {
  console.log("Accessing to Course api");
  next(); // pass control to the next handler
});

router.use("/unauth", courseNonAuth);

//----------------------------- now check authantication time -----------------------------
// catch tokens and forward to user api
router.use(function(req, res, next) {
  var token = req.headers["x-api-key"];
  if (!token) {
    console.log(chalk.red("No token provided"));
    return res.status(401).json({
      auth: false,
      message: "No token provided."
    });
  }
  console.log(chalk.yellow("check auth token | token: " + token));
  User.findByToken(token)
    .then((user) => {
      console.log(chalk.green("User authanticated."));
      req.user = user;
      return next();
    })
    .catch((error) => {
      console.log(chalk.red(error.message));
      return res.status(400).json({
        status: 400,
        code: 102,
        errmsg: error.message
      });
    });
});

router.use("/auth", courseAuth);

module.exports = router;
