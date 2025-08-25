const db = require('../src/database/connection');

async function check() {
  const result = await db.query('SELECT * FROM notifications');
  console.log('Notifications:', result.rows);
  process.exit(0);
}
check();