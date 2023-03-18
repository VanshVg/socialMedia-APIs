const jwt = require("jsonwebtoken");
require("dotenv").config();

let verifyToken = async (req, resp, next) => {
  if (!req.headers.authorization) {
    resp.status(403).send({
      message: "Token Required",
    });
    console.log("Token Required");
  } else {
    let token = req.headers.authorization.split(" ")[1];
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async function (err, decoded) {
        if (err) {
          resp.status(401).send({
            message: "Invalid Token",
          });
          console.log("Invalid Token");
        } else {
          req.user = decoded;
          //   console.log(req.user);
          next();
        }
      }
    );
  }
};

module.exports = verifyToken;
