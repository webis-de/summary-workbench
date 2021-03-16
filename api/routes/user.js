const express = require("express");
const validateMiddleware = require("../middleware/validate");
const User = require("../models/user");
const auth = require("../middleware/auth");

const { body, check } = require("express-validator");

const {
  sendAccessToken,
  sendRefreshToken,
  createAccessToken,
  verifyRefreshToken,
  clearRefreshToken,
} = require("../tokens");

const router = express.Router();

router.route("/register").post(async (req, res, next) => {
  try {
    const user = await User.createUser(req.body);
    return await user.sendNewTokens(res);
  } catch (err) {
    return next(err.message);
  }
});

router.route("/login").post(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    return await user.sendNewTokens(res);
  } catch (err) {
    return next(err);
  }
});

router.post("/refresh", async (req, res, next) => {
  const token = req.cookies.refreshtoken;
  try {
    if (!token) throw new Error("no refresh token provided");

    let userID;
    try {
      userID = verifyRefreshToken(token);
    } catch (err) {
      throw new Error("invalid refresh token provided");
    }

    const user = await User.findById(userID);
    if (!user) throw new Error("ivalid user");

    return user.sendNewTokens(res);
  } catch (err) {
    return next(err)
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    clearRefreshToken(res);
    return res.send({
      message: "logged out",
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
