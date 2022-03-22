const mongoose = require("mongoose");
const mongooseValidator = require("mongoose-validator");

const namedValidator = [
  mongooseValidator({
    validator: "isURL",
    arguments: {
      protocols: ["http", "https", "ftp"],
      require_tld: true,
      require_protocol: true,
    },
    message: "Must be a Valid URL",
  }),
];

const feedbackSchema = new mongoose.Schema(
  {
    summarizer: { type: String, required: true },
    summary: { type: String, required: true },
    reference: { type: String, required: true },
    url: {
      type: String,
      validate: namedValidator,
    },
    feedback: { type: String, required: true },
    date_modified: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

feedbackSchema.statics.insert = async function insert(obj) {
  const entry = await this.create(obj);
  await entry.save();
};

const Feedbacks = mongoose.model("Feedbacks", feedbackSchema);

module.exports = Feedbacks;
