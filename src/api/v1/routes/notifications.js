const express = require('express');
const router = express.Router();
const notificationController = require('../../../controllers/notificationController');
const { validateCreateNotification } = require('../middlewares/validateNotification')
const { notificationCreateLimiter } = require('../../../config/rateLimit');

// GET /api/v1/notifications - Get all notifications
router.get('/', notificationController.getAllNotifications);

// GET /api/v1/notifications/:id - Get single notification
router.get('/:id', notificationController.getNotificationById);

// POST /api/v1/notifications - Create notification with rate limit
router.post('/', notificationCreateLimiter, notificationController.createNotification);

// DELETE /api/v1/notifications/:id - Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;