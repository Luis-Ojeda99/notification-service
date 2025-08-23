const db = require('../src/database/connection');

async function testTables() {
  try {
    console.log('Testing database tables...\n');
    
    // Test inserting a template
    const template = await db.query(`
      INSERT INTO templates (name, description, subject, content, channel)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      'welcome-email',
      'Welcome email for new users',
      'Welcome to {{company}}!',
      'Hi {{name}}, welcome to our service!',
      'email'
    ]);
    
    console.log('✅ Created template:', template.rows[0].id);
    
    // Test inserting a notification
    const notification = await db.query(`
      INSERT INTO notifications (template_id, recipient, channel, status, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      template.rows[0].id,
      'test@example.com',
      'email',
      'pending',
      JSON.stringify({ name: 'John', company: 'TestCorp' })
    ]);
    
    console.log('✅ Created notification:', notification.rows[0].id);
    
    // Test the queue
    const queueItem = await db.query(`
      INSERT INTO notification_queue (notification_id, status, priority)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [
      notification.rows[0].id,
      'pending',
      1
    ]);
    
    console.log('✅ Added to queue:', queueItem.rows[0].id);
    
    // Count everything
    const counts = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM templates) as templates,
        (SELECT COUNT(*) FROM notifications) as notifications,
        (SELECT COUNT(*) FROM notification_queue) as queue_items
    `);
    
    console.log('\n📊 Database contents:');
    console.log(`  Templates: ${counts.rows[0].templates}`);
    console.log(`  Notifications: ${counts.rows[0].notifications}`);
    console.log(`  Queue items: ${counts.rows[0].queue_items}`);
    
    await db.pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await db.pool.end();
    process.exit(1);
  }
}

testTables();