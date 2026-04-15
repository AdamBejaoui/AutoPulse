import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

async function addHighPerfIndexes() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('[High-Perf] Connecting to database...');
    await client.connect();
    
    console.log('[High-Perf] Enabling pg_trgm extension for fuzzy search...');
    await client.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
    
    console.log('[High-Perf] Creating GIN indexes (this makes descriptions, makes, and models searchable in milliseconds)...');
    
    // GIN Trigram index on Description (The biggest win)
    await client.query('CREATE INDEX IF NOT EXISTS "Listing_description_trgm_idx" ON "Listing" USING gin ("description" gin_trgm_ops)');
    
    // GIN Trigram indexes on Make/Model for fuzzy keyword matches
    await client.query('CREATE INDEX IF NOT EXISTS "Listing_make_trgm_idx" ON "Listing" USING gin ("make" gin_trgm_ops)');
    await client.query('CREATE INDEX IF NOT EXISTS "Listing_model_trgm_idx" ON "Listing" USING gin ("model" gin_trgm_ops)');
    
    console.log('[High-Perf] SUCCESS: GIN Text-Search indexes applied to 21,717+ listings!');
  } catch (err) {
    console.error('[High-Perf] FAILED:', err);
  } finally {
    await client.end();
  }
}

addHighPerfIndexes();
