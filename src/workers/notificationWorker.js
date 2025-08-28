const queueManager = require("../core/queue/queueManager");
const notificationRepository = require("../database/repositories/notificationRepository");
const emailChannel = require("../core/channels/emailChannel");
const smsChannel = require("../core/channels/smsChannel");
const webhookChannel = require("../core/channels/webhookChannel");
const pushChannel = require("../core/channels/pushChannel");

class NotificationWorker {
  constructor() {
    this.isRunning = false;
    this.channels = {
      email: emailChannel,
      sms: smsChannel,
      webhook: webhookChannel,
      push: pushChannel,
    };
  }

  async start() {
    this.isRunning = true;
    console.log("🚀 Notification worker started");
    console.log("Available channels:", Object.keys(this.channels));

    while (this.isRunning) {
      try {
        console.log("Checking for jobs...");
        const job = await queueManager.dequeue();

        if (job) {
          console.log("Found job:", job);
          await this.processNotification(job);
        } else {
          console.log("No jobs found, waiting...");
          await this.sleep(5000);
        }
      } catch (error) {
        console.error("Worker error:", error);
        await this.sleep(5000);
      }
    }
  }

  async processNotification(job) {
    try {
      console.log(`Processing notification ${job.notification_id}`);

      // Get notification details
      const notification = await notificationRepository.findById(
        job.notification_id
      );

      if (!notification) {
        throw new Error("Notification not found");
      }

      // Get appropriate channel
      const channel = this.channels[notification.channel];

      if (!channel) {
        throw new Error(`Channel ${notification.channel} not supported`);
      }

      // Send notification
      const result = await channel.send(notification);

      // Update notification status
      await notificationRepository.updateStatus(notification.id, "delivered");

      // Mark queue item complete
      await queueManager.markComplete(job.id);

      console.log(`✅ Notification ${notification.id} delivered`);
    } catch (error) {
      console.error(`Failed to process notification:`, error.message);

      // Update notification status
      await notificationRepository.updateStatus(job.notification_id, "failed");

      // Mark queue item failed
      await queueManager.markFailed(job.id);
    }
  }

  async stop() {
    this.isRunning = false;
    console.log("🛑 Notification worker stopped");
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = NotificationWorker;
