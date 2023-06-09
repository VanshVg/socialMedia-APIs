const { v4: uuidv4 } = require("uuid");
const commentModel = require("../models/commentModel");
const postModel = require("../models/postModel");

const addComment = async (req, resp) => {
  try {
    if (!req.body.Comment) {
      throw new Error("Field is missing");
    }
    let postId = req.params.id;
    let postData = await postModel.findOne({ postId: postId });
    if (!postData) {
      resp.status(400).send({
        message: "Post not found",
      });
    } else {
      let newCommentId = uuidv4();
      let data = new commentModel({
        Comment: req.body.Comment,
        commentId: newCommentId,
      });
      let result = await data.save();
      let post = await postModel.updateOne(
        { postId: postId },
        { $push: { comments: data } }
      );
      resp.status(200).send({
        CommentId: newCommentId,
      });
    }
  } catch (err) {
    console.error("Error while commenting", err);
    resp.status(200).send({
      message: err.message,
    });
  }
};

module.exports = { addComment };
