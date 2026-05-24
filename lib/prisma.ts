import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "@/lib/env";

declare global {
  // allow global prisma in dev to avoid multiple instances
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: { url: getDatabaseUrl() },
    },
  });
}

const prisma = global.prisma || createPrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
