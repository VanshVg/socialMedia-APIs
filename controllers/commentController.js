const { v4: uuidv4 } = require("uuid");
const commentModel = require("../models/commentModel");
const postModel = require("../models/postModel");

const addComment = async (req, resp) => {
  let postId = req.params.id;
  let postData = await postModel.findOne({ postId: postId });
  if (!postData) {
    resp.status(400).send({
      message: "The post you are trying to comment doesn't exist",
    });
  } else {
    let newCommentId = uuidv4();
    let data = new commentModel({
      Comment: req.body.Comment,
      commentId: newCommentId,
    });
    let result = await data.save();
    console.log({ data });
    let post = await postModel.updateOne(
      { postId: postId },
      { $push: { comments: data } }
    );
    console.log(post);
    resp.status(200).send({
      CommentId: newCommentId,
    });
  }
};

module.exports = { addComment };
