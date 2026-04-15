
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres.ilfserdwvsxpngwttmjo:autocars1243@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Testing raw pg connection to pooler port 6543...');
    const result = await pool.query('SELECT COUNT(*) FROM "Listing"');
    console.log('SUCCESS! Row count:', result.rows[0].count);
  } catch (e) {
    console.error('Pooler 6543 FAILED:', e.message);
  }

  try {
    console.log('\nTesting raw pg connection to direct port 5432...');
    const pool2 = new Pool({
      connectionString: 'postgresql://postgres.ilfserdwvsxpngwttmjo:autocars1243@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
      ssl: { rejectUnauthorized: false },
    });
    const result2 = await pool2.query('SELECT COUNT(*) FROM "Listing"');
    console.log('SUCCESS! Row count:', result2.rows[0].count);
    await pool2.end();
  } catch (e) {
    console.error('Direct 5432 FAILED:', e.message);
  }

  await pool.end();
}

main();
