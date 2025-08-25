// src/controllers/dashboardController.js
const notificationRepository = require("../database/repositories/notificationRepository");

// GET / - Dashboard home
exports.getDashboard = async (req, res, next) => {
  try {
    const stats = await notificationRepository.getStats();
    const notifications = await notificationRepository.getRecent(10);

    res.render("pages/dashboard", {
      pageTitle: "Dashboard",
      path: "/",
      stats,
      notifications,
      success: req.query.success || false,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    next(error);
  }
};

// GET /send - Show send notification form
exports.getSendForm = (req, res, next) => {
  try {
    res.render("pages/send", {
      pageTitle: "Send Notification",
      path: "/send",
      error: req.query.error || false,
    });
  } catch (error) {
    next(error);
  }
};

// POST /send - Handle form submission
exports.postSendNotification = async (req, res, next) => {
  try {
    const { recipient, channel, subject, content } = req.body;

    // Basic validation
    if (!recipient || !channel || !content) {
      return res.redirect("/send?error=true");
    }

    await notificationRepository.create({
      recipient,
      channel,
      subject: subject || "Notification",
      content,
    });

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
    console.error("Error fetching notification:", error);
    next(error);
  }
};

// GET /templates - Show templates
exports.getTemplates = async (req, res, next) => {
  try {
    // For now, just render a placeholder
    res.render("pages/templates", {
      pageTitle: "Templates",
      path: "/templates",
      templates: [],
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    next(error);
  }
};

// GET /analytics - Show analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const stats = await notificationRepository.getStats();

    res.render("pages/analytics", {
      pageTitle: "Analytics",
      path: "/analytics",
      stats,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    next(error);
  }
};