const notificationRepository = require("../database/repositories/notificationRepository");
const db = require("../database/connection");
const logger = require("../utils/logger");

// GET /api/v1/notifications
exports.getAllNotifications = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    logger.info("Fetching notifications", { limit, offset });

    const notifications = await notificationRepository.findAll(limit, offset);
    const totalResult = await db.query("SELECT COUNT(*) FROM notifications");
    const total = parseInt(totalResult.rows[0].count);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching notifications:", error);
    next(error);
  }
};

// GET /api/v1/notifications/:id
exports.getNotificationById = async (req, res, next) => {
  try {
    const notification = await notificationRepository.findById(req.params.id);

    if (!notification) {
      logger.warn("Notification not found", { id: req.params.id });
      return res.status(404).json({ error: "Notification not found" });
    }

    logger.info("Notification retrieved", { id: req.params.id });

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    logger.error("Error fetching notification:", error);
    next(error);
  }
};

// POST /api/v1/notifications
exports.createNotification = async (req, res, next) => {
  try {
    const { recipient, channel, subject, content, data } = req.body;

    // Validation
    if (!recipient || !channel || !content) {
      logger.warn("API notification creation failed - missing fields", {
        hasRecipient: !!recipient,
        channel,
        hasContent: !!content,
      });
      return res.status(400).json({
        error: "Missing required fields: recipient, channel, content",
      });
    }

    const notification = await notificationRepository.create({
      recipient,
      channel,
      subject: subject || "Notification",
      content,
      metadata: data,
    });

    logger.info("API notification created", {
      notificationId: notification.id,
      channel,
      recipient: recipient.substring(0, 3) + "***", // Log partial for privacy
    });

    res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    logger.error("Error creating notification:", error);
    next(error);
  }
};

// DELETE /api/v1/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    const deleted = await notificationRepository.delete(req.params.id);

    if (!deleted) {
      logger.warn("Delete failed - notification not found", {
        id: req.params.id,
      });
      return res.status(404).json({ error: "Notification not found" });
    }

    logger.info("Notification deleted", { id: deleted.id });

    res.json({
      success: true,
      message: "Notification deleted",
      id: deleted.id,
    });
  } catch (error) {
    logger.error("Error deleting notification:", error);
    next(error);
  }
};