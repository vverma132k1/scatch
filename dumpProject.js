const fs = require("fs");
const path = require("path");

const OUTPUT_FILE = "project_dump.txt";

// directories to ignore (exact names)
const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".cache"
]);

// specific files to ignore
const IGNORE_FILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml"
]);

// allowed text file extensions
const ALLOWED_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".html",
  ".css",
  ".scss",
  ".json",
  ".md",
  ".txt",
  ".env",
  ".ejs"
]);

function walk(dir, output) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // skip ignored directories
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      walk(fullPath, output);
      continue;
    }

    // skip ignored files
    if (IGNORE_FILES.has(entry.name)) continue;

    // skip non-text files
    const ext = path.extname(entry.name);
    if (!ALLOWED_EXTENSIONS.has(ext)) continue;

    output.push(
      `\n==============================\nFILE: ${fullPath}\n==============================\n`
    );

    try {
      const content = fs.readFileSync(fullPath, "utf8");
      output.push(content);
    } catch (err) {
      output.push("[Error reading file]");
    }
  }
}

// run script
const output = [];
walk(process.cwd(), output);
fs.writeFileSync(OUTPUT_FILE, output.join("\n"), "utf8");

console.log("✅ Clean project dump created:", OUTPUT_FILE);
