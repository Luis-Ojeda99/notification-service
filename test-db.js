const db = require('./src/database/connection');

async function test() {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('✅ Connected! Database time:', result.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
}

test();