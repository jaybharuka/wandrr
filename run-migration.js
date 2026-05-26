import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgre:pOz6G8zxn6xPeAHOq6KX0OyiBW3Lei53@dpg-d8a3eaa8qa3s73egirfg-a.oregon-postgres.render.com/wandrr';

async function runMigration() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('📖 Reading migration file...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'backend/config/migration-otp-to-pin.sql'),
      'utf8'
    );

    console.log('⚙️  Running migration...');
    await client.query(migrationSQL);
    console.log('✅ Migration completed successfully!');

    console.log('\n📋 Schema updated:');
    console.log('  ✓ Added username column (UNIQUE)');
    console.log('  ✓ Added pin column');
    console.log('  ✓ Dropped OTP columns');
    console.log('  ✓ Created username index');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
