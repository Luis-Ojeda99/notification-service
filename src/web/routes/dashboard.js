const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/dashboardController');
const templateController = require('../../controllers/templateController');
const bulkNotificationController = require('../../controllers/bulkNotificationController');
const notificationExportController = require('../../controllers/notificationExportController');

/**
 * @route   GET /
 * @desc    Dashboard home page with notifications list
 * @query   search?, status?, channel?
 * @access  Public
 */
router.get('/', dashboardController.getDashboard);

/**
 * @route   GET /send
 * @desc    Show send notification form
 * @access  Public
 */
router.get('/send', dashboardController.getSendForm);

/**
 * @route   POST /send
 * @desc    Handle notification form submission
 * @body    { recipient, channel, subject?, content }
 * @access  Public
 */
router.post('/send', dashboardController.postSendNotification);

/**
 * @route   GET /notification/:id
 * @desc    View single notification details
 * @param   {string} id - Notification UUID
 * @access  Public
 */
router.get('/notification/:id', dashboardController.getNotificationDetails);

/**
 * @route   GET /analytics
 * @desc    Show analytics and statistics
 * @access  Public
 */
router.get('/analytics', dashboardController.getAnalytics);

/**
 * @route   GET /templates
 * @desc    Show templates list
 * @access  Public
 */
router.get('/templates', templateController.getTemplates);

/**
 * @route   GET /templates/create
 * @desc    Show create template form
 * @access  Public
 */
router.get('/templates/create', templateController.getCreateTemplate);

/**
 * @route   POST /templates/create
 * @desc    Handle template creation
 * @body    { name, description?, subject?, content, html_content?, variables?, channel }
 * @access  Public
 */
router.post('/templates/create', templateController.postCreateTemplate);

/**
 * @route   GET /bulk
 * @desc    Show bulk send form
 * @access  Public
 */
router.get('/bulk', bulkNotificationController.getBulkSendForm);

/**
 * @route   POST /bulk
 * @desc    Handle bulk notification sending
 * @body    { recipients[], template_id?, channel, subject?, content }
 * @access  Public (rate limited)
 */
router.post('/bulk', bulkNotificationController.postBulkSend);

/**
 * @route   GET /export
 * @desc    Export notifications data
 * @query   format? (default: json), start_date?, end_date?
 * @access  Public (rate limited)
 */
router.get('/export', notificationExportController.exportNotifications);

module.exports = router;