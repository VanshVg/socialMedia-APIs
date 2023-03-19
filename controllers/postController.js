const postModel = require("../models/postModel");
const likeModel = require("../models/likesModel");
const { v4: uuidv4 } = require("uuid");

const post = async (req, resp) => {
  let userId = req.user.data.userId;
  let cTime = new Date().toUTCString();
  let newPostId = uuidv4();
  if (!req.body.title || !req.body.description) {
    resp.status(400).send({
      Error: "Field is missing",
    });
  } else {
    let data = new postModel({
      postId: newPostId,
      userId: userId,
      title: req.body.title,
      desc: req.body.description,
      created_at: cTime,
      likes: 0,
    });
    let result = await data.save();
    resp.status(200).send({
      PostID: newPostId,
      title: req.body.title,
      description: req.body.description,
      CreatedTime: cTime,
    });
  }
};

const deletePost = async (req, resp) => {
  let postId = req.params.id;
  let postData = await postModel.findOne({ postId: postId });
  if (!postData) {
    resp.status(400).send({
      message: "This post doesn't exist",
    });
  } else {
    let data = await postModel.deleteOne({ postId: postId });
    resp.status(200).send({
      message: "Post deleted",
    });
  }
};

const like = async (req, resp) => {
  let postId = req.params.id;
  let userId = req.user.data.userId;
  let postData = await postModel.findOne({ postId: postId });
  if (!postData) {
    resp.status(400).send({
      message: "Post not found",
    });
  } else {
    let likesData = await likeModel.findOne({
      $and: [{ postId: postId }, { userId: userId }],
    });
    if (likesData) {
      resp.status(400).send({
        message: "You have already liked this post",
      });
    } else {
      let like = new likeModel({
        postId: postId,
        userId: userId,
      });
      let postData = await postModel.findOne({ postId: postId });
      let result = await like.save();
      let newLikes = postData.likes + 1;
      let post = await postModel.updateOne(
        { postId: postId },
        { $set: { likes: newLikes } }
      );
      resp.status(200).send({
        message: "You have liked this post",
      });
    }
  }
};

const unlike = async (req, resp) => {
  let postId = req.params.id;
  let userId = req.user.data.userId;
  let postData = await postModel.findOne({ postId: postId });
  if (!postData) {
    resp.status(400).send({
      message: "Post not found",
    });
  } else {
    let likesData = await likeModel.findOne({
      $and: [{ postId: postId }, { userId: userId }],
    });
    if (!likesData) {
      resp.status(400).send({
        message: "You haven't liked this post",
      });
    } else {
      let removeLike = await likeModel.deleteOne({
        $and: [{ postId: postId }, { userId: userId }],
      });
      let postData = await postModel.findOne({ postId: postId });
      let newLikes = postData.likes - 1;
      let post = await postModel.updateOne(
        { postId: postId },
        { $set: { likes: newLikes } }
      );
      resp.status(200).send({
        message: "You have unliked this post",
      });
    }
  }
};

const showPost = async (req, resp) => {
  let postId = req.params.id;
  let data = await postModel.findOne({ postId: postId });
  if (!data) {
    resp.status(404).send({
      message: "Post not found",
    });
  } else {
    let commentsNumber = data.comments.length;
    resp.status(200).send({
      title: data.title,
      desc: data.desc,
      commentsNumber: commentsNumber,
      likes: data.likes,
    });
  }
};

const showAllPosts = async (req, resp) => {
  let userId = req.user.data.userId;
  let posts = await postModel.find({ userId: userId });
  if (posts.length == 0) {
    resp.status(404).send({
      message: "This user hasn't posted anything",
    });
  } else {
    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    resp.status(200).send(
      posts.map((posts) => ({
        postId: posts.postId,
        title: posts.title,
        description: posts.desc,
        created_at: posts.created_at,
        comments: posts.comments,
        likes: posts.likes,
      }))
    );
  }
};

module.exports = { post, deletePost, like, unlike, showPost, showAllPosts };
