const notificationRepository = require("../database/repositories/notificationRepository");
const queueManager = require("../core/queue/queueManager");
const logger = require("../utils/logger");

exports.getBulkSendForm = async (req, res, next) => {
  try {
    logger.info("Bulk send form accessed");

    res.render("pages/bulk-send", {
      pageTitle: "Bulk Send",
      path: "/bulk",
      error: req.query.error || false,
      success: req.query.success || false,
    });
  } catch (error) {
    logger.error("Error loading bulk send form:", error);
    next(error);
  }
};

exports.postBulkSend = async (req, res, next) => {
  try {
    const { recipients, channel, subject, content } = req.body;

    if (!recipients || !channel || !content) {
      logger.warn("Bulk send validation failed", {
        hasRecipients: !!recipients,
        channel,
        hasContent: !!content,
      });
      return res.redirect("/bulk?error=true");
    }

    // Parse recipients (comma or newline separated)
    const recipientList = recipients
      .split(/[,\n]/)
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (recipientList.length === 0) {
      logger.warn("Bulk send failed - no valid recipients after parsing");
      return res.redirect("/bulk?error=true");
    }

    logger.info("Starting bulk send", {
      recipientCount: recipientList.length,
      channel,
    });

    // Create notifications for each recipient
    let created = 0;
    let failed = 0;

    for (const recipient of recipientList) {
      try {
        const notification = await notificationRepository.create({
          recipient,
          channel,
          subject: subject || "Bulk Notification",
          content,
        });
        await queueManager.enqueue(notification.id, 0); // Lower priority for bulk
        created++;
      } catch (error) {
        logger.error(`Failed to create notification for recipient`, {
          recipient,
          error: error.message,
        });
        failed++;
      }
    }

    logger.info("Bulk send completed", {
      created,
      failed,
      total: recipientList.length,
    });

    res.redirect(`/?success=true&message=Created ${created} notifications`);
  } catch (error) {
    logger.error("Bulk send error:", error);
    next(error);
  }
};