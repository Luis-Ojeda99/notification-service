const express = require('express');
const router = express.Router();
const notificationController = require('../../../controllers/notificationController');

// GET /api/v1/notifications - Get all notifications
router.get('/', notificationController.getAllNotifications);

// GET /api/v1/notifications/:id - Get single notification
router.get('/:id', notificationController.getNotificationById);

// POST /api/v1/notifications - Create notification
router.post('/', notificationController.createNotification);

// DELETE /api/v1/notifications/:id - Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;