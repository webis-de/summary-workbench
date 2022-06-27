const mongoose = require("mongoose");
const { MONGODB_HOST } = require("./config");

const connectDB = () =>
  new Promise((resolve, reject) => {
    console.log("MongoDB: waiting");
    mongoose.connect(MONGODB_HOST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = mongoose.connection;
    db.once("open", () => {
      console.log("MongoDB: done waiting");
      resolve();
    });
    db.on("error", (err) => reject(err));
  });

module.exports = { connectDB };
