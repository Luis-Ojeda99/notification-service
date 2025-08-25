class SMSChannel {
  async send(notification) {
    try {
      console.log(`📱 Sending SMS to ${notification.recipient}`);
      console.log(`   Content: ${notification.content}`);

      // Mock SMS sending
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Fail 15% of the time for testing
      if (Math.random() < 0.15) {
        throw new Error("Invalid phone number format");
      }

      return {
        success: true,
        provider: "mock-sms",
        messageId: `sms_${Date.now()}`,
        timestamp: new Date(),
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SMSChannel();