const cors = require("cors");
const express = require("express");
const logger = require("morgan");
const helmet = require("helmet");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const fileUpload = require("express-fileupload");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "tldr api",
      version: "1.0.0",
      description: "tldr api",
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const cookieParser = require("cookie-parser");

const apiRouter = require("./routes/api");

const app = express();

app.use("/api/doc", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

const errorMiddleware = (err, req, res) => {
  console.error(err.message);
  res.status(400).json({ error: err.message });
};

app.use(logger("dev"));
app.use(helmet());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "30mb" }));
app.use(fileUpload())

app.use("/api", apiRouter);
app.get("/health", (req, res) => res.status(200).end());
app.use(errorMiddleware);

module.exports = app;
