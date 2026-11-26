#!/usr/bin/env node
/*
 * منبع یکتای انتشار: ریشهٔ مخزن.
 * پوشهٔ files/ فقط یک کپی ساخته‌شده است که install.sh آن را روی مخزن می‌ریزد.
 *
 *   node scripts/sync-files.js          # ساخت/به‌روزرسانی files/ از ریشه
 *   node scripts/sync-files.js --check  # فقط بررسی؛ اگر قدیمی باشد با کد ۱ خارج می‌شود
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const FILES = path.join(ROOT, "files");

/* تنها مسیرهایی که در بستهٔ انتشار لازم‌اند. هر چیز دیگری در files/ حذف می‌شود
   تا نسخهٔ قدیمی هیچ‌وقت با بسته منتشر نشود. */
const INCLUDE = [
  "index.html",
  "sw.js",
  "manifest.webmanifest",
  "README.md",
  "icon.svg",
  "icon-192.svg",
  "icon-512.svg",
  "css",
  "fonts",
  "icons",
  "js",
  "screenshots",
  "tests",
  ".github/workflows/validate.yml",
  ".github/workflows/lint.yml",
  ".github/workflows/playwright.yml"
];

const check = process.argv.includes("--check");

function fail(message) {
  console.error("✗ " + message);
  process.exit(1);
}

function walk(relDir, out) {
  const abs = path.join(ROOT, relDir);
  for (const entry of fs.readdirSync(abs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === ".DS_Store" || entry.name === "Thumbs.db") continue;
    const rel = path.posix.join(relDir, entry.name);
    if (entry.isDirectory()) walk(rel, out);
    else if (entry.isFile()) out.push(rel);
    else fail("unsupported entry in publish set: " + rel);
  }
}

/* فهرست فایل‌های مورد انتظار در files/، بر مبنای ریشه. */
function expectedFiles() {
  const out = [];
  for (const rel of INCLUDE) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) fail("publish set entry is missing at repository root: " + rel);
    if (fs.statSync(abs).isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out.sort();
}

/* فهرست فایل‌های موجود در files/ (اگر نباشد، خالی). */
function actualFiles() {
  if (!fs.existsSync(FILES)) return [];
  const out = [];
  (function walkFiles(dir, prefix) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const rel = prefix ? path.posix.join(prefix, entry.name) : entry.name;
      if (entry.isDirectory()) walkFiles(path.join(dir, entry.name), rel);
      else if (entry.isFile()) out.push(rel);
    }
  })(FILES, "");
  return out.sort();
}

const expected = expectedFiles();

if (check) {
  const actual = actualFiles();
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const missing = expected.filter((rel) => !actualSet.has(rel));
  const extra = actual.filter((rel) => !expectedSet.has(rel));
  const changed = expected.filter(
    (rel) => actualSet.has(rel) && !fs.readFileSync(path.join(ROOT, rel)).equals(fs.readFileSync(path.join(FILES, rel)))
  );
  if (missing.length || extra.length || changed.length) {
    const lines = [];
    if (missing.length) lines.push("missing in files/: " + missing.join(", "));
    if (changed.length) lines.push("out of date in files/: " + changed.join(", "));
    if (extra.length) lines.push("not part of the publish set (stale): " + extra.join(", "));
    console.error("✗ files/ is not in sync with the repository root.");
    for (const line of lines) console.error("  - " + line);
    console.error("  Run `node scripts/sync-files.js` and commit the result.");
    process.exit(1);
  }
  console.log("✓ files/ matches the repository root (" + expected.length + " files).");
  process.exit(0);
}

fs.rmSync(FILES, { recursive: true, force: true });
for (const rel of expected) {
  const src = path.join(ROOT, rel);
  const dest = path.join(FILES, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  fs.chmodSync(dest, fs.statSync(src).mode & 0o777);
}
console.log("✓ files/ rebuilt from the repository root (" + expected.length + " files).");
