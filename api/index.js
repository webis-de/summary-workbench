const app = require("./app");
const { connectDB } = require("./mongo");

const { PORT } = require("./config");

connectDB()
  .then(() =>
    app.listen(PORT, (err) => {
      if (err) {
        console.log(`Connection Error: ${err}`);
      } else {
        console.log(`Server listening on port ${PORT}`);
      }
    })
  )
  .catch((err) => console.error(`MongoDB Error: ${err}`));
