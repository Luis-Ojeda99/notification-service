const express = require("express");
const router = express.Router();

const dashboardController = require("../../controllers/dashboardController");
const templateController = require("../../controllers/templateController");
const bulkNotificationController = require("../../controllers/bulkNotificationController");
const notificationExportController = require("../../controllers/notificationExportController");

// Dashboard routes
router.get("/", dashboardController.getDashboard);

router.get("/send", dashboardController.getSendForm);

router.post("/send", dashboardController.postSendNotification);

router.get("/notification/:id", dashboardController.getNotificationDetails);

router.get("/analytics", dashboardController.getAnalytics);

// Template routes
router.get("/templates", templateController.getTemplates);

router.get("/templates/create", templateController.getCreateTemplate);

router.post("/templates/create", templateController.postCreateTemplate);

// Bulk send routes
router.get("/bulk", bulkNotificationController.getBulkSendForm);

router.post("/bulk", bulkNotificationController.postBulkSend);

// Export route
router.get("/export", notificationExportController.exportNotifications);
module.exports = router;