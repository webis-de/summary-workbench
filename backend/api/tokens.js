const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require("./config");

const createAccessToken = (userID) =>
  jwt.sign({ userID }, ACCESS_TOKEN_SECRET, { expiresIn: "5m" });

const createRefreshToken = (userID) =>
  jwt.sign({ userID }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

const verifyAccessToken = (token) =>
  jwt.verify(token, ACCESS_TOKEN_SECRET).userID;

const verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_TOKEN_SECRET).userID;

const sendAccessToken = (res, accesstoken) => res.send({ accesstoken });

const sendRefreshToken = (res, refreshtoken) =>
  res.cookie("refreshtoken", refreshtoken, {
    httpOnly: true,
    path: "/api/user/refresh",
  });

const clearRefreshToken = (res) =>
  res.clearCookie("refreshtoken", {
    path: "/api/user/refresh",
  });

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  sendAccessToken,
  sendRefreshToken,
  clearRefreshToken,
};
