
const { Client } = require('pg');

// Trying DIRECT_URL first as it's often more reliable for simple checks
const connectionString = 'postgresql://postgres.ilfserdwvsxpngwttmjo:autocars1243@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

console.log('Attempting to connect to:', connectionString.split('@')[1]);

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000 // 5 second timeout
});

async function check() {
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Querying...');
    const res = await client.query('SELECT NOW()');
    console.log('SUCCESS: Connected to database at', res.rows[0].now);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('FAILURE: Could not connect to database:', err.message);
    process.exit(1);
  }
}

check();
