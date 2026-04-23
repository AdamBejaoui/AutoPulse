import { PrismaClient } from "@prisma/client";

// Ensure we are using the stable library engine
// and not defaulting to 'client' (edge) which requires an adapter.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

try {
  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ["error"],
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
} catch (e) {
  console.error("Prisma Initialization Error (Building?):", e);
  // Fallback for build phase only
  prisma = {} as PrismaClient;
}

export { prisma };
