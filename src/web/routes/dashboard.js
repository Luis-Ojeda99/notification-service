const express = require('express');
const router = express.Router();

const dashboardController = require('../../controllers/dashboardController');
const templateController = require('../../controllers/templateController');
const bulkController = require('../../controllers/bulkController');

// Dashboard routes
router.get('/', dashboardController.getDashboard);

router.get('/send', dashboardController.getSendForm);

router.post('/send', dashboardController.postSendNotification);

router.get('/notification/:id', dashboardController.getNotificationDetails);

router.get('/analytics', dashboardController.getAnalytics);

// Template routes
router.get('/templates', templateController.getTemplates);

router.get('/templates/create', templateController.getCreateTemplate);

router.post('/templates/create', templateController.postCreateTemplate);

// Bulk send routes
router.get('/bulk', bulkController.getBulkSendForm);

router.post('/bulk', bulkController.postBulkSend);

module.exports = router;