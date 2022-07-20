const express = require("express");
const { body } = require("express-validator");
const { isURL } = require("validator");
const validateMiddleware = require("../middleware/validate");
const { currentConfig } = require("../config");

const {
  sentenceSplitter,
  articleDownloader,
  pdfExtractor,
  semanticSimilarity,
} = require("../subservices");

const Feedbacks = require("../models/feedbacks");

const { evaluate } = require("../metrics");
const { summarize } = require("../summarizers");

const router = express.Router();

const allIsIn = (validElements, key) => (list) => {
  if (key) return list.every((el) => validElements[key].includes(el));
  return list.every((el) => validElements.includes(el));
};

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
    return res.json(currentConfig.METRICS);
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
    return res.json(currentConfig.SUMMARIZERS);
  } catch (err) {
    return next(err);
  }
});

const isListOfStrings = (field, validElements, key) => {
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
      .custom(allIsIn(validElements, key))
      .withMessage(
        `has to only contain elements from ${JSON.stringify(Array.from(validElements))}`
      );
  }
  return val;
};

const isValidPlugins = (field, key) =>
  field
    .custom((obj) => allIsIn(currentConfig[key])(Object.keys(obj)))
    .withMessage(`unknown key provided`);

const evaluateValidator = [
  isListOfStrings(body("hypotheses")),
  isListOfStrings(body("references")),
  isValidPlugins(body("metrics"), "METRIC_KEYS"),
];

const validateHypRefMiddleware = (req, res, next) => {
  const { references, hypotheses } = req.body;
  if (references.length !== hypotheses.length) {
    return res.status(400).json({ message: "hypotheses and references have to be same size" });
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
 *                 description: object with metric identifier as key and arguments as value (if metric needs arguments) (see /api/metrics)
 *                 example: { "metric-null-rouge": {}, "metric-null-bleu": {} }
 *                 type: object
 *                 additionalProperties:
 *                   type: object
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
      const scores = await evaluate(metrics, hypotheses, references, req.abortController);
      if (req.abortController.signal.aborted) return
      res.json({ data: { scores } });
    } catch (err) {
      next(err);
    }
  }
);

const summarizeValidator = [
  body("text").isString().withMessage("has to be String"),
  body("ratio")
    .customSanitizer(setDefault(0.2))
    .isFloat({ gt: 0.0, lt: 1.0 })
    .withMessage("has to be between 0.0 and 1.0"),
  isValidPlugins(body("summarizers"), "SUMMARIZER_KEYS"),
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
 *                 description: object with summary identifier as key and arguments as value (if summarizer needs arguments) (see /api/summarizers)
 *                 example: { "summarizer-null-textrank": {}, "summarizer-null-newspaper3k": {} }
 *                 type: object
 *                 additionalProperties:
 *                   type: object
 *               text:
 *                 description: text to summarize a text or an url of a website which is used to crawl the text
 *                 example: Alan Mathison Turing was an English mathematician, computer scientist, logician, cryptanalyst, philosopher, and theoretical biologist. Turing was highly influential in the development of theoretical computer science, providing a formalisation of the concepts of algorithm and computation with the Turing machine, which can be considered a model of a general-purpose computer. Turing is widely considered to be the father of theoretical computer science and artificial intelligence. Despite these accomplishments, he was never fully recognised in his home country, if only because much of his work was covered by the Official Secrets Act.
 *                 type: string
 *               ratio:
 *                 description: length of the summarie
 *                 example: 0.1
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Failure
 *
 */

router.post("/summarize", summarizeValidator, validateMiddleware, async (req, res, next) => {
  try {
    const { text, summarizers, ratio } = req.body;
    const textIsURL = isURL(text);
    const original = textIsURL ? await articleDownloader.download(text) : { text };
    original.text = original.text.trim()
    let summaries = await summarize(summarizers, original.text, ratio, req.abortController);
    if (req.abortController.signal.aborted) return
    summaries = await Promise.all(
      Object.entries(summaries).map(async ([key, value]) => {
        const { summary } = value;
        const newValue = { ...value };
        if (typeof summary === "string") {
          newValue.summary = await sentenceSplitter.split(summary);
        }
        return [key, newValue];
      })
    );
    summaries = Object.fromEntries(summaries);
    original.text = await sentenceSplitter.split(original.text);
    const response = { data: { original, summaries } };
    if (textIsURL) response.url = text;
    res.json(response);
  } catch (err) {
    next(err);
  }
});

const bulkSummarizeValidator = [
  isListOfStrings(body("documents")),
  body("ratio")
    .customSanitizer(setDefault(0.2))
    .isFloat({ gt: 0.0, lt: 1.0 })
    .withMessage("has to be between 0.0 and 1.0"),
  isValidPlugins(body("summarizers"), "SUMMARIZER_KEYS"),
];

/**
 * @swagger
 * /api/summarize/bulk:
 *   post:
 *     description: Summarize A text or url
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               summarizers:
 *                 description: object with summary identifier as key and arguments as value (if summarizer needs arguments) (see /api/summarizers)
 *                 example: { "summarizer-null-textrank": {}, "summarizer-null-newspaper3k": {} }
 *                 type: object
 *                 additionalProperties:
 *                   type: object
 *               documents:
 *                 description: list of texts to summarize
 *                 example: [
 *                   "Alan Mathison Turing was an English mathematician, computer scientist, logician, cryptanalyst, philosopher, and theoretical biologist. Turing was highly influential in the development of theoretical computer science, providing a formalisation of the concepts of algorithm and computation with the Turing machine, which can be considered a model of a general-purpose computer. Turing is widely considered to be the father of theoretical computer science and artificial intelligence. Despite these accomplishments, he was never fully recognised in his home country, if only because much of his work was covered by the Official Secrets Act.",
 *                   "Turing played a crucial role in cracking intercepted coded messages that enabled the Allies to defeat the Nazis in many crucial engagements, including the Battle of the Atlantic. Due to the problems of counterfactual history, it is hard to estimate the precise effect Ultra intelligence had on the war, but Professor Jack Copeland has estimated that this work shortened the war in Europe by more than two years and saved over 14 million lives. After the war, Turing worked at the National Physical Laboratory, where he designed the Automatic Computing Engine. The Automatic Computing Engine was one of the first designs for a stored-program computer. In 1948, Turing joined Max Newman's Computing Machine Laboratory, at the Victoria University of Manchester, where he helped develop the Manchester computers and became interested in mathematical biology. He wrote a paper on the chemical basis of morphogenesis and predicted oscillating chemical reactions such as the Belousov–Zhabotinsky reaction, first observed in the 1960s."
 *                 ]
 *                 type: array
 *                 items:
 *                   type: string
 *               ratio:
 *                 description: length of the summarie
 *                 example: 0.1
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Failure
 *
 */

router.post("/summarize/bulk", bulkSummarizeValidator, validateMiddleware, async (req, res, next) => {
  try {
    const { documents, summarizers, ratio } = req.body;
    documents.map((line) => line.trim()).filter((line) => line !== "")
    const data = []
    for (const doc of documents) {
      const text = doc.trim()
      let summaries = await summarize(summarizers, text, ratio, req.abortController);
      if (req.abortController.signal.aborted) return
      summaries = Object.entries(summaries).map(([key, value]) => {
        const { summary } = value;
        const newValue = { ...value };
        if (Array.isArray(summary)) newValue.summary = summary.join(" ")
        return [key, newValue];
      })
      summaries = Object.fromEntries(summaries);
      data.push({summaries, document: text})
    }
    res.json({data});
  } catch (err) {
    next(err);
  }
});

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
    let newText = text
    if (!secNum && !section) return
    if (currSection) {
      if (currSection.secNum) {
        if (secNum || !section) {
          if (currSection.secNum !== secNum || (section && currSection.section && currSection.section !== section)) {
            sections.push(currSection);
            currSection = null;
          }
        }
      } else if (section && (secNum || currSection.section !== section)) {
        sections.push(currSection);
        currSection = null;
      }
    }
    if (!currSection) currSection = { section, secNum, texts: [] };
    if (currSection.section) {
      if (section && currSection.section !== section) newText = `${section}\n${text}`
    } else if (section) currSection.section = section
    currSection.texts.push(newText);
  });
  if (currSection !== null) sections.push(currSection);
  return { title, abstract, sections };
};

/**
 * @swagger
 * /api/semantic_similarity:
 *   post:
 *     description: Compute semantic similarity between sentences and a summary.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sentences:
 *                 description: text or list of sentences
 *                 example: ["I like to swim. Water is nice", "I like forests, because trees are nice. I wish i could climb."]
 *                 type: array
 *                 items:
 *                   type: string
 *               summary:
 *                 description: summary of the document
 *                 example: Trees are green.
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Failure
 *
 */

router.post("/semantic_similarity", async (req, res, next) => {
  try {
    const { sentences, summary } = req.body;
    const json = await semanticSimilarity.similarity(sentences, summary);
    return res.json(json);
  } catch (err) {
    return next(err);
  }
});

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
    if (!pdfFiles.length) return res.status(400).send("No pdf files were uploaded.");
    const pdf = pdfFiles[0];
    const json = await pdfExtractor.extract(pdf);
    return res.json(extractPdfJson(json));
  } catch (err) {
    return next(err);
  }
});

const feedbackValidator = [
  body("summarizer").isString(),
  body("summary").isString(),
  body("reference").isString(),
  body("url").optional().isURL(),
  body("feedback").isString(),
];
router.post("/feedback", feedbackValidator, validateMiddleware, async (req, res, next) => {
  try {
    await Feedbacks.insert(req.body);
    return res.json({ sucess: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
