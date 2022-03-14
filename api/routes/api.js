const express = require("express");
const validateMiddleware = require("../middleware/validate");
const {
  METRICS,
  SUMMARIZERS,
  ALL_SUMMARIZERS,
  ALL_METRICS,
} = require("../config");

const { body } = require("express-validator");
const {
  sentenceSplitter,
  articleDownloader,
  pdfExtractor,
} = require("../subservices");

const { isURL } = require("validator");

const Feedbacks = require("../models/feedbacks");

const { evaluate } = require("../metrics");
const { summarize } = require("../summarizers");

const router = express.Router();

const allIsIn = (validElements) => (list) =>
  list.every((el) => validElements.includes(el));

const setDefault = (defaultValue) => (v) => v === undefined ? defaultValue : v;

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     description: get available metrics together with their properties
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Failure
 */

router.get("/metrics", async (req, res, next) => {
  try {
    return res.json(ALL_METRICS);
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /api/summarizers:
 *   get:
 *     description: get available summarizers together with their properties
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Failure
 */

router.get("/summarizers", async (req, res, next) => {
  try {
    return res.json(ALL_SUMMARIZERS);
  } catch (err) {
    return next(err);
  }
});

const isListOfStrings = (field, validElements) => {
  let val = field
    .isArray()
    .withMessage("has to be non-empty List of Strings")
    .bail()
    .notEmpty()
    .withMessage("has to be non-empty List of Strings")
    .bail()
    .custom((list) => list.every((el) => typeof el === "string"))
    .withMessage("has to be non-empty List of Strings");
  if (validElements !== undefined) {
    val = val
      .custom(allIsIn(validElements))
      .withMessage(
        `has to only contain elements from ${JSON.stringify(
          Array.from(validElements)
        )}`
      );
  }
  return val;
};

const evaluateValidator = [
  isListOfStrings(body("hypotheses")),
  isListOfStrings(body("references")),
  isListOfStrings(body("metrics"), METRICS),
];

const validateHypRefMiddleware = (req, res, next) => {
  const { references, hypotheses } = req.body;
  if (references.length !== hypotheses.length) {
    return res
      .status(400)
      .json({ message: "hypotheses and references have to be same size" });
  }
  return next();
};

/**
 * @swagger
 * /api/evaluate:
 *   post:
 *     description: evaluate summarized texts with some metrics
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metrics:
 *                 description: list of metrics for the evaluation
 *                 example: ["anonymous-rouge", "anonymous-bleu"]
 *                 schema:
 *                   type: array
 *                   items:
 *                     type: string
 *               references:
 *                 description: list of texts
 *                 example: ["I like to swim. Water is nice", "I like forests, because trees are nice. I wish i could climb."]
 *                 schema:
 *                   type: array
 *                   items:
 *                     type: string
 *               hypotheses:
 *                 description: List of texts which are the summaries of the texts with corresponding index in the references array. It has to have the same length as the references array.
 *                 example: ["Water is nice.", "Forests are nice."]
 *                 schema:
 *                   type: array
 *                   items:
 *                     type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Failure
 */
router.post(
  "/evaluate",
  evaluateValidator,
  validateMiddleware,
  validateHypRefMiddleware,
  async (req, res, next) => {
    try {
      const { metrics, references, hypotheses } = req.body;
      return res.json({
        scores: await evaluate(metrics, hypotheses, references),
      });
    } catch (err) {
      return next(err);
    }
  }
);

const summarizeValidator = [
  body("text").isString().withMessage("has to be String"),
  body("ratio")
    .customSanitizer(setDefault(0.2))
    .isFloat({ gt: 0.0, lt: 1.0 })
    .withMessage("has to be between 0.0 and 1.0"),
  isListOfStrings(body("summarizers"), SUMMARIZERS),
];

/**
 * @swagger
 * /api/summarize:
 *   post:
 *     description: Summarize A text or url
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               summarizers:
 *                 description: list of summarizers to use (see /api/summarizers)
 *                 example: ["anonymous-textrank", "anonymous-newspaper3k"]
 *                 schema:
 *                   type: array
 *                   items:
 *                     type: string
 *               text:
 *                 description: text to summarizer or url of a website which is used to crawl the text
 *                 example: New World was inhabited by an alien species called the Spackle . The last few hundred survivors are stuck in one small village that 's slowly dying since no one can have any kids.
 *                 type: string
 *               ratio:
 *                 description: length of the summarie
 *                 example: 0.1
 *                 schema:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 1
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Failure
 *
 */
router.post(
  "/summarize",
  summarizeValidator,
  validateMiddleware,
  async (req, res, next) => {
    try {
      const { summarizers, text, ratio } = req.body;
      const textIsURL = isURL(text);
      const original = textIsURL
        ? await articleDownloader.download(text)
        : { text };
      let summariesText = await summarize(summarizers, original.text, ratio);
      let summaries = {};
      for (const [metric, result] of Object.entries(summariesText)) {
        summaries[metric] = await sentenceSplitter.split(result);
      }
      original["text"] = await sentenceSplitter.split(original["text"]);
      response = { original, summaries };
      if (textIsURL) response["url"] = text;
      return res.json(response);
    } catch (err) {
      return next(err);
    }
  }
);

const extractPdfs = (files) =>
  Object.values(files)
    .filter(({ mimetype }) => mimetype === "application/pdf")
    .map(({ data }) => data);

const extractPdfJson = (json) => {
  const { title, abstract } = json;
  const pdfBody = json.pdf_parse.body_text;
  const sections = [];
  let currSection = null;
  pdfBody.forEach(({ text, section, sec_num: secNum }) => {
    if (currSection !== null) {
      if (currSection.section !== section || currSection.secNum !== secNum) {
        sections.push(currSection);
        currSection = null;
      }
    }
    if (currSection === null) currSection = { section, secNum, texts: [] };
    currSection.texts.push(text);
  });
  if (currSection !== null) sections.push(currSection);
  return { title, abstract, sections };
};

/**
 * @swagger
 * /api/pdf/extract:
 *   post:
 *     description: Upload a pdf file and extract the content (title, abstract, text).
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Failure
 *
 */

router.post("/pdf/extract", async (req, res, next) => {
  try {
    const { files } = req;
    if (!files) return res.status(400).send("No files were uploaded.");
    const pdfFiles = extractPdfs(files);
    if (!pdfFiles.length)
      return res.status(400).send("No pdf files were uploaded.");
    const pdf = pdfFiles[0];
    const json = await pdfExtractor.extract(pdf);
    return res.json(extractPdfJson(json));
  } catch (err) {
    return next(err);
  }
});

const feedbackValidator = [
  body("summarizer").isIn(SUMMARIZERS),
  body("summary").isString(),
  body("reference").isString(),
  body("url").optional().isURL(),
  body("feedback").isString(),
];
router.post(
  "/feedback",
  feedbackValidator,
  validateMiddleware,
  async (req, res, next) => {
    try {
      await Feedbacks.insert(req.body);
      return res.json({ sucess: true });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
