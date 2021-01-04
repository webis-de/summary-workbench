const mongoose = require("mongoose");
const mongooseValidator = require("mongoose-validator");

const AnnotationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: { type: mongoose.Schema.Types.Mixed, default: Object },
  },
  { versionKey: false }
);

AnnotationSchema.statics.createAnnotation = async function (user, content) {
  const annotation = await this.create({owner: user._id, content})
  annotation.markModified("content");
  await annotation.save()
  return annotation;
}

AnnotationSchema.statics.updateContent = async function (id, user, content) {
  if (!content) throw new Error("invalid content")
  const annotation = await this.findOne({_id: id, owner: user._id})
  if (annotation) {
    annotation.content = content;
    annotation.markModified("content");
    await annotation.save();
  } else throw new Error("unknown annotation")
};

const Annotation = mongoose.model("Annotation", AnnotationSchema);

module.exports = Annotation;
