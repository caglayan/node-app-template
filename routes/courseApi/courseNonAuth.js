const router = require("express").Router();
const Course = require("../../core/courseCore");
const chalk = require("chalk");

/* POST find course. */
router.post("/find", function(req, res, next) {
  if (req.body._id) {
    console.log(chalk.yellow("find  | course id: " + req.body._id));
    Course.findCourse(req.body._id)
      .then((course) => {
        console.log(chalk.green("Course found."));
        return res.status(202).json({
          status: 202,
          msg: "Course found.",
          course: course
        });
      })
      .catch((error) => {
        console.log(chalk.red(error));
        return res.status(400).json({
          status: 400,
          code: 103,
          errmsg: error.errmsg
        });
      });
  } else {
    return res.status(411).json({
      status: 411,
      desc: "length required"
    });
  }
});

module.exports = router;
