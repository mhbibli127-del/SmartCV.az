/**
 * One-time Supabase + Prisma setup (generate, validate, push schema, test pooler).
 * Usage: npm run db:setup
 */
import { spawnSync } from "node:child_process";
import "./load-env.mjs";

const steps = [
  ["npx", ["prisma", "generate", "--no-engine"]],
  ["npx", ["prisma", "validate"]],
  ["npx", ["prisma", "db", "push", "--accept-data-loss"]],
  ["node", ["scripts/db-check.mjs"]],
];

let failed = false;

console.log("SmartCV.AZ — database setup\n");

for (const [cmd, args] of steps) {
  const label = [cmd, ...args].join(" ");
  console.log(`→ ${label}`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (result.status !== 0) {
    failed = true;
    break;
  }
  console.log("");
}

if (failed) {
  console.error("Setup failed. Fix DATABASE_URL / DIRECT_URL in .env.local and retry.");
  process.exit(1);
}

console.log("Database setup complete.");
