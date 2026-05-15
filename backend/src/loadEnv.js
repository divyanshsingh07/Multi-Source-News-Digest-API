import path from "path";
import { fileURLToPath } from "url";
import { existsSync, readFileSync } from "fs";
import dotenv from "dotenv";

const srcDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(srcDir, "..");
const backendEnvPath = path.join(backendRoot, ".env");
const backendEnvLocalPath = path.join(backendRoot, ".env.local");

function applyEnvFromFile(filePath) {
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let val = trimmed.slice(eq + 1).trim();
    if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
      val = val.slice(1, -1).replace(/\\"/g, '"');
    } else if (val.startsWith("'") && val.endsWith("'") && val.length >= 2) {
      val = val.slice(1, -1);
    } else {
      const idx = val.search(/\s+#/);
      if (idx >= 0) val = val.slice(0, idx).trim();
    }
    process.env[key] = val;
  }
}

if (existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath, override: true });
  applyEnvFromFile(backendEnvPath);
} else {
  dotenv.config({ override: true });
}

if (existsSync(backendEnvLocalPath)) {
  dotenv.config({ path: backendEnvLocalPath, override: true });
  applyEnvFromFile(backendEnvLocalPath);
}
