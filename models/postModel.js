const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  Comment: String,
  commentId: String,
});

let postSchema = mongoose.Schema({
  postId: String,
  userId: String,
  title: String,
  desc: String,
  created_at: String,
  comments: [commentsSchema],
  likes: Number,
});

module.exports = mongoose.model("postdatas", postSchema);
