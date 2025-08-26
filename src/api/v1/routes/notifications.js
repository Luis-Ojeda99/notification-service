const express = require('express');
const router = express.Router();
const notificationController = require('../../../controllers/notificationController');
const rateLimiters = require('../../../config/rateLimit');
const { validateCreateNotification } = require('../../../middleware/validation');

/**
 * @route   GET /api/v1/notifications
 * @desc    Get paginated list of notifications
 * @query   limit (default: 20, max: 100), offset (default: 0)
 * @access  Public
 */
router.get('/', notificationController.getAllNotifications);

/**
 * @route   GET /api/v1/notifications/:id
 * @desc    Get a single notification by ID
 * @param   {string} id - Notification UUID
 * @access  Public
 */
router.get('/:id', notificationController.getNotificationById);

/**
 * @route   POST /api/v1/notifications
 * @desc    Create a new notification
 * @body    { recipient, channel, subject?, content }
 * @access  Public (rate limited)
 */
router.post('/', rateLimiters.notificationCreateLimiter, validateCreateNotification, notificationController.createNotification);

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete a notification by ID
 * @param   {string} id - Notification UUID
 * @access  Public
 */
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;