const express = require('express');
const router = express.Router();

const dashboardController = require('../../controllers/dashboardController');
const templateController = require('../../controllers/templateController');

// Dashboard home page
router.get('/', dashboardController.getDashboard);

// Send notification form page
router.get('/send', dashboardController.getSendForm);

// Handle send notification form submission
router.post('/send', dashboardController.postSendNotification);

// View single notification details
router.get('/notification/:id', dashboardController.getNotificationDetails);

// Templates page 
router.get('/templates', templateController.getTemplates);

// Show create template form
router.get('/templates/create', templateController.getCreateTemplate);

// Handle create template form submission
router.post('/templates/create', templateController.postCreateTemplate);

// Analytics page
router.get('/analytics', dashboardController.getAnalytics);

module.exports = router;