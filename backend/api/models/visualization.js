const mongoose = require("mongoose");
const mongooseValidator = require("mongoose-validator");
const Annotation = require("./annotation");

const getDocType = (name, many = false) => {
  let type = {
    name: {
      type: String,
      required: [true, `${name}.name is missing`],
      trim: true,
    },
    lines: {
      type: [String],
      required: [true, `${name}.lines is missing`],
      trim: true,
    },
  };
  if (many) type = [type];
  return { type, required: [true, `${name} is missing`] };
};

const VisualizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "name is missing"] },
    length: { type: Number, minLength: 1 },
    documents: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      required: [true, "documents is missing"],
    },
    references: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      required: [true, "references is missing"],
    },
    models: {
      type: [
        {
          name: {
            type: String,
            required: [true, "models.name is missing"],
            trim: true,
          },
          lines: {
            type: [String],
            required: [true, "models.lines is missing"],
            trim: true,
          },
        },
      ],
      required: [true, "models is missing"],
      validate: [(arr) => arr.length > 0, "at least one model is needed"]
    },
    annotationTemplate: {
      type: [
        {
          question: {
            type: String,
            minLength: 1,
            required: [true, "question is required"],
          },
          type: {
            type: String,
            required: true,
            enum: {
              values: [
                "short text",
                "likert scale",
                "checkboxes",
                "radio buttons",
              ],
              message: "invalid type",
            },
          },
          options: [{ type: String, minLength: 1 }],
        },
      ],
      default: [],
    },
    annotations: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Annotation",
        },
      ],
      default: [],
    },
  },
  { versionKey: false }
);

VisualizationSchema.pre("save", function (next) {
  this.length = this.documents.length;
  next();
});

VisualizationSchema.pre("validate", function (next) {
  try {
    const length = this.documents.length;
    const allLength = [
      this.references.length,
      ...this.models.map((model) => model.lines.length),
    ];
    if (!allLength.every((a) => a === length)) throw new Error();
    next();
  } catch (error) {
    next(
      new Error(
        "documents, references and models have to have same number of examples"
      )
    );
  }
});

VisualizationSchema.methods.createAnnotation = async function (user) {
  let annotation = await Annotation.createAnnotation(user, {});
  this.annotations.push(annotation), await this.save();
  return annotation;
};

VisualizationSchema.methods.getAnnotation = async function (user) {
  const visualization = await this.populate({
    path: "annotations",
    match: { owner: user._id },
    select: ["_id", "content"],
  }).execPopulate();
  const annotations = visualization.annotations;
  if (annotations && annotations.length) {
    return annotations[0];
  }
  const annotation = await this.createAnnotation(user);
  const { _id, content } = annotation;
  return { _id, content };
};

VisualizationSchema.methods.updateContent = async function (user, content) {
  const visualization = await this.populate({
    path: "annotations",
    match: { owner: user._id },
  }).execPopulate();
  const annotations = visualization.annotations;
  let annotation;
  if (annotations && annotations.length) {
    annotation = annotation[0];
    annotation.content = content;
    annotation.markModified("content");
    await annotation.save();
  } else {
    annotation = await Annotation.create({ owner: user, content });
    annotation.markModified("content");
    await annotation.save();
    visualization.annotations.push(annotation);
    await visualization.save();
  }
};

const Visualization = mongoose.model("Visualization", VisualizationSchema);

module.exports = Visualization;
