import { Client } from "pg";

async function test(port: number) {
  const clientUrl = `postgresql://postgres.ilfserdwvsxpngwttmjo:autocars1243@aws-1-us-east-2.pooler.supabase.com:${port}/postgres`;
  console.log("Testing URL:", clientUrl);
  const client = new Client({
    connectionString: clientUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });
  try {
    await client.connect();
    console.log(`Port ${port} Connect successful`);
    await client.end();
  } catch(e) {
    console.error(`Port ${port} Connect failed`, e.message);
  }
}
async function run() {
    await test(5432);
    await test(6543);
    process.exit();
}
run();
