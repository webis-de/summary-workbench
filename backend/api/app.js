const cors = require("cors");
const express = require("express");
const logger = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const apiRouter = require("./routes/api");
const userRouter = require("./routes/user");

const app = express();

const errorMiddleware = (err, req, res, next) => {
  console.error(err);
  return res.status(400).json({ error: err.message });
};

app.use(logger("dev"));
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", apiRouter);
app.use("/api/user", userRouter);
app.use(errorMiddleware);

module.exports = app;
