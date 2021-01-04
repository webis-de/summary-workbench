const User = require("../models/user");
const { verifyAccessToken } = require("../tokens");

const auth = async (req, res, next) => {
  try {
    const authorization = req.header("Authorization");
    if (!authorization) throw { error: "Authorization header missing", type: "UNAUTHORIZED" };

    const token = authorization.split(" ")[1];
    const userID = verifyAccessToken(token);
    if (userID === undefined) throw {error: "invalid token", type: "INVALID_TOKEN"};

    const user = await User.findById(userID);
    if (!user) throw { error: "invalid user", type: "INVALID_USER"};

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).send(err);
  }
};

module.exports = auth;
