class EmailChannel {
  async send(notification) {
    try {
      // Mock email sending for now
      console.log(`📧 Sending email to ${notification.recipient}`);
      console.log(`   Subject: ${notification.subject}`);
      console.log(`   Content: ${notification.content}`);

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Randomly fail 10% of the time for testing
      if (Math.random() < 0.1) {
        throw new Error("Email provider timeout");
      }

      return {
        success: true,
        provider: "mock",
        messageId: `msg_${Date.now()}`,
        timestamp: new Date(),
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new EmailChannel();