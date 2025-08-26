const notificationRepository = require("../database/repositories/notificationRepository");
const templateRepository = require("../database/repositories/templateRepository");
const notificationStatsService = require("../services/notificationStatsService");
const db = require('../database/connection');
const queueManager = require("../core/queue/queueManager");
const logger = require('../utils/logger');

exports.getDashboard = async (req, res, next) => {
  try {
    const { search, status, channel } = req.query;
    logger.info('Dashboard accessed', { search, status, channel });

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
    logger.error('Dashboard error:', error);
    next(error);
  }
};

// GET /send - Show send notification form
exports.getSendForm = async (req, res, next) => {
  try {
    const templates = await templateRepository.findAll();
    logger.info('Send form accessed');

    res.render("pages/send", {
      pageTitle: "Send Notification",
      path: "/send",
      templates,
      error: req.query.error || false,
    });
  } catch (error) {
    logger.error('Send form error:', error);
    next(error);
  }
};

// POST /send - Handle form submission
exports.postSendNotification = async (req, res, next) => {
  try {
    const { recipient, channel, subject, content } = req.body;

    if (!recipient || !channel || !content) {
      logger.warn('Send notification validation failed', { recipient, channel, hasContent: !!content });
      return res.redirect("/send?error=true");
    }

    const notification = await notificationRepository.create({
      recipient,
      channel,
      subject: subject || "Notification",
      content,
    });

    await queueManager.enqueue(notification.id, 1);
    
    logger.info('Notification created and queued', { 
      notificationId: notification.id, 
      recipient, 
      channel 
    });

    res.redirect("/?success=true");
  } catch (error) {
    logger.error('Error creating notification:', error);
    res.redirect("/send?error=true");
  }
};

// GET /notification/:id - View single notification
exports.getNotificationDetails = async (req, res, next) => {
  try {
    const notification = await notificationRepository.findById(req.params.id);

    if (!notification) {
      logger.warn('Notification not found', { id: req.params.id });
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
    logger.error('Notification details error:', error);
    next(error);
  }
};

// GET /analytics - Show analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const stats = await notificationRepository.getStats();
    const channelStats = await notificationStatsService.getChannelStats();
    const topRecipients = await notificationStatsService.getTopRecipients(5);

    logger.info('Analytics accessed');

    res.render("pages/analytics", {
      pageTitle: "Analytics",
      path: "/analytics",
      stats,
      channelStats,
      topRecipients,
    });
  } catch (error) {
    logger.error('Analytics error:', error);
    next(error);
  }
};