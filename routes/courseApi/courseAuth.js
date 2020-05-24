const router = require("express").Router();
const Course = require("../../core/courseCore");
const chalk = require("chalk");

/* POST create course */
router.post("/create", function(req, res, next) {
  if (!req.user.isAdmin) {
    return res.status(401).json({
      auth: false,
      message: "User is not admin."
    });
  }
  if (req.body.title) {
    console.log(chalk.yellow("create course | title: " + req.body.title));
    Course.createCourse(req.body)
      .then((course) => {
        console.log(chalk.green("Course created."));
        return res.status(202).json({
          status: 202,
          msg: "Course created.",
          course: course
        });
      })
      .catch((error) => {
        console.log(chalk.green(error.errmsg));
        return res.status(400).json({
          status: 400,
          code: error.code,
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

router.post("/addComment", function(req, res, next) {
  if (req.body.comment && req.body._id) {
    console.log(chalk.yellow("adding comment " + req.body._id));
    Course.addComment(req.body._id, req.body.comment)
      .then((course) => {
        console.log(chalk.green("Course updated."));
        return res.status(202).json({
          status: 202,
          msg: "Course updated.",
          course: course
        });
      })
      .catch((error) => {
        console.log(chalk.green(error.errmsg));
        return res.status(400).json({
          status: 400,
          code: error.code,
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

router.post("/removeComment", function(req, res, next) {
  if (req.body.commentId && req.body._id) {
    console.log(chalk.yellow("remove comment " + req.body._id));
    Course.removeComment(req.body._id, req.body.commentId)
      .then((course) => {
        console.log(chalk.green("Course updated."));
        return res.status(202).json({
          status: 202,
          msg: "Commment removed.",
          course: course
        });
      })
      .catch((error) => {
        console.log(chalk.green(error.errmsg));
        return res.status(400).json({
          status: 400,
          code: error.code,
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

router.post("/updateComment", function(req, res, next) {
  if (req.body.comment._id && req.body._id) {
    console.log(chalk.yellow("adding comment " + req.body._id));
    Course.updateComment(req.body._id, req.body.comment)
      .then((course) => {
        console.log(chalk.green("Course updated."));
        return res.status(202).json({
          status: 202,
          msg: "Course updated.",
          course: course
        });
      })
      .catch((error) => {
        console.log(chalk.green(error.errmsg));
        return res.status(400).json({
          status: 400,
          code: error.code,
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
