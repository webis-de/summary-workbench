const express = require("express");
const validateMiddleware = require("../middleware/validate");
const { METRICS, SUMMARIZERS, SUMMARIZERS_INFO, METRICS_INFO } = require("../config")

const { body, check, validationResult } = require("express-validator");
const { sentenceSplitter, articleDownloader } = require("../subservices");
const auth = require("../middleware/auth");

const { isURL } = require("validator");

const Calculations = require("../models/calculations");
const Feedbacks = require("../models/feedbacks");
const Visualization = require("../models/visualization");
const User = require("../models/user");
const Annotation = require("../models/annotation");

const { evaluate } = require("../metrics");
const { summarize } = require("../summarizers");

const router = express.Router();

const allIsIn = (validElements) => (list) =>
  list.every((el) => validElements.includes(el));

const setDefault = (defaultValue) => {
  return (v) => (v === undefined ? defaultValue : v);
};

router.get(
  "/metrics",
  async (req, res, next) => {
    try {
      return res.json(METRICS_INFO);
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  "/summarizers",
  async (req, res, next) => {
    try {
      return res.json(SUMMARIZERS_INFO);
    } catch (err) {
      return next(err);
    }
  }
);

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
  isListOfStrings(body("hypdata")),
  isListOfStrings(body("refdata")),
  isListOfStrings(body("metrics"), METRICS),
];

const validateHypRefMiddleware = (req, res, next) => {
  const { refdata, hypdata } = req.body;
  if (refdata.length !== hypdata.length) {
    return res
      .status(400)
      .json({ message: "hypdata and refdata have to be same size" });
  }
  return next();
};

router.post(
  "/evaluate",
  evaluateValidator,
  validateMiddleware,
  validateHypRefMiddleware,
  async (req, res, next) => {
    try {
      const { metrics, refdata, hypdata } = req.body;
      return res.json({
        metrics: await evaluate(metrics, refdata, hypdata),
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
  isListOfStrings(
    body("summarizers"),
    SUMMARIZERS
  ),
];

router.post(
  "/summarize",
  summarizeValidator,
  validateMiddleware,
  async (req, res, next) => {
    try {
      const { summarizers, text, ratio } = req.body;
      const original = isURL(text)
        ? await articleDownloader.download(text)
        : text;
      let summariesText = await summarize(
        summarizers,
        original,
        ratio
      );
      summaries = {};
      for (const [metric, result] of Object.entries(summariesText)) {
        summaries[metric] = await sentenceSplitter.split(result);
      }
      return res.json({ original, summaries });
    } catch (err) {
      return next(err);
    }
  }
);

const _isNestedListOfStrings = (v) =>
  v instanceof Array
    ? v.every((e) => _isNestedListOfStrings(e))
    : typeof v === "string";
const isNestedListOfStrings = (v) =>
  v instanceof Array && _isNestedListOfStrings(v);

const scoresValidator = (v) =>
  allIsIn(METRICS)(Object.keys(v)) &&
  Object.values(v).map((el) =>
    Object.entries(el).every(
      (key, value) => typeof key === "string" && typeof value === "number"
    )
  );

const calculationsValidator = [
  body("name").isString().trim().notEmpty(),
  body("comparisons").custom(isNestedListOfStrings),
  body("scores").optional().custom(scoresValidator),
];

router
  .route("/calculations")
  .get(async (req, res, next) => {
    try {
      return res.json(await Calculations.allWithoutComparisons());
    } catch (err) {
      return next(err);
    }
  })
  .post(calculationsValidator, validateMiddleware, async (req, res, next) => {
    try {
      await Calculations.insert(req.body);
      return res.status(200).end();
    } catch (err) {
      return next(err);
    }
  });

const successOr404 = (val, res) =>
  val ? res.json(val) : res.status(404).end();
const calculationValidator = [check("name").isString().notEmpty()];
router
  .route("/calculation/:name")
  .get(calculationValidator, validateMiddleware, async (req, res, next) => {
    try {
      return successOr404(await Calculations.get(req.params.name), res);
    } catch (err) {
      return next(err);
    }
  })
  .delete(calculationValidator, validateMiddleware, async (req, res, next) => {
    try {
      const val = await Calculations.delete(req.params.name);
      return successOr404(val, res);
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
      return res.status(200).end();
    } catch (err) {
      return next(err);
    }
  }
);

router.get("/visualizations", auth, async (req, res, next) => {
  try {
    const visualizations = await req.user.getVisualizations();
    return res.status(200).json({ visualizations });
  } catch (err) {
    return next(err);
  }
});

const visualizationRouter = express.Router();
visualizationRouter.use(auth);
router.use("/visualization", visualizationRouter);

visualizationRouter.route("").post(async (req, res, next) => {
  try {
    await req.user.addVisualization(req.body);
    return res.status(200).end();
  } catch (err) {
    return next(err);
  }
});

visualizationRouter.route("/:id").delete(async (req, res, next) => {
  try {
    await req.user.deleteVisualization(req.params.id);
    return res.status(200).end();
  } catch (err) {
    return next(err);
  }
});

visualizationRouter.route("/:id/annotation").get(async (req, res, next) => {
  try {
    const visualization = await req.user.getVisualization(req.params.id);
    const annotation = await visualization.getAnnotation(req.user);
    const visDoc = visualization._doc;
    if (annotation) {
      visDoc.annotation = annotation;
      return res.status(200).json(visDoc);
    }
    throw new Error("annotation not found");
  } catch (err) {
    return next(err);
  }
});

router.post("/annotation/:id", auth, async (req, res, next) => {
  try {
    await Annotation.updateContent(req.params.id, req.user, req.body.content);
    return res.status(200).end();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;