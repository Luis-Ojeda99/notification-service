const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "host.docker.internal",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "notification_service",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "your_password",
});

console.log("Attempting to connect to:", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Connection failed:", err);
  } else {
    console.log("Connection successful:", res.rows[0]);
  }
  pool.end();
});
