const app = require("./app");
const { connectDB } = require("./mongo");
const { initSubservices } = require("./subservices")
const { initConfig } = require("./config")

const { PORT } = require("./config");

const timeout = (process.env.NODE_ENV === "development") ? 5000 : 30000

const main = async () => {
  await initSubservices();
  await connectDB();
  await initConfig(timeout);

  app.listen(PORT, (err) => {
    if (err) {
      console.log(`Connection Error: ${err}`);
    } else {
      console.log(`Server listening on port ${PORT}`);
    }
  })
}

main()
