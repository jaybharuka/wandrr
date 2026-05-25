const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable not set');
  console.error('Usage: DATABASE_URL="postgresql://..." node init-db.js');
  process.exit(1);
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Connected');

    console.log('Running setup-postgres.sql...');
    const setupSql = fs.readFileSync(path.join(__dirname, 'backend/config/setup-postgres.sql'), 'utf8');
    await client.query(setupSql);
    console.log('✓ Setup complete');

    console.log('Running hotels_seed-postgres.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'backend/config/hotels_seed-postgres.sql'), 'utf8');
    await client.query(seedSql);
    console.log('✓ Hotels seeded');

    console.log('\n✅ Database initialized successfully!');
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
