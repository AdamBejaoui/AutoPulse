import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

async function addIndexes() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('[Direct-Index] Connecting to database...');
    await client.connect();
    
    console.log('[Direct-Index] Applying sorting and filtering indexes...');
    
    // 1. PostedAt for fast Home/Search reloads
    await client.query('CREATE INDEX IF NOT EXISTS "Listing_postedAt_idx" ON "Listing"("postedAt" DESC)');
    
    // 2. Make/Model/Price for fast filtering
    await client.query('CREATE INDEX IF NOT EXISTS "Listing_make_idx" ON "Listing"("make")');
    await client.query('CREATE INDEX IF NOT EXISTS "Listing_model_idx" ON "Listing"("model")');
    await client.query('CREATE INDEX IF NOT EXISTS "Listing_price_idx" ON "Listing"("price")');
    
    console.log('[Direct-Index] SUCCESS: Database performance indexes applied for 21,717+ listings!');
  } catch (err) {
    console.error('[Direct-Index] FAILED:', err);
  } finally {
    await client.end();
  }
}

addIndexes();
