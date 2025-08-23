const path = require('path');
const fs = require('fs').promises;
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
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();