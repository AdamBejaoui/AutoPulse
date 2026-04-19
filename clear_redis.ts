import Redis from 'ioredis';
import * as dotenv from 'dotenv';
dotenv.config();

async function flush() {
    console.log("Connecting to Redis...");
    const client = new Redis(process.env.REDIS_URL!);
    
    client.on('error', (err) => console.log('Redis Client Error', err));
    
    console.log("Connected! Flushing all memory...");
    await client.flushall();
    
    console.log("Redis memory completely cleared.");
    client.quit();
}

flush().catch(console.error).finally(() => process.exit(0));
