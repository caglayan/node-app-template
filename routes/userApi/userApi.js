const express = require("express");
const router = express.Router();
const unAuthApi = require("./unAuthApi");
const authApi = require("./authApi");
const chalk = require("chalk");
const User = require("../../core/userCore");
const errorCodes = require("../../config/errorCodes.json");

/* log all request for login page*/
router.all("/*", function (req, res, next) {
  console.log("Accessing to User api");
  next(); // pass control to the next handler
});

router.use("/unauth", unAuthApi);

//----------------------------- now check authantication time -----------------------------

// catch tokens and forward to user api
router.use(function (req, res, next) {
  var token = req.headers["x-api-key"];
  if (!token) {
    error = errorCodes.SECURITY101;
    console.log(chalk.red(JSON.stringify(error)));
    return res.status(400).json(error);
  }
  User.findByToken(token)
    .then((user) => {
      console.log(chalk.green("User authanticated with his/her token"));
      req.user = user;
      return next();
    })
    .catch((error) => {
      error = errorCodes.SECURITY102;
      console.log(chalk.red(JSON.stringify(error)));
      return res.status(400).json(error);
    });
});

router.use("/auth", authApi);
module.exports = router;
