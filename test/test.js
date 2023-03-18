const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index");
const expect = require("chai").expect;

chai.use(chaiHttp);

describe("Social Media APIs", () => {
  describe("POST api/authenticate", () => {
    it("Should return a JWT token if user exists in database", function (done) {
      this.timeout(5000);
      chai
        .request(app)
        .post("/api/authenticate")
        .send({ Email: "user1@abc.com", Password: "user@abc" })
        .end(function (err, resp) {
          expect(resp).to.have.status(200);
          expect(resp.body).to.have.property("token");
          done();
        });
    });

    it("Should return a user doesn't exist if Email is entered wrong", function (done) {
      chai
        .request(app)
        .post("/api/authenticate")
        .send({ Email: "user@abc.com", Password: "user@abc" })
        .end(function (err, resp) {
          expect(resp).to.have.status(404);
          expect(resp.body).to.have.property("message");
          done();
        });
    });

    it("Should return password not matched if Password is entered wrong", function (done) {
      chai
        .request(app)
        .post("/api/authenticate")
        .send({ Email: "user1@abc.com", Password: "user1@abc" })
        .end(function (err, resp) {
          expect(resp).to.have.status(401);
          expect(resp.body).to.have.property("message");
          done();
        });
    });
  });
});
