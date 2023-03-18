const mongoose = require("mongoose");

let followerSchema = mongoose.Schema({
  followerId: String,
  followingId: String,
});

module.exports = mongoose.model("followersdatas", followerSchema);
