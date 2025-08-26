const notificationRepository = require("../database/repositories/notificationRepository");
const queueManager = require("../core/queue/queueManager");

exports.getBulkSendForm = async (req, res, next) => {
  try {
    res.render("pages/bulk-send", {
      pageTitle: "Bulk Send",
      path: "/bulk",
      error: req.query.error || false,
      success: req.query.success || false,
    });
  } catch (error) {
    next(error);
  }
};

exports.postBulkSend = async (req, res, next) => {
  try {
    const { recipients, channel, subject, content } = req.body;

    if (!recipients || !channel || !content) {
      return res.redirect("/bulk?error=true");
    }

    // Parse recipients (comma or newline separated)
    const recipientList = recipients
      .split(/[,\n]/)
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (recipientList.length === 0) {
      return res.redirect("/bulk?error=true");
    }

    // Create notifications for each recipient
    let created = 0;
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
        console.error(`Failed to create notification for ${recipient}:`, error);
      }
    }

    res.redirect(`/?success=true&message=Created ${created} notifications`);
  } catch (error) {
    console.error("Bulk send error:", error);
    next(error);
  }
};
