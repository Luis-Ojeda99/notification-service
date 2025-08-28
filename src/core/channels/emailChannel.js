const logger = require("../../utils/logger");

class EmailChannel {
  constructor() {
    this.sgMail = null;
    this.enabled = false;

    if (process.env.SENDGRID_API_KEY) {
      this.sgMail = require("@sendgrid/mail");
      this.sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.enabled = true;
      logger.info("SendGrid email channel initialized");
    } else {
      logger.warn("No SendGrid API key, using mock email");
    }
  }

  async send(notification) {
    try {
      if (!this.enabled) {
        logger.info(`Mock sending email to ${notification.recipient}`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          success: true,
          provider: "mock",
          messageId: `mock_${Date.now()}`,
        };
      }

      const msg = {
        to: notification.recipient,
        from: process.env.SENDGRID_FROM_EMAIL || "test@example.com",
        subject: notification.subject || "Notification",
        text: notification.content,
      };

      const [response] = await this.sgMail.send(msg);

      logger.info("Email sent via SendGrid", {
        to: notification.recipient,
        statusCode: response.statusCode,
      });

      return {
        success: true,
        provider: "sendgrid",
        statusCode: response.statusCode,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("SendGrid error:", error);
      throw error;
    }
  }
}

module.exports = new EmailChannel();
