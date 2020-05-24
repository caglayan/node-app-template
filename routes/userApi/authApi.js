const router = require("express").Router();
const chalk = require("chalk");
const sharp = require("sharp");
const fileUpload = require("express-fileupload");
const User = require("../../core/userCore");
const errorCodes = require("../../config/errorCodes.json");
const successCodes = require("../../config/successCodes.json");

/// UPDATE USER ///
/* POST update user */
router.post("/update", function (req, res, next) {
  console.log(
    chalk.yellow("update user | id: " + req.user._id + " body: " + req.body)
  );
  User.updateUser(req.body, req.user._id)
    .then((user) => {
      console.log(chalk.green(successCodes.USER101.Success));
      return res.status(202).json({
        ...successCodes.USER101,
        user: user,
      });
    })
    .catch((error) => {
      console.log(chalk.red(JSON.stringify(errorCodes.USER100)));
      return res.status(400).json(errorCodes.USER100);
    });
});

/// UPDATE USER PASSWORD ///
/* POST update user password */
router.post("/updatepassword", function (req, res, next) {
  if (req.body.password) {
    console.log(
      chalk.yellow(
        "update user | id: " + req.user._id + " password: " + req.body.password
      )
    );
    User.updateUserPassword(req.body.password, req.user)
      .then((user) => {
        console.log(chalk.green("User updated."));
        return res.status(202).json({
          status: 202,
          msg: "User updated.",
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

/// REMOVE USER ///
/* POST remove user */
router.post("/remove", function (req, res, next) {
  console.log(chalk.yellow("remove user | id: " + req.user._id));
  User.removeUser(req.user._id)
    .then((opt) => {
      console.log(chalk.green(opt.deletedCount + " user removed."));
      if (opt.deletedCount == 0) {
        error = errorCodes.USER101;
        console.log(chalk.red(JSON.stringify(error)));
        return res.status(400).json(error);
      } else {
        return res.status(202).json({
          status: 202,
          msg: "User removed.",
        });
      }
    })
    .catch((error) => {
      console.log(chalk.red(JSON.stringify(error)));
      return res.status(400).json(error);
    });
});

/// UPDATE PROFILE IMAGE ///
/* POST profile image */

// MIDDLEWARE //
router.use(
  fileUpload({
    uriDecodeFileNames: true,
    limits: {
      fileSize: 750 * 1024,
      safeFileNames: /\\/g,
      preserveExtension: true,
    }, // 1mb
  })
);

//https://picsum.photos/id/1026/500/300
router.post("/uploadimage", function (req, res) {
  console.log(chalk.yellow("add image to user | email: " + req.user.email));
  if (!req.files) {
    error = errorCodes.USER105;
    console.log(chalk.red(JSON.stringify(error)));
    return res.status(400).json(error);
  }
  var image = req.files.image;
  sharp(image.data)
    .resize(200, 200)
    .toBuffer()
    .then((data) => {
      const avatarImage = {
        name: image.name,
        size: image.size,
        mimeType: image.mimetype,
        md5: image.md5,
        encoding: image.encoding,
        dataUri: `data:image/png;base64,${data.toString("base64")}`,
      };
      req.user.avatarImage = avatarImage;
      req.user
        .save()
        .then((user) => {
          if (!user) {
            error = errorCodes.USER101;
            console.log(chalk.red(JSON.stringify(error)));
          }
          console.log(chalk.green("User image added."));
          return res.status(202).json({
            status: 202,
            msg: "User created.",
            user: user,
          });
        })
        .catch((error) => {
          error = errorCodes.USER101;
          console.log(chalk.red(JSON.stringify(error)));
        });
    })
    .catch((error) => {
      console.log(chalk.red(JSON.stringify(error)));
      return res.status(400).json(errorCodes.USER103);
    });
});

module.exports = router;
