const router = require("express").Router();
const User = require("../../core/userCore");
const chalk = require("chalk");
const bcrypt = require("bcrypt");
const errorCodes = require("../../config/errorCodes.json");
const successCodes = require("../../config/successCodes.json");
const mailService = require("../../services/mailService");

/// SIGN IN API ///
/* POST authanticate user. */
router.post("/signin", function (req, res, next) {
  if (req.body.email && req.body.password) {
    console.log(
      chalk.yellow(
        "trying login user | email: " +
          req.body.email +
          " pass: " +
          req.body.password
      )
    );
    User.authenticateUser(req.body)
      .then((user) => {
        console.log(chalk.green("User authanticated."));
        console.log(user);
        return res.status(200).json({
          Status: 200,
          Message: "User authanticated.",
          user: user,
        });
      })
      .catch((error) => {
        console.log(chalk.red(JSON.stringify(error)));
        return res.status(400).json(error);
      });
  } else {
    console.log(chalk.red(JSON.stringify(errorCodes.SERVER101)));
    return res.status(400).json(errorCodes.SERVER101);
  }
});

/// SIGN IN WITH GOOGLE ///
/* POST authanticate user. */
router.post("/signwithgoogle", function (req, res, next) {
  if (req.body.googleIdToken) {
    console.log(chalk.yellow("auth user with google token"));
    User.authenticateUserGoogleId(req.body.googleIdToken)
      .then((user) => {
        console.log(chalk.green("User Found."));
        return res.status(200).json({
          status: 200,
          msg: "User authanticated.",
          user: user,
        });
      })
      .catch((error) => {
        console.log(chalk.red(JSON.stringify(error)));
        return res.status(400).json(error);
      });
  } else {
    console.log(chalk.red(JSON.stringify(errorCodes.SERVER101)));
    return res.status(400).json(errorCodes.SERVER101);
  }
});

// SIGN UP API GOOGLE AND WITHOUT GOOGLE//
/* POST create user */
router.post("/signup", function (req, res, next) {
  if (req.body.email && req.body.givenName && req.body.familyName) {
    console.log(chalk.yellow("create user | email: " + req.body.email));
    User.createUser(req.body)
      .then((user) => {
        console.log(chalk.green("User created."));
        mailService.sendMail(
          "welcome",
          "Welcome to KirazAi",
          user,
          (error, info) => {
            if (error) {
              error = errorCodes.MAIL101;
              console.log(chalk.red(JSON.stringify(error)));
            } else {
              //error = errorCodes.MAIL101;
              //console.log(chalk.red(JSON.stringify(error)));
            }
          }
        );
        return res.status(202).json({
          status: 202,
          msg: "User created.",
          user: user,
        });
      })
      .catch((error) => {
        console.log(chalk.red(JSON.stringify(error)));
        return res.status(400).json(error);
      });
  } else {
    console.log(chalk.red(JSON.stringify(errorCodes.SERVER101)));
    return res.status(400).json(errorCodes.SERVER101);
  }
});

/// SIGN IN WITH GOOGLE ///
/* POST authanticate user. */
router.post("/signupgoogle", function (req, res, next) {
  if (req.body.googleIdToken) {
    console.log(chalk.yellow("create user with google token "));
    User.createUserGoogle(req.body.googleIdToken)
      .then((user) => {
        console.log(chalk.green("User created."));
        mailService.sendMail(
          "welcome",
          "Welcome to KirazAi",
          user,
          (error, info) => {
            if (error) {
              error = errorCodes.MAIL101;
              console.log(chalk.red(JSON.stringify(error)));
            } else {
              //error = errorCodes.MAIL101;
              //console.log(chalk.red(JSON.stringify(error)));
            }
          }
        );
        return res.status(202).json({
          status: 202,
          msg: "User created.",
          user: user,
        });
      })
      .catch((error) => {
        console.log(chalk.red(JSON.stringify(error)));
        return res.status(400).json(error);
      });
  } else {
    console.log(chalk.red(JSON.stringify(errorCodes.SERVER101)));
    return res.status(400).json(errorCodes.SERVER101);
  }
});

/// AUTHANTICATE TOKEN ///
/* POST auth token */
router.post("/authtoken", function (req, res, next) {
  var token = req.headers["x-api-key"];
  if (!token) {
    error = errorCodes.SECURITY101;
    console.log(chalk.red(JSON.stringify(error)));
    return res.status(400).json(error);
  }
  console.log(chalk.yellow("auth token | token: " + token));
  User.findByToken(token)
    .then((user) => {
      console.log(chalk.green("User authanticated."));
      return res.status(202).json({
        status: 202,
        msg: "User authanticated.",
        user: user,
      });
    })
    .catch((error) => {
      console.log(chalk.red(JSON.stringify(errorCodes.SERVER101)));
      return res.status(400).json(errorCodes.SERVER101);
    });
});

//////////////// SEND EXAMPLE MAILS /////////////////////////
/* Test Emails */

router.post("/sendtestemail", function (req, res, next) {
  if (req.body.email) {
    console.log(chalk.yellow("sent test mail | email: " + req.body.email));
    mailService.sendMailTest(req.body.email, (error, info) => {
      if (error) {
        error = errorCodes.MAIL101;
        console.log(chalk.red(JSON.stringify(error)));
        return res.status(400).json(error);
      } else {
        return res.status(202).json({
          status: 202,
          msg: "Mail is sent.",
        });
      }
    });
  } else {
    console.log(chalk.red(JSON.stringify(errorCodes.SERVER101)));
    return res.status(400).json(errorCodes.SERVER101);
  }
});

//////////////// WAITING /////////////////////////
/* POST forgat password */
router.post("/resetpassword", function (req, res, next) {
  if (req.body.email) {
    console.log(chalk.yellow("reset password mail | email: " + req.body.email));
    User.findUser(req.body.email)
      .then((user) => {
        console.log(chalk.green("User found for reset password."));
        User.signUser(user)
          .then((user) => {
            console.log(chalk.green("User signed for reset password."));
            mailService.sendMail(
              "passwordReset",
              "Reset Password",
              user,
              (error, info) => {
                if (error) {
                  console.log(chalk.red(JSON.stringify(successCodes.MAIL101)));
                  return res.status(202).json(successCodes.MAIL101);
                } else {
                  console.log(chalk.red(JSON.stringify(successCodes.MAIL101)));
                  return res.status(202).json(successCodes.MAIL101);
                }
              }
            );
          })
          .catch((error) => {
            console.log(chalk.red(JSON.stringify(successCodes.MAIL101)));
            return res.status(202).json(successCodes.MAIL101);
          });
      })
      .catch((error) => {
        console.log(chalk.red(JSON.stringify(successCodes.MAIL101)));
        return res.status(202).json(successCodes.MAIL101);
      });
  } else {
    console.log(chalk.red(JSON.stringify(errorCodes.SERVER101)));
    return res.status(400).json(errorCodes.SERVER101);
  }
});

/* POST forgat password */
router.post("/updatePass", function (req, res, next) {
  console.log(chalk.yellow("update pass | password: " + req.body.password));
  var token = req.headers["x-api-key"];
  if (!token || !req.body.password) {
    return res.status(411).json({
      status: 411,
      desc: "length required",
    });
  }

  User.findByToken(token)
    .then((user) => {
      console.log(chalk.green("User authanticated and founded"));
      bcrypt.hash(req.body.password, 10, function (err, hash) {
        if (err) reject(err);
        user.password = req.body.password;
        user.passwordHash = hash;
        user
          .save()
          .then((user) => {
            console.log(chalk.green("User authanticated."));
            return res.status(202).json({
              status: 202,
              msg: "User password updated.",
              user: user,
            });
          })
          .catch((err) => {
            reject(err);
          });
      });
    })
    .catch((error) => {
      console.log(chalk.red(error.message));
      return res.status(400).json({
        status: 400,
        code: error.code,
        errmsg: error.errmsg,
      });
    });
});

router.post("/reset_password2", function (req, res, next) {
  mailService.sendMail("deneme", "caglayanserbetci@gmail.com", (err, info) => {
    if (err) {
      console.log("err: " + err);
    } else {
      console.log("info: " + info);
    }
  });
});

module.exports = router;
