const assert = require("assert");
const request = require("supertest");
const sinon = require("sinon");
const app = require("../index");
const userModel = require("../models/userModel");

let token;

describe("API tests", function () {
  this.timeout(5000);
  describe("POST /api/authenticate", function () {
    const user = {
      _id: { $oid: "6415e8b98825ce70ebd7e230" },
      userId: "c636ef1c-fcc3-4302-bfdf-bbbfe10a3b18",
      Email: "user1@abc.com",
      Password: "user1@abc",
      userName: "user1",
      Followers: { $numberInt: "1" },
      Followings: { $numberInt: "2" },
      __v: { $numberInt: "0" },
    };

    const mockUserModel = sinon.mock(userModel);

    mockUserModel
      .expects("findOne")
      .withArgs({ Email: "user1@abc.com" })
      .resolves(user);

    app.set("userModel", mockUserModel.object);

    it("Should return a JWT token if correct email and password provided", function (done) {
      request(app)
        .post("/api/authenticate")
        .send({ Email: "user1@abc.com", Password: "user1@abc" })
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          assert.ok(res.body.token);
          token = res.body.token;
          console.log(token);
          mockUserModel.verify();
          mockUserModel.restore();
          done();
        });
    });

    it('should return a "user not found" message with status 404 if wrong email provided', function (done) {
      request(app)
        .post("/api/authenticate")
        .send({ Email: "wrong@example.com", Password: "user1@abc" })
        .expect(404)
        .end(function (err, res) {
          if (err) return done(err);
          assert.strictEqual(res.body.message, "User not found");
          done();
        });
    });

    it('should return a "password not matched" message with status 401 if wrong password provided', function (done) {
      request(app)
        .post("/api/authenticate")
        .send({ Email: "user1@abc.com", Password: "wrongpassword" })
        .expect(401)
        .end(function (err, res) {
          if (err) return done(err);
          assert.strictEqual(res.body.message, "Password not matched");
          done();
        });
    });
  });

  describe("POST /api/follow/:id", function () {
    it('should return a "you have followed this user" message with status 200 if user is authorized', function (done) {
      request(app)
        .post("/api/follow/c08c3c4d-0714-42d2-a1ec-d2322d4730fe")
        .set("Authorization", "Bearer " + token)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          assert.strictEqual(res.body.message, "You have followed this user");
          done();
        });
    });

    it('should return a "user not found" message with status 404 if wrong user ID provided', function (done) {
      request(app)
        .post("/api/follow/456")
        .set("Authorization", "Bearer " + token)
        .expect(404)
        .end(function (err, res) {
          if (err) return done(err);
          assert.strictEqual(res.body.message, "User not found");
          done();
        });
    });

    it('should return a "you already follow this user" message with status 400 if user is already following', function (done) {
      request(app)
        .post("/api/follow/c08c3c4d-0714-42d2-a1ec-d2322d4730fe")
        .set("Authorization", "Bearer " + token)
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);
          assert.strictEqual(res.body.message, "You already follow this user");
          done();
        });
    });
  });

  describe("POST /api/unfollow/:id", function () {
    it('should return a "you have unfollowed this user" message with status 200 if user is authorized', function (done) {
      request(app)
        .post("/api/unfollow/c08c3c4d-0714-42d2-a1ec-d2322d4730fe")
        .set("Authorization", "Bearer " + token)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          assert.strictEqual(res.body.message, "You have unfollowed this user");
          done();
        });
    });

    it("should return a you don't follow this user message with status 400 if user is already following", function (done) {
      request(app)
        .post("/api/unfollow/c08c3c4d-0714-42d2-a1ec-d2322d4730fe")
        .set("Authorization", "Bearer " + token)
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);
          assert.strictEqual(res.body.message, "You don't follow this user");
          done();
        });
    });
  });

  describe("GET /api/user", function () {
    it("should return user details if authorized", (done) => {
      request(app)
        .get("/api/user")
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .end((err, res) => {
          assert.ifError(err);
          assert.ok(res.body.UserName);
          assert.ok(res.body.Followers);
          assert.ok(res.body.Followings);
          done();
        });
    });
  });
  let postId;
  describe("POST /api/posts", function () {
    it("should return object containing postID, title, description, CreatedTime with status code 200", function (done) {
      request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Test Title", description: "Test Description" })
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          assert.ok(res.body.PostID);
          postId = res.body.PostID;
          assert.equal(res.body.title, "Test Title");
          assert.equal(res.body.description, "Test Description");
          assert.ok(res.body.CreatedTime);
          done();
        });
    });

    it("should return Error property with status code 400 if one of title or description not provided in input", function (done) {
      request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Test Title" })
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);
          assert.ok(res.body.Error);
          done();
        });
    });
  });

  describe("DELETE /api/posts/:id", function () {
    it("should delete post with given id if user is authenticated", function (done) {
      request(app)
        .delete(`/api/posts/${postId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          assert.strictEqual(res.body.message, "Post deleted");
          done();
        });
    });
  });

  describe("POST /api/like/:id", function () {
    it('returns a message "You have liked this post" with status code 200 for authenticated user', (done) => {
      request(app)
        .post("/api/like/2282267f-32f9-4b3b-8af3-01fa6e46a098")
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          assert.strictEqual(res.body.message, "You have liked this post");
          done();
        });
    });

    it('returns a message "You have already liked this post" with status code 200 for authenticated user', (done) => {
      request(app)
        .post("/api/like/2282267f-32f9-4b3b-8af3-01fa6e46a098")
        .set("Authorization", `Bearer ${token}`)
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);
          assert.strictEqual(
            res.body.message,
            "You have already liked this post"
          );
          done();
        });
    });
  });

  describe("POST /api/unlike/:id", function () {
    it('returns a message "You have unliked this post" with status code 200 for authenticated user', (done) => {
      request(app)
        .post("/api/unlike/2282267f-32f9-4b3b-8af3-01fa6e46a098")
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          assert.strictEqual(res.body.message, "You have unliked this post");
          done();
        });
    });

    it("returns a message You haven't liked this post with status code 200 for authenticated user", (done) => {
      request(app)
        .post("/api/unlike/2282267f-32f9-4b3b-8af3-01fa6e46a098")
        .set("Authorization", `Bearer ${token}`)
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);
          assert.strictEqual(res.body.message, "You haven't liked this post");
          done();
        });
    });
  });

  describe("POST /api/comment/:id", function () {
    it("returns a comment id with status code 200 for authenticated user", (done) => {
      request(app)
        .post("/api/comment/2282267f-32f9-4b3b-8af3-01fa6e46a098")
        .set("Authorization", `Bearer ${token}`)
        .send({ Comment: "Test comment" })
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          assert.ok(res.body.CommentId);
          done();
        });
    });
  });

  describe("GET /api/posts/:id", function () {
    it("returns a post details with status code 200 for authenticated user", (done) => {
      request(app)
        .get("/api/posts/2282267f-32f9-4b3b-8af3-01fa6e46a098")
        .expect(200)
        .end((err, res) => {
          assert.ifError(err);
          assert.ok(res.body.title);
          assert.ok(res.body.desc);
          assert.ok(res.body.commentsNumber);
          assert.ok(res.body.likes);
          done();
        });
    });
  });

  describe("GET /api/all_posts", function () {
    it("returns an array of object containin post details with status code 200 for authenticated user", (done) => {
      request(app)
        .get("/api/all_posts")
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          assert.deepStrictEqual(Array.isArray(res.body), true);
          assert.deepStrictEqual(typeof res.body[0], "object");
          done();
        });
    });

    it('returns a message "This user hasn\'t posted anything" with status code 404 for authenticated user', (done) => {
      let token1 =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjY0MTVlOGQ4ODgyNWNlNzBlYmQ3ZTIzNCIsInVzZXJJZCI6IjE4MjllYjE4LWU1MTEtNGU2My05ODZjLTEwYzhhOWIzMjNjOSIsIkVtYWlsIjoidXNlcjNAYWJjLmNvbSIsIlBhc3N3b3JkIjoidXNlcjNAYWJjIiwidXNlck5hbWUiOiJ1c2VyMyIsIkZvbGxvd2VycyI6MSwiRm9sbG93aW5ncyI6MCwiX192IjowfSwiaWF0IjoxNjc5MjE1MzA3fQ.3JbSh7U3l5Ky4GUvw0CHopqiZCKmeus3cjJrNYpSsqA";
      request(app)
        .get("/api/all_posts")
        .set("Authorization", `Bearer ${token1}`)
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
          assert.strictEqual(
            res.body.message,
            "This user hasn't posted anything"
          );
          done();
        });
    });
  });
});
