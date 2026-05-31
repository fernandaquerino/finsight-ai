import { readFileSync } from "node:fs";

const envSource = readFileSync("src/lib/env.ts", "utf8");
const envExample = readFileSync(".env.example", "utf8");

const requiredEnvVars = [...envSource.matchAll(/"([A-Z0-9_]+)"/g)].map(
  (match) => match[1],
);

const exampleKeys = new Set(
  envExample
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=")[0]),
);

const missingFromExample = requiredEnvVars.filter(
  (name) => !exampleKeys.has(name),
);
const missingFromProcess = process.env.CI
  ? requiredEnvVars.filter((name) => !process.env[name])
  : [];

if (missingFromExample.length > 0 || missingFromProcess.length > 0) {
  if (missingFromExample.length > 0) {
    console.error(
      `Missing required env vars in .env.example: ${missingFromExample.join(", ")}`,
    );
  }

  if (missingFromProcess.length > 0) {
    console.error(
      `Missing required env vars in CI environment: ${missingFromProcess.join(", ")}`,
    );
  }

  process.exit(1);
}

console.warn(`Verified required env vars: ${requiredEnvVars.join(", ")}`);
