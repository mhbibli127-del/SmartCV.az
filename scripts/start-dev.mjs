import path from "path";
import { spawn } from "child_process";
import { projectRoot } from "./load-env.mjs";

const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");

const devEnv = {
  ...process.env,
  NODE_ENV: "development",
  AUTH_TRUST_HOST: "true",
};

const child = spawn(process.execPath, [nextBin, "dev"], {
  stdio: ["inherit", "pipe", "pipe"],
  cwd: projectRoot,
  env: devEnv,
});
let opened = false;

function openBrowser(url) {
  if (opened) return;
  opened = true;

  if (process.platform === "win32") {
    // Use the system default browser instead of forcing Chrome
    spawn("cmd", ["/c", "start", "", url], {
      detached: true,
      stdio: "ignore",
    }).unref();
  } else {
    // Using the 'open' command on macOS/Linux
    spawn("open", [url], {
      detached: true,
      stdio: "ignore",
    }).unref();
  }
}

child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);

  // Improved regex to handle ANSI colors and loopback IP addresses
  const match = text.match(/Local:\s*.*(https?:\/\/(?:localhost|127\.0\.0\.1):\d+)/);
  if (match) {
    openBrowser(match[1]);
  }
});

child.stderr.on("data", (chunk) => {
  process.stderr.write(chunk.toString());
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});