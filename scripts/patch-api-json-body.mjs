/**
 * One-off patch: replace bare `await req.json()` with safe parseJsonBody().
 * Skips routes that already use .catch() or parseJsonBody.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = path.join(root, "app", "api");

function* walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) yield* walk(full);
    else if (name === "route.ts") yield full;
  }
}

let patched = 0;

for (const file of walk(apiDir)) {
  let content = fs.readFileSync(file, "utf8");
  if (content.includes("parseJsonBody")) continue;
  if (!/await (req|request)\.json\(\)/.test(content)) continue;
  if (/await (req|request)\.json\(\)\.catch/.test(content)) continue;

  content = content.replace(/await req\.json\(\)/g, "await parseJsonBody(req)");
  content = content.replace(/await request\.json\(\)/g, "await parseJsonBody(request)");

  if (!content.includes('from "@/lib/safe-route"')) {
    const firstImport = content.match(/^import .+;\r?\n/m);
    if (firstImport) {
      const insertAt = firstImport.index + firstImport[0].length;
      content =
        content.slice(0, insertAt) +
        'import { parseJsonBody } from "@/lib/safe-route";\n' +
        content.slice(insertAt);
    } else {
      content = 'import { parseJsonBody } from "@/lib/safe-route";\n' + content;
    }
  }

  fs.writeFileSync(file, content);
  patched++;
  console.log("patched", path.relative(root, file));
}

console.log(`Done. Patched ${patched} route(s).`);
