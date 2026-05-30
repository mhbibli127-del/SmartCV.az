/**
 * Pre-deploy environment check for Vercel.
 * Run locally with production-like env: npm run verify:vercel
 */
import "./load-env.mjs";

function postgresHasPassword(url) {
  try {
    return Boolean(new URL(url).password);
  } catch {
    return false;
  }
}

function validateDbUrls() {
  const db = process.env.DATABASE_URL?.trim();
  const direct = process.env.DIRECT_URL?.trim();
  const errors = [];
  if (!db) errors.push("DATABASE_URL missing");
  else if (!postgresHasPassword(db)) errors.push("DATABASE_URL missing password");
  else if (!db.includes(":6543") && !db.includes("pgbouncer=true")) {
    errors.push("DATABASE_URL should use pooler :6543 + ?pgbouncer=true");
  }
  if (!direct) errors.push("DIRECT_URL missing");
  else if (!postgresHasPassword(direct)) errors.push("DIRECT_URL missing password");
  else if (direct.includes("pooler.supabase.com")) {
    errors.push("DIRECT_URL must use db.*.supabase.co:5432 (not pooler)");
  }
  return errors;
}

const REQUIRED = [
  "DATABASE_URL",
  "DIRECT_URL",
  "JWT_SECRET",
  "NEXTAUTH_SECRET",
];

const RECOMMENDED = [
  "NEXT_PUBLIC_APP_URL",
  "NEXTAUTH_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const OPTIONAL = [
  "MONGODB_URI",
  "SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_DSN",
];

const SENTRY_BUILD = ["SENTRY_AUTH_TOKEN"];

function isSet(name) {
  const value = process.env[name]?.trim();
  return Boolean(value && !value.includes("[YOUR-PASSWORD]"));
}

let failed = false;

console.log("SmartCV.AZ — Vercel pre-deploy check\n");

console.log("Required:");
for (const name of REQUIRED) {
  if (isSet(name)) {
    console.log(`  OK       ${name}`);
  } else {
    console.log(`  MISSING  ${name}`);
    failed = true;
  }
}

console.log("\nRecommended:");
for (const name of RECOMMENDED) {
  console.log(`  ${isSet(name) ? "OK      " : "MISSING "}${name}`);
}

if (!isSet("CLOUDINARY_CLOUD_NAME")) {
  console.log(
    "\n  NOTE: Without Cloudinary, PDF/thumbnail URLs will not persist on Vercel serverless."
  );
}

console.log("\nOptional:");
for (const name of OPTIONAL) {
  console.log(`  ${isSet(name) ? "OK      " : "skip    "}${name}`);
}

console.log("\nSentry source maps (production builds):");
for (const name of SENTRY_BUILD) {
  console.log(`  ${isSet(name) ? "OK      " : "skip    "}${name}`);
}
if (isSet("SENTRY_DSN") && !isSet("SENTRY_AUTH_TOKEN")) {
  console.log(
    "  NOTE: Without SENTRY_AUTH_TOKEN, builds skip source map upload (no errors; minified stacks)."
  );
}

const dbErrors = validateDbUrls();
if (dbErrors.length) {
  console.log("\nDatabase URL issues:");
  for (const e of dbErrors) {
    console.log(`  FAIL     ${e}`);
    failed = true;
  }
} else if (isSet("DATABASE_URL")) {
  console.log("\n  OK       DATABASE_URL + DIRECT_URL structure");
}

console.log("");
if (failed) {
  console.error("Fix missing required variables before deploying.");
  process.exit(1);
}

console.log("Ready for Vercel deploy (required vars present).");
