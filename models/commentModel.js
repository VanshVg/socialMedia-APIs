const mongoose = require("mongoose");

let commentSchema = mongoose.Schema({
  Comment: String,
  commentId: String,
});

module.exports = mongoose.model("commentdatas", commentSchema);
