const express = require("express");
const router = express.Router();
const userApi = require("./userApi/userApi");
const courseApi = require("./courseApi/courseApi");

/* log all request for login page*/
router.all("/*", function(req, res, next) {
  console.log("Accessing to api");
  next(); // pass control to the next handler
});

router.use("/user", userApi);
router.use("/course", courseApi);

module.exports = router;
