const jwt = require("jsonwebtoken");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

const userModel = require("../models/userModel");
const followersModel = require("../models/followersModel");

const login = async (req, resp) => {
  try {
    if (!req.body.Email || !req.body.Password) {
      throw new Error("Field is missing");
    }
    const user = await userModel.findOne({ Email: req.body.Email });
    if (user) {
      if (req.body.Password === user.Password) {
        try {
          jwt.sign(
            { data: user },
            process.env.ACCESS_TOKEN_SECRET,
            (err, token) => {
              if (err) {
                throw err;
              } else {
                resp.status(200).send({
                  token: token,
                });
                console.log(token);
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

module.exports = { login, follow, unfollow, userProfile };
