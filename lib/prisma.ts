import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "@/lib/env";
import { isBuildPhase } from "@/lib/build";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: { url: getDatabaseUrl() },
    },
  });
}

/**
 * Lazy Prisma singleton.
 * During Next.js static build we return a client instance without connecting;
 * first real query happens at request time on Vercel/local runtime.
 */
function getPrismaClient(): PrismaClient {
  if (global.prisma) return global.prisma;

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    global.prisma = client;
  }
  return client;
}

// During build, export a lightweight client (no eager $connect).
const prisma = isBuildPhase() ? createPrismaClient() : getPrismaClient();

export default prisma;
