exports.validateCreateNotification = (req, res, next) => {
  const { recipient, channel, content } = req.body;
  const errors = [];

  if (!recipient) errors.push("recipient is required");
  if (!channel) errors.push("channel is required");
  if (!content) errors.push("content is required");

  const validChannels = ["email", "sms", "webhook", "push"];
  if (channel && !validChannels.includes(channel)) {
    errors.push(`channel must be one of: ${validChannels.join(", ")}`);
  }

  if (errors.length > 0) {
    return res.status(422).json({
      error: "Validation failed",
      details: errors,
    });
  }

  next();
};