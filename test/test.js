const testController = require("./testController");

describe("API tests", function () {
  this.timeout(5000);

  describe("POST /api/authenticate", testController.authentication);
  describe("POST /api/follow/:id", testController.follow);
  describe("POST /api/unfollow/:id", testController.unfollow);
  describe("GET /api/user", testController.userProfile);
  describe("POST /api/posts", testController.post);
  describe("DELETE /api/posts/:id", testController.deletePost);
  describe("POST /api/like/:id", testController.like);
  describe("POST /api/unlike/:id", testController.unlike);
  describe("POST /api/comment/:id", testController.comment);
  describe("GET /api/posts/:id", testController.singlePost);
  describe("GET /api/all_posts", testController.allPosts);
});
