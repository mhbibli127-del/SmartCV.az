import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "@/lib/env";
import { isBuildPhase } from "@/lib/build";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: { url: getDatabaseUrl() },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

/**
 * Singleton Prisma client — cached on globalThis in dev AND production.
 * Prevents hot-reload duplication locally and reuse within warm serverless instances.
 */
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

const prisma = isBuildPhase() ? createPrismaClient() : getPrismaClient();

export default prisma;
