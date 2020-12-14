const cors = require("cors");
const express = require("express");
const logger = require("morgan");
const helmet = require("helmet");

const apiRouter = require("./routes/api");

const app = express();

const errorMiddleware = (err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ message: "something went wrong" });
};

app.use(logger("dev"));
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", apiRouter);
app.use(errorMiddleware);

module.exports = app;
