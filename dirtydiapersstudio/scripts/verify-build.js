import fs from "fs";

function check(file) {
  const exists = fs.existsSync(file);
  console.log(`${exists ? "✔" : "✖"} ${file}`);
  return exists;
}

console.log("=== Netlify Build Verification ===");

const ok =
  check("package.json") &&
  check("package-lock.json") &&
  check("next.config.ts") &&
  check("tsconfig.json") &&
  check("src/types/osc.d.ts");

if (!ok) {
  console.error("Build verification failed.");
  process.exit(1);
}

console.log("All required files present.");
