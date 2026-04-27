import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Set the WebSocket constructor for Node.js
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

let connectionString = process.env.DATABASE_URL;
if (connectionString && !connectionString.includes('connection_limit')) {
  connectionString += connectionString.includes('?') ? '&connection_limit=1' : '?connection_limit=1';
}

if (process.env.NODE_ENV === "production") {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  prismaInstance = new PrismaClient({ adapter, log: ["error", "warn"] });
} else {
  if (!globalForPrisma.prisma) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter, log: ["error", "warn"] });
  }
  prismaInstance = globalForPrisma.prisma;
}

export const prisma = prismaInstance;
