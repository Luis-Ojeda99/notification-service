const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/dashboardController');

// Dashboard home page
router.get('/', dashboardController.getDashboard);

// Send notification form page
router.get('/send', dashboardController.getSendForm);

// Handle send notification form submission
router.post('/send', dashboardController.postSendNotification);

// View single notification details
router.get('/notification/:id', dashboardController.getNotificationDetails);

// Templates page 
router.get('/templates', dashboardController.getTemplates);

// Analytics page
router.get('/analytics', dashboardController.getAnalytics);

module.exports = router;