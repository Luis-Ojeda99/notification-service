const db = require('../src/database/connection');

async function checkTables() {
  try {
    // Check if tables exist
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📊 Tables in your database:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Count templates
    const templates = await db.query('SELECT COUNT(*) FROM templates');
    console.log(`\n📝 Templates: ${templates.rows[0].count}`);
    
    // Count notifications  
    const notifications = await db.query('SELECT COUNT(*) FROM notifications');
    console.log(`📬 Notifications: ${notifications.rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTables();