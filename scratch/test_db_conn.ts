import { Client } from "pg";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function test() {
  const clientUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  console.log("Testing URL:", clientUrl);
  const client = new Client({
    connectionString: clientUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });
  try {
    await client.connect();
    console.log("Connect successful");
    await client.end();
  } catch(e) {
    console.error("Connect failed", e);
  }
}
test();
