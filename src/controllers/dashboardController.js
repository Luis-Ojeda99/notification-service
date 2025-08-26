const notificationRepository = require("../database/repositories/notificationRepository");
const templateRepository = require("../database/repositories/templateRepository");
const statsService = require("../services/statsService");
const db = require('../database/connection');
const queueManager = require("../core/queue/queueManager");

exports.getDashboard = async (req, res, next) => {
  try {
    const { search, status, channel } = req.query;

    // Build query
    let query = "SELECT * FROM notifications WHERE 1=1";
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (recipient ILIKE $${params.length} OR subject ILIKE $${params.length} OR content ILIKE $${params.length})`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (channel) {
      params.push(channel);
      query += ` AND channel = $${params.length}`;
    }

    query += " ORDER BY created_at DESC LIMIT 10";

    const stats = await notificationRepository.getStats();
    const notifications = await db.query(query, params);

    res.render("pages/dashboard", {
      pageTitle: "Dashboard",
      path: "/",
      stats,
      notifications: notifications.rows,
      search: search || "",
      filterStatus: status || "",
      filterChannel: channel || "",
      success: req.query.success || false,
    });
  } catch (error) {
    if (error.message.includes("Failed to lookup view")) {
      res.status(404).render("pages/404", {
        pageTitle: "404 - Page Not Found",
        path: req.path,
      });
    } else {
      next(error);
    }
  }
};

// GET /send - Show send notification form
exports.getSendForm = async (req, res, next) => {
  try {
    const templates = await templateRepository.findAll();

    res.render("pages/send", {
      pageTitle: "Send Notification",
      path: "/send",
      templates,
      error: req.query.error || false,
    });
  } catch (error) {
    if (error.message.includes("Failed to lookup view")) {
      res.status(404).render("pages/404", {
        pageTitle: "404 - Page Not Found",
        path: req.path,
      });
    } else {
      next(error);
    }
  }
};

// POST /send - Handle form submission
exports.postSendNotification = async (req, res, next) => {
  try {
    const { recipient, channel, subject, content } = req.body;

    if (!recipient || !channel || !content) {
      return res.redirect("/send?error=true");
    }

    const notification = await notificationRepository.create({
      recipient,
      channel,
      subject: subject || "Notification",
      content,
    });

    await queueManager.enqueue(notification.id, 1);

    res.redirect("/?success=true");
  } catch (error) {
    console.error("Error sending notification:", error);
    next(error);
  }
};

// GET /notification/:id - View single notification
exports.getNotificationDetails = async (req, res, next) => {
  try {
    const notification = await notificationRepository.findById(req.params.id);

    if (!notification) {
      return res.status(404).render("pages/404", {
        pageTitle: "404 - Not Found",
        path: req.path,
      });
    }

    res.render("pages/notification-details", {
      pageTitle: "Notification Details",
      path: "/notification",
      notification,
    });
  } catch (error) {
    if (error.message.includes("Failed to lookup view")) {
      res.status(404).render("pages/404", {
        pageTitle: "404 - Page Not Found",
        path: req.path,
      });
    } else {
      next(error);
    }
  }
};

// GET /templates - Show templates
exports.getTemplates = async (req, res, next) => {
  try {
    res.render("pages/templates", {
      pageTitle: "Templates",
      path: "/templates",
      templates: [],
    });
  } catch (error) {
    if (error.message.includes("Failed to lookup view")) {
      res.status(404).render("pages/404", {
        pageTitle: "404 - Page Not Found",
        path: req.path,
      });
    } else {
      next(error);
    }
  }
};

// GET /analytics - Show analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const stats = await notificationRepository.getStats();
    const channelStats = await statsService.getChannelStats();
    const topRecipients = await statsService.getTopRecipients(5);

    res.render("pages/analytics", {
      pageTitle: "Analytics",
      path: "/analytics",
      stats,
      channelStats,
      topRecipients,
    });
  } catch (error) {
    if (error.message.includes("Failed to lookup view")) {
      res.status(404).render("pages/404", {
        pageTitle: "404 - Page Not Found",
        path: req.path,
      });
    } else {
      next(error);
    }
  }
};
