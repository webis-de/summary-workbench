const mongoose = require("mongoose");

const calculationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    comparisons: {
      type: Array,
    },
    scores: {
      type: mongoose.Schema.Types.Mixed,
    },
    date_modified: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

calculationSchema.statics._insert = async function (obj) {
  const entry = await this.create(obj);
  await entry.save();
};

calculationSchema.statics.insert = async function (obj) {
  let counter = 0;
  const oldname = obj["name"];
  if (!oldname) {
    throw Error(`name ${oldname} is invalid`);
  }
  let name = oldname;
  while (await this.exists({ name })) {
    console.log(`${name} already exists`);
    name = `${oldname}-${counter++}`;
  }
  obj["name"] = name;
  await this._insert(obj);
};

calculationSchema.statics.delete = async function (name) {
  return Boolean((await this.deleteOne({ name })).deletedCount);
};

calculationSchema.statics.allWithoutComparisons = async function () {
  return await this.find({}, { _id: 0, comparisons: 0, date_modified: 0 })
    .sort({
      date_modified: -1,
    })
    .lean();
};

calculationSchema.statics.get = async function (name) {
  return await this.findOne({ name }, { comparisons: 1, _id: 0 }).lean();
};

const Calculations = mongoose.model("Calculations", calculationSchema);

module.exports = Calculations;
