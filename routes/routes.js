const express = require("express");
const userController = require("../controllers/userController");
const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/authenticate", userController.login);
router.post("/follow/:id", auth, userController.follow);
router.post("/unfollow/:id", auth, userController.unfollow);
router.get("/user", auth, userController.userProfile);
router.post("/posts/", auth, postController.post);
router.delete("/posts/:id", auth, postController.deletePost);
router.post("/like/:id", auth, postController.like);
router.post("/unlike/:id", auth, postController.unlike);
router.post("/comment/:id", auth, commentController.addComment);
router.get("/posts/:id", postController.showPost);
router.get("/all_posts", auth, postController.showAllPosts);

module.exports = router;
