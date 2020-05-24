const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenConfig = require("../config/token.json");
const errorCodes = require("../config/errorCodes.json");
const chalk = require("chalk");
var UserSchema = require("../models/userModel.js");
const { OAuth2Client } = require("google-auth-library");

// SIGN UP API//
//create user
UserSchema.statics.createUser = function (userData) {
  return new Promise((resolve, reject) => {
    User.create(userData)
      .then((user) => {
        user.token = jwt
          .sign(
            {
              _id: user._id.toHexString(),
              access: "auth",
            },
            tokenConfig.secret,
            {
              expiresIn: 86400,
            }
          )
          .toString();
        if (user.password) {
          bcrypt.hash(user.password, 10, function (err, hash) {
            if (err) reject(err);
            user.passwordHash = hash;
            user
              .save()
              .then((user) => {
                resolve(user);
              })
              .catch((err) => {
                console.log(chalk.red(JSON.stringify(err)));
                return reject(errorCodes.USER103);
              });
          });
        } else {
          user
            .save()
            .then((user) => {
              resolve(user);
            })
            .catch((err) => {
              console.log(chalk.red(JSON.stringify(err)));
              return reject(errorCodes.USER103);
            });
        }
      })
      .catch((err) => {
        console.log(chalk.red(JSON.stringify(err)));
        // Duplicate email error
        if (err.code == 11000) {
          return reject(errorCodes.USER104);
        } else {
          return reject(errorCodes.USER103);
        }
      });
  });
};

// SIGN UP API FOR GOOGLE//
//create user
UserSchema.statics.createUserGoogle = function (googleIdToken) {
  return new Promise((resolve, reject) => {
    const client = new OAuth2Client(
      "152160269393-ko1pdpt8sr5gdqfnhvhbon3u7sh7qpe4.apps.googleusercontent.com"
    );
    client.verifyIdToken(
      {
        idToken: googleIdToken,
        audience:
          "152160269393-ko1pdpt8sr5gdqfnhvhbon3u7sh7qpe4.apps.googleusercontent.com", // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
      },
      (err, ticket) => {
        if (err) {
          console.log(chalk.red(JSON.stringify(err)));
          return reject(errorCodes.SECURITY103);
        }
        const payload = ticket.getPayload();
        userData = {
          email: payload["email"],
          givenName: payload["given_name"],
          familyName: payload["family_name"],
          avatarImage: {
            dataUri: payload["picture"],
          },
          googleId: payload["sub"],
        };

        User.create(userData)
          .then((user) => {
            user.token = jwt
              .sign(
                {
                  _id: user._id.toHexString(),
                  access: "auth",
                },
                tokenConfig.secret,
                {
                  expiresIn: 86400,
                }
              )
              .toString();
            if (user.password) {
              bcrypt.hash(user.password, 10, function (err, hash) {
                if (err) reject(err);
                user.passwordHash = hash;
                user
                  .save()
                  .then((user) => {
                    resolve(user);
                  })
                  .catch((err) => {
                    console.log(chalk.red(JSON.stringify(err)));
                    return reject(errorCodes.USER103);
                  });
              });
            } else {
              user
                .save()
                .then((user) => {
                  resolve(user);
                })
                .catch((err) => {
                  console.log(chalk.red(JSON.stringify(err)));
                  return reject(errorCodes.USER103);
                });
            }
          })
          .catch((err) => {
            console.log(chalk.red(JSON.stringify(err)));
            // Duplicate email error
            if (err.code == 11000) {
              return reject(errorCodes.USER104);
            } else {
              return reject(errorCodes.USER103);
            }
          });
      }
    );
  });
};

// SIGN IN API//
// login user
UserSchema.statics.authenticateUser = function (userData) {
  return new Promise((resolve, reject) => {
    User.findOne({
      email: userData.email,
    }).exec(function (err, user) {
      if (err) {
        console.log(chalk.red(JSON.stringify(err)));
        return reject(errorCodes.USER103);
      }
      if (!user) {
        err = errorCodes.USER101;
        console.log(chalk.red(JSON.stringify(err)));
        return reject(err);
      }
      bcrypt.compare(userData.password, user.passwordHash, function (
        err,
        result
      ) {
        if (result === true) {
          user.token = jwt
            .sign(
              {
                _id: user._id.toHexString(),
                access: "auth",
              },
              tokenConfig.secret,
              {
                expiresIn: 86400,
              }
            )
            .toString();
          user
            .save()
            .then((user) => {
              return resolve(user);
            })
            .catch((err) => {
              console.log(chalk.red(JSON.stringify(err)));
              return reject(errorCodes.USER103);
            });
        } else {
          console.log(chalk.red(JSON.stringify(err)));
          return reject(errorCodes.USER102);
        }
      });
    });
  });
};

// SIGN IN API FOR GOOGLE//
// find User for  Google Id
UserSchema.statics.authenticateUserGoogleId = function (googleIdToken) {
  return new Promise((resolve, reject) => {
    const client = new OAuth2Client(
      "152160269393-ko1pdpt8sr5gdqfnhvhbon3u7sh7qpe4.apps.googleusercontent.com"
    );
    client.verifyIdToken(
      {
        idToken: googleIdToken,
        audience:
          "152160269393-ko1pdpt8sr5gdqfnhvhbon3u7sh7qpe4.apps.googleusercontent.com", // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
      },
      (err, ticket) => {
        if (err) {
          console.log(chalk.red(JSON.stringify(err)));
          return reject(errorCodes.SECURITY103);
        }
        const payload = ticket.getPayload();
        const googleId = payload["sub"];
        const email = payload["email"];
        const imageUrl = payload["picture"];
        //console.log(payload);
        User.findOne({
          email: email,
        }).exec(function (err, user) {
          if (err) {
            console.log(chalk.red(JSON.stringify(err)));
            return reject(errorCodes.USER103);
          }
          if (!user) {
            err = errorCodes.USER101;
            console.log(chalk.red(JSON.stringify(err)));
            return reject(err);
          }
          if (!user.avatarImage) {
            user.avatarImage = {
              dataUri: imageUrl,
            };
          }
          user.token = jwt
            .sign(
              {
                _id: user._id.toHexString(),
                access: "auth",
              },
              tokenConfig.secret,
              {
                expiresIn: 86400,
              }
            )
            .toString();

          user.googleId = googleId;
          user
            .save()
            .then((user) => {
              return resolve(user);
            })
            .catch((err) => {
              console.log(chalk.red(JSON.stringify(err)));
              return reject(errorCodes.USER103);
            });
        });
      }
    );
  });
};

// CHECK TOKEN WHEN ALREADY SIGNED//
// check user and find user with token
UserSchema.statics.findByToken = function (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, tokenConfig.secret, function (err, decoded) {
      if (err) {
        console.log(chalk.red(JSON.stringify(err)));
        return reject(errorCodes.SECURITY102);
      }
      User.findOne({
        _id: decoded._id,
        token: token,
      }).exec(function (err, user) {
        if (err) {
          console.log(chalk.red(JSON.stringify(err)));
          return reject(errorCodes.USER103);
        }
        if (!user) {
          err = errorCodes.USER101;
          console.log(chalk.red(JSON.stringify(err)));
          return reject(err);
        }
        resolve(user);
      });
    });
  });
};

// UPDATE USER ONLY PROTECTED FIELDS//
// Update user with only un protected fields
UserSchema.statics.updateUser = function (userData, userId) {
  delete userData.password;
  delete userData.email;
  delete userData._id;
  delete userData.isAdmin;
  delete userData.token;
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(userId, userData, {
      new: true,
    })
      .then((user) => {
        if (!user) {
          err = errorCodes.USER101;
          console.log(chalk.red(JSON.stringify(err)));
          return reject(err);
        }
        resolve(user);
      })
      .catch((err) => {
        console.log(chalk.red(JSON.stringify(err)));
        return reject(errorCodes.USER103);
      });
  });
};

// UPDATE USER ONLY PASSWORD//
// Update user with only password
UserSchema.statics.updateUserPassword = function (password, user) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, function (err, hash) {
      if (err) reject(err);
      user.passwordHash = hash;
      user.password = password;
      user
        .save()
        .then((user) => {
          resolve(user);
        })
        .catch((err) => {
          console.log(chalk.red(JSON.stringify(err)));
          return reject(errorCodes.USER103);
        });
    });
  });
};

// REMOVE USER ONLY ITSELF//
//remove user
UserSchema.statics.removeUser = function (userId) {
  return new Promise((resolve, reject) => {
    User.deleteOne(
      {
        _id: userId,
      },
      function (err, opt) {
        if (err) {
          console.log(chalk.red(JSON.stringify(err)));
          return reject(errorCodes.USER103);
        }
        resolve(opt);
      }
    );
  });
};

// find User for forget pass
UserSchema.statics.findUser = function (email) {
  return new Promise((resolve, reject) => {
    User.findOne({
      email: email,
    }).exec(function (err, user) {
      if (err) return reject(err);
      if (!user) {
        err = {
          code: 404,
          errmsg: "not found",
        };
        return reject(err);
      }
      return resolve(user);
    });
  });
};

UserSchema.statics.signUser = function (user) {
  return new Promise((resolve, reject) => {
    user.token = jwt
      .sign(
        {
          _id: user._id.toHexString(),
          access: "auth",
        },
        tokenConfig.secret,
        {
          expiresIn: 86400,
        }
      )
      .toString();
    user
      .save()
      .then((user) => {
        return resolve(user);
      })
      .catch((err) => {
        console.log(chalk.red(JSON.stringify(err)));
        return reject(errorCodes.USER103);
      });
  });
};

var User = mongoose.model("User", UserSchema);
module.exports = User;

/*
//auth token
UserSchema.statics.generateAuthToken = function(userData) {
  userData.token = jwt
    .sign(
      {
        _id: user._id.toHexString(),
        access: "auth"
      },
      tokenConfig.secret,
      {
        expiresIn: 86400
      }
    )
    .toString();
  return new Promise((resolve, reject) => {
    userData
      .save()
      .then((user) => {
        resolve(user);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
*/
