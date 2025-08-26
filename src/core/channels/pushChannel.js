class PushChannel {
  async send(notification) {
    try {
      console.log(`📲 Sending push notification to ${notification.recipient}`);
      console.log(`   Content: ${notification.content}`);

      // Mock push notification
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Fail 5% of the time
      if (Math.random() < 0.05) {
        throw new Error("Device token expired");
      }

      return {
        success: true,
        provider: "mock-push",
        deviceToken: notification.recipient,
        timestamp: new Date(),
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PushChannel();
