const fs = require('fs').promises;
const path = require('path');
const db = require('../src/database/connection');

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../src/database/migrations/001_initial_schema.sql');
    const sql = await fs.readFile(migrationPath, 'utf-8');
    
    // Run the migration
    await db.query(sql);
    
    console.log('✅ Database migrations completed successfully!');
    
    // Close the database connection
    await db.pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

runMigrations();