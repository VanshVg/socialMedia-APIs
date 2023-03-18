const mongoose = require("mongoose");

let likeSchema = mongoose.Schema({
  postId: String,
  userId: String,
});

module.exports = mongoose.model("likedatas", likeSchema);
