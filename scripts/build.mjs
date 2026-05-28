import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { projectRoot } from "./project-root.mjs";

const root = projectRoot;
const prismaClient = join(root, "node_modules", ".prisma", "client", "index.js");

function runPrismaGenerate() {
  try {
    execSync("npx prisma generate", {
      cwd: root,
      stdio: "pipe",
      env: process.env,
    });
  } catch (err) {
    const stderr =
      err && typeof err === "object" && "stderr" in err
        ? String(err.stderr ?? "")
        : "";
    const message = err instanceof Error ? err.message : String(err);
    const detail = `${message}\n${stderr}`;

    if (existsSync(prismaClient)) {
      console.warn(
        "[build] prisma generate failed — using existing client.",
        detail.includes("EPERM") ? "(engine file locked — stop dev server locally)" : ""
      );
      return;
    }

    console.error(stderr || message);
    throw err;
  }
}

runPrismaGenerate();
execSync("npx next build", { cwd: root, stdio: "inherit", env: process.env });
