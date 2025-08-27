const { body, validationResult } = require("express-validator");

exports.validateCreateNotification = [
  body("recipient").trim().notEmpty().withMessage("Recipient is required"),
  body("channel")
    .isIn(["email", "sms", "push", "webhook"])
    .withMessage("Invalid channel"),
  body("content")
    .trim()
    .notEmpty()
    .isLength({ max: 1000 })
    .withMessage("Content is required (max 1000 chars)"),
  body("subject").optional().trim().isLength({ max: 200 }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: "Validation failed",
        details: errors.array().map((e) => e.msg),
      });
    }
    next();
  },
];