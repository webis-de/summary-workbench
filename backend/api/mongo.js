const { MONGODB_HOST } = require("./config");
const mongoose = require("mongoose");

const connectDB = () => new Promise((resolve, reject) => {
  mongoose.connect(MONGODB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  const db = mongoose.connection;
  db.once("open", () => resolve());
  db.on("error", err => reject(err));
})

module.exports = { connectDB }
