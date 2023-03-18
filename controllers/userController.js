const jwt = require("jsonwebtoken");
require("dotenv").config();

const userModel = require("../models/userModel");
const followersModel = require("../models/followersModel");

const login = async (req, resp) => {
  const user = await userModel.findOne({ Email: req.body.Email });
  if (user) {
    if (req.body.Password === user.Password) {
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
            console.log({ token: token });
          }
        }
      );
    } else {
      resp.status(400).send({
        message: "Password not matched",
      });
    }
  } else {
    resp.status(400).send({
      message: "User not found",
    });
  }
};

const follow = async (req, resp) => {
  let userId1 = req.params.id;
  let userId2 = req.user.data._id;
  let user1 = await userModel.findOne({ _id: userId1 });
  let user2 = await userModel.findOne({ _id: userId2 });
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
        { _id: userId1 },
        { $set: { Followers: newFollowers } }
      );
      let newFollowings = user2.Followings + 1;
      let data2 = await userModel.updateOne(
        { _id: userId2 },
        { $set: { Followings: newFollowings } }
      );
      resp.status(200).send({
        message: "You have followed this user",
      });
    }
  }
};

const unfollow = async (req, resp) => {
  let userId1 = req.params.id;
  let userId2 = req.user.data._id;
  let user1 = await userModel.findOne({ _id: userId1 });
  let user2 = await userModel.findOne({ _id: userId2 });
  if (userId1 === userId2) {
    resp.status(400).send({
      message: "You can't unfollow yourself",
    });
  } else {
    let followerData = await followersModel.findOne({
      $and: [{ followerId: userId2 }, { followingId: userId1 }],
    });
    if (!followerData) {
      resp.status(400).send({
        message: "You don't follow this user",
      });
    } else {
      let removeFollower = await followersModel.deleteOne({
        $and: [{ followerId: userId2 }, { followingId: userId1 }],
      });
      let newFollowers = user1.Followers - 1;
      let data = await userModel.updateOne(
        { _id: userId1 },
        { $set: { Followers: newFollowers } }
      );
      let newFollowings = user2.Followings - 1;
      let data2 = await userModel.updateOne(
        { _id: userId2 },
        { $set: { Followings: newFollowings } }
      );
      resp.status(200).send({
        message: "You have unfollowed this user",
      });
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
  console.log(data);
};

module.exports = { login, follow, unfollow, userProfile };