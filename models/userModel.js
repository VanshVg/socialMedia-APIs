const mongoose = require("mongoose");

let userSchema = mongoose.Schema({
  userId: String,
  Email: String,
  Password: String,
  userName: String,
  Followers: Number,
  Followings: Number,
});

module.exports = mongoose.model("userdatas", userSchema);
