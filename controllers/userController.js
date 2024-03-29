const jwt = require("jsonwebtoken");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const userModel = require("../models/userModel");
const followersModel = require("../models/followersModel");

const register = async (req, resp) => {
  try {
    if (!req.body.Email || !req.body.Password || !req.body.userName) {
      throw new Error("Field is missing");
    } else {
      let username = await userModel.findOne({ userName: req.body.userName });
      let useremail = await userModel.findOne({ Email: req.body.Email });
      if (username) {
        resp.status(400).send({
          message: "You can't use this username",
        });
      } else {
        if (useremail) {
          resp.status(400).send({
            message: "Email already exists",
          });
        } else {
          bcrypt.hash(req.body.Password, 10, async function (err, hash) {
            let newuserId = uuidv4();
            let data = new userModel({
              userId: newuserId,
              Email: req.body.Email,
              Password: hash,
              userName: req.body.userName,
              Followers: 0,
              Followings: 0,
            });
            let results = await data.save();
            try {
              jwt.sign(
                { data: results },
                process.env.ACCESS_TOKEN_SECRET,
                (err, token) => {
                  if (err) {
                    throw err;
                  } else {
                    localStorage.setItem("isLoggedIn", true);
                    resp
                      .status(200)
                      .cookie("token", token, {
                        httpOnly: true,
                        maxAge: 60 * 60 * 1000,
                      })
                      .send({
                        message: "Registered Successfully",
                      });
                  }
                }
              );
            } catch (err) {
              console.error("Error signing JWT:", err);
              resp.status(500).sned({
                message: "Internal Server Error",
              });
            }
          });
        }
      }
    }
  } catch (err) {
    console.log("Error registering user:", err);
    resp.status(400).send({
      message: "Field is Missing",
    });
  }
};

const login = async (req, resp) => {
  try {
    if (!req.body.Email || !req.body.Password) {
      throw new Error("Field is missing");
    }
    const user = await userModel.findOne({ Email: req.body.Email });
    if (user) {
      bcrypt.compare(
        req.body.Password,
        user.Password,
        async function (err, result) {
          if (result === true) {
            try {
              jwt.sign(
                { data: user },
                process.env.ACCESS_TOKEN_SECRET,
                (err, token) => {
                  if (err) {
                    throw err;
                  } else {
                    localStorage.setItem("isLoggedIn", true);
                    resp
                      .status(200)
                      .cookie("token", token, {
                        httpOnly: true,
                        maxAge: 60 * 60 * 1000,
                      })
                      .send({
                        message: "Login successful",
                        token: token,
                      });
                  }
                }
              );
            } catch (err) {
              console.error("Error signing JWT:", err);
              resp.status(500).send({
                message: "Internal server error",
              });
            }
          } else {
            resp.status(401).send({
              message: "Password not matched",
            });
          }
        }
      );
    } else {
      resp.status(404).send({
        message: "User not found",
      });
    }
  } catch (err) {
    console.log("Error logging in user:", err);
    resp.status(400).send({
      message: "Field is Missing",
    });
  }
};

const follow = async (req, resp) => {
  let userId1 = req.params.id;
  let userId2 = req.user.data.userId;
  let user1 = await userModel.findOne({ userId: userId1 });
  if (!user1) {
    resp.status(404).send({
      message: "User not found",
    });
  } else {
    let user2 = await userModel.findOne({ userId: userId2 });
    if (userId1 === userId2) {
      resp.status(400).send({
        message: "You can't follow yourself",
      });
    } else {
      let followerData = await followersModel.findOne({
        $and: [{ followerId: userId2 }, { followingId: userId1 }],
      });
      if (followerData) {
        resp.status(400).send({
          message: "You already follow this user",
        });
      } else {
        let followers = new followersModel({
          followerId: userId2,
          followingId: userId1,
        });
        let result = await followers.save();
        let newFollowers = user1.Followers + 1;
        let data = await userModel.updateOne(
          { userId: userId1 },
          { $set: { Followers: newFollowers } }
        );
        let newFollowings = user2.Followings + 1;
        let data2 = await userModel.updateOne(
          { userId: userId2 },
          { $set: { Followings: newFollowings } }
        );
        resp.status(200).send({
          message: "You have followed this user",
        });
      }
    }
  }
};

const unfollow = async (req, resp) => {
  let userId1 = req.params.id;
  let userId2 = req.user.data.userId;
  let user1 = await userModel.findOne({ userId: userId1 });
  if (!user1) {
    resp.status(404).send({
      message: "User not found",
    });
  } else {
    let user2 = await userModel.findOne({ userId: userId2 });
    if (userId1 === userId2) {
      resp.status(400).send({
        message: "You can't unfollow yourself",
      });
    } else {
      let followerData = await followersModel.findOne({
        $and: [{ followerId: userId2 }, { followingId: userId1 }],
      });
      if (!followerData || user1.Followers == 0) {
        resp.status(400).send({
          message: "You don't follow this user",
        });
      } else {
        let removeFollower = await followersModel.deleteOne({
          $and: [{ followerId: userId2 }, { followingId: userId1 }],
        });
        let newFollowers = user1.Followers - 1;
        let data = await userModel.updateOne(
          { userId: userId1 },
          { $set: { Followers: newFollowers } }
        );
        let newFollowings = user2.Followings - 1;
        let data2 = await userModel.updateOne(
          { userId: userId2 },
          { $set: { Followings: newFollowings } }
        );
        resp.status(200).send({
          message: "You have unfollowed this user",
        });
      }
    }
  }
};

const userProfile = async (req, resp) => {
  let user = req.user.data.userName;
  let data = await userModel.findOne({ userName: user });
  resp.status(200).send({
    UserName: data.userName,
    Followers: data.Followers,
    Followings: data.Followings,
  });
};

const logout = async (req, resp) => {
  resp
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
    })
    .send({
      message: "Logout successful",
    });
};

module.exports = { register, login, follow, unfollow, userProfile, logout };
