const jwt = require("jsonwebtoken");
const users = require("../models/users");
async function auth(req, res, next) {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const matchedUser = await users.findOne({
      _id: decodedToken._id,
      "tokens.token": token,
    });

    if (!matchedUser) {
      throw new Error("please login and authinticate first");
    }
    req.user = matchedUser;
    next();
  } catch (err) {
    res.status(500).send(err.message);
  }
}

module.exports = auth;
