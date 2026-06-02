import { existsSync, readFileSync } from "node:fs";

const hasDrizzleConfig =
  existsSync("drizzle.config.ts") ||
  existsSync("drizzle.config.mts") ||
  existsSync("drizzle.config.js") ||
  existsSync("drizzle.config.mjs");
const hasDrizzleDirectory =
  existsSync("db/migrations") || existsSync("drizzle");
const hasPackage = existsSync("package.json");

if (!hasPackage) {
  console.error("package.json not found.");
  process.exit(1);
}

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};
const hasDrizzleDependency =
  Boolean(dependencies["drizzle-orm"]) || Boolean(dependencies["drizzle-kit"]);

const detectedParts = [
  hasDrizzleConfig && "drizzle config",
  hasDrizzleDirectory && "drizzle migrations directory",
  hasDrizzleDependency && "drizzle dependency",
].filter(Boolean);

if (detectedParts.length === 0) {
  console.warn(
    "Drizzle is not configured yet; skipping drizzle migration check.",
  );
  process.exit(0);
}

if (!hasDrizzleConfig || !hasDrizzleDirectory || !hasDrizzleDependency) {
  console.error(
    `Incomplete Drizzle setup detected (${detectedParts.join(", ")}). ` +
      "Expected a drizzle config, migrations directory, and drizzle dependency.",
  );
  process.exit(1);
}

console.warn(
  "Drizzle setup detected. Add a project-specific migration consistency command here when schema files are introduced.",
);
