const notificationRepository = require("../database/repositories/notificationRepository");

// GET /api/v1/notifications
exports.getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationRepository.findAll();

    res.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    next(error);
  }
};

// GET /api/v1/notifications/:id
exports.getNotificationById = async (req, res, next) => {
  try {
    const notification = await notificationRepository.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    next(error);
  }
};

// POST /api/v1/notifications
exports.createNotification = async (req, res, next) => {
  try {
    const { recipient, channel, subject, content, data } = req.body;

    // Validation
    if (!recipient || !channel || !content) {
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

    res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    next(error);
  }
};

// DELETE /api/v1/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    const deleted = await notificationRepository.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({
      success: true,
      message: "Notification deleted",
      id: deleted.id,
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    next(error);
  }
};