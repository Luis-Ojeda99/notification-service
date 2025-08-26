const http = require("http");
const https = require("https");
const url = require("url");

class WebhookChannel {
  async send(notification) {
    try {
      console.log(`🔗 Sending webhook to ${notification.recipient}`);

      // Parse URL
      const webhookUrl = url.parse(notification.recipient);
      const isHttps = webhookUrl.protocol === "https:";

      const payload = JSON.stringify({
        subject: notification.subject,
        content: notification.content,
        timestamp: new Date().toISOString(),
        metadata: notification.data,
      });

      const options = {
        hostname: webhookUrl.hostname,
        port: webhookUrl.port || (isHttps ? 443 : 80),
        path: webhookUrl.path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      };

      // Mock for now
      console.log(`   Payload: ${payload}`);
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        success: true,
        provider: "webhook",
        statusCode: 200,
        timestamp: new Date(),
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new WebhookChannel();
