const User = require("../models/user");
const {verifyAccessToken } = require("../tokens")

const auth = async (req, res, next) => {
  try {
    const authorization = req.header("Authorization")
    if (!authorization) throw new Error("Authorization header missing")

    const token = authorization.split(" ")[1]
    const userID = verifyAccessToken(token)
    if (userID === undefined) throw new Error("invalid token")

    const user = await User.findById(userID)
    if (!user) throw new Error("invalid user")

    req.user = user
    return next()
  } catch (err) {
    return res.status(401).send({error: err.message})
  }
}

module.exports = auth
