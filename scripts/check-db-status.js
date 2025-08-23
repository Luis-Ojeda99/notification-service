const db = require('../src/database/connection');

async function checkStatus() {
  try {
    console.log('Checking database status...\n');
    
    // Check for existing types
    const types = await db.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typname IN ('notification_status', 'notification_channel', 'priority_level')
    `);
    
    console.log('📦 Existing types:');
    types.rows.forEach(row => console.log(`  - ${row.typname}`));
    
    // Check for existing tables
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('templates', 'notifications', 'notification_queue')
    `);
    
    console.log('\n📊 Existing tables:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    await db.pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkStatus();