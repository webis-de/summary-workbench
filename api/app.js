const cors = require("cors");
const express = require("express");
const logger = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const apiRouter = require("./routes/api");
const userRouter = require("./routes/user");

const app = express();

const errorMiddleware = (err, req, res, next) => {
  console.error(err.message)
  res.status(400).json({ error: err.message })
};

app.use(logger("dev"));
app.use(helmet());
app.use(cookieParser());
app.use(cors({origin: true, credentials: true}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({limit: "30mb"}));

app.use("/api", apiRouter);
app.use("/api/user", userRouter);
app.get("/health", (req, res) => res.status(200).end())
app.use(errorMiddleware);

module.exports = app;
