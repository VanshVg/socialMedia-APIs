// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// let verifyToken = async (req, resp, next) => {
//   if (!req.headers.authorization) {
//     resp.status(403).send({
//       message: "Token Required",
//     });
//   } else {
//     let token = req.headers.authorization.split(" ")[1];
//     jwt.verify(
//       token,
//       process.env.ACCESS_TOKEN_SECRET,
//       async function (err, decoded) {
//         if (err) {
//           resp.status(401).send({
//             message: "Invalid Token",
//           });
//         } else {
//           req.user = decoded;
//           next();
//         }
//       }
//     );
//   }
// };

// module.exports = verifyToken;

const jwt = require("jsonwebtoken");

require("dotenv").config();

let isAuthenticated = async (req, resp, next) => {
  const { token } = req.cookies;
  if (!token) {
    resp.status(403).send({
      message: "Login required",
    });
  } else {
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async function (err, decoded) {
        if (err) {
          resp.status(401).send({
            message: "Invalid token",
          });
        } else {
          req.user = decoded;
          next();
        }
      }
    );
  }
};

module.exports = isAuthenticated;
