const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 5000
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Connection error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
  console.log('✅ Connected successfully');
  
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      console.error('Query error:', err);
      process.exit(1);
    }
    console.log('✅ Query successful. Current time:', result.rows[0]);
    pool.end();
    process.exit(0);
  });
});
