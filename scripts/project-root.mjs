import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Resolve the project root by walking up from `startDir` until `package.json` is found.
 * Falls back to `startDir` when no marker is found (e.g. constrained production layouts).
 */
export function findProjectRoot(startDir) {
  let dir = path.resolve(startDir);
  const fsRoot = path.parse(dir).root;

  while (true) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    if (dir === fsRoot) {
      break;
    }
    dir = path.dirname(dir);
  }

  return path.resolve(startDir);
}

/** Project root relative to this module's location (`scripts/` → repo root). */
export const projectRoot = findProjectRoot(path.dirname(fileURLToPath(import.meta.url)));
