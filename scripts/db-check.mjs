/**
 * Test Supabase PostgreSQL via Prisma pooler URL.
 * Usage: npm run db:check
 */
import "./load-env.mjs";
import { spawnSync } from "node:child_process";

console.log("SmartCV.AZ — database connectivity check\n");

const validate = spawnSync("npx", ["prisma", "validate"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

if (validate.status !== 0) {
  process.exit(validate.status ?? 1);
}

let failed = false;

try {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const start = Date.now();
  await prisma.$queryRaw`SELECT 1 AS ok`;
  console.log(`\nPooler query OK (${Date.now() - start}ms)`);
  await prisma.$disconnect();
} catch (err) {
  failed = true;
  console.error("\nPooler connection FAILED:");
  console.error(err instanceof Error ? err.message : err);
  console.error(
    "\nFix DATABASE_URL / DIRECT_URL in .env.local, then run: npm run db:generate"
  );
}

process.exit(failed ? 1 : 0);
