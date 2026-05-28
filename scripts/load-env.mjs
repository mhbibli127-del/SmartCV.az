import path from "path";
import fs from "fs";
import nextEnv from "@next/env";
import { projectRoot } from "./project-root.mjs";

const { loadEnvConfig } = nextEnv;

const envLocalFile = path.join(projectRoot, ".env.local");

// .env.local may set NODE_ENV=production; dev scripts must load development env first.
if (process.env.npm_lifecycle_event === "dev") {
  process.env.NODE_ENV = "development";
}

const dev = process.env.NODE_ENV !== "production";

// Local dev must trust the incoming host (localhost) instead of production NEXTAUTH_URL.
if (dev) {
  process.env.AUTH_TRUST_HOST = "true";
}

if (dev && (!fs.existsSync(envLocalFile) || fs.statSync(envLocalFile).size === 0)) {
  // eslint-disable-next-line no-console
  console.warn(
    `[env] Project .env.local is missing or empty at ${envLocalFile}. ` +
      "Save your environment variables to that file so Next.js and Prisma can load them."
  );
}

// Load env from the project root. Production platforms inject vars directly.
loadEnvConfig(projectRoot, dev);

export { projectRoot };
