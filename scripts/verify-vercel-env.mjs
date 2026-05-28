/**
 * Pre-deploy environment check for Vercel.
 * Run locally with production-like env: npm run verify:vercel
 */
import "./load-env.mjs";

const REQUIRED = [
  "DATABASE_URL",
  "DIRECT_URL",
  "JWT_SECRET",
  "NEXTAUTH_SECRET",
];

const RECOMMENDED = [
  "NEXT_PUBLIC_APP_URL",
  "NEXTAUTH_URL",
  "OPENAI_API_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const OPTIONAL = ["MONGODB_URI", "NEXT_PUBLIC_POSTHOG_KEY", "SENTRY_DSN"];

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

if (process.env.DATABASE_URL?.includes(":6543")) {
  console.log("\n  OK       DATABASE_URL uses pooler port (6543)");
} else if (isSet("DATABASE_URL")) {
  console.log("\n  WARN     DATABASE_URL should use Supabase pooler (:6543) on Vercel");
}

console.log("");
if (failed) {
  console.error("Fix missing required variables before deploying.");
  process.exit(1);
}

console.log("Ready for Vercel deploy (required vars present).");
