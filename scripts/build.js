/*
 * Build script — bundles content scripts with esbuild, then creates
 * store-ready zip files for Chrome, Edge, and Firefox.
 *
 * Output: dist/content-bundle.js
 *         dist/leanix-extension-chrome.zip
 *         dist/leanix-extension-edge.zip
 *         dist/leanix-extension-firefox.zip
 *
 * The Firefox build adds browser_specific_settings to the manifest.
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const esbuild = require("esbuild");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const PACKAGE = require(path.join(ROOT, "package.json"));
const VERSION = PACKAGE.version;

/* Content scripts bundled in this order. */
const CONTENT_ORDER = [
  "src/shared/storage.js",
  "src/shared/dom-utils.js",
  "src/shared/modal.js",
  "src/content/features/data-export.js",
  "src/content/features/print-export.js",
  "src/content/features/documents-export.js",
  "src/content/features/diagram-details.js",
  "src/content/features/update-notification.js",
  "src/content/features/emoji-data.js",
  "src/content/features/emoji-picker.js",
  "src/content/index.js",
];

var BUNDLED_FILES = new Set(CONTENT_ORDER);

/* Directories and files to include in each extension zip. */
const INCLUDE = [
  "manifest.json",
  "icons",
  "src",
];

/* System junk and bundled source to exclude from zips. */
const EXCLUDE = [".DS_Store", "Thumbs.db", ".zip"];

/* ------------------------------------------------------------------ */

function shouldInclude(filePath) {
  const rel = path.relative(ROOT, filePath);
  if (BUNDLED_FILES.has(rel)) return false;
  for (const name of EXCLUDE) {
    if (rel.includes(name)) return false;
  }
  return true;
}

function copyTree(zipDir, sourceDir) {
  if (!fs.existsSync(zipDir)) fs.mkdirSync(zipDir, { recursive: true });

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(zipDir, path.relative(ROOT, srcPath));

    if (!shouldInclude(srcPath)) continue;

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyTree(zipDir, srcPath);
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, fs.readFileSync(srcPath));
    }
  }
}

function prepareStaging(label) {
  const stage = path.join(require("os").tmpdir(), `leanix-extension-${label}`);
  if (fs.existsSync(stage)) fs.rmSync(stage, { recursive: true });
  fs.mkdirSync(stage, { recursive: true });

  for (const inc of INCLUDE) {
    const src = path.join(ROOT, inc);
    if (!fs.existsSync(src)) {
      console.warn(`  Skipping missing: ${inc}`);
      continue;
    }
    if (fs.statSync(src).isDirectory()) {
      copyTree(stage, src);
    } else {
      fs.mkdirSync(stage, { recursive: true });
      fs.writeFileSync(path.join(stage, inc), fs.readFileSync(src));
    }
  }

  return stage;
}

/* Minimal ZIP writer — no external `zip` CLI, works on every platform. */

const CRC_TABLE = (function () {
  var table = new Uint32Array(256);
  for (var byteValue = 0; byteValue < 256; byteValue++) {
    var crc = byteValue;
    for (var bit = 0; bit < 8; bit++) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    table[byteValue] = crc >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  var crc = 0xffffffff;
  for (var i = 0; i < buffer.length; i++) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function collectFiles(rootDir, relativeDir, collected) {
  var entries = fs.readdirSync(path.join(rootDir, relativeDir), { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    if (entry.name === ".DS_Store" || entry.name === "Thumbs.db") continue;

    var relativePath = relativeDir ? relativeDir + "/" + entry.name : entry.name;
    if (entry.isDirectory()) {
      collectFiles(rootDir, relativePath, collected);
    } else {
      collected.push({
        name: relativePath,
        data: fs.readFileSync(path.join(rootDir, relativePath)),
      });
    }
  }
}

function writeZip(zipPath, sourceDir) {
  var files = [];
  collectFiles(sourceDir, "", files);

  var localParts = [];
  var centralParts = [];
  var offset = 0;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var nameBuffer = Buffer.from(file.name, "utf8");
    var crc = crc32(file.data);
    var compressed = zlib.deflateRawSync(file.data);

    var localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(file.data.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, nameBuffer, compressed);

    var centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(file.data.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, nameBuffer);

    offset += localHeader.length + nameBuffer.length + compressed.length;
  }

  var localData = Buffer.concat(localParts);
  var centralDirectory = Buffer.concat(centralParts);

  var endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(files.length, 8);
  endRecord.writeUInt16LE(files.length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(localData.length, 16);
  endRecord.writeUInt16LE(0, 20);

  fs.writeFileSync(zipPath, Buffer.concat([localData, centralDirectory, endRecord]));
}

function createZip(stageDir, zipName) {
  const zipPath = path.join(DIST, zipName);
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

  writeZip(zipPath, stageDir);

  const sizeKB = (fs.statSync(zipPath).size / 1024).toFixed(0);
  console.log(`  ${zipName}  (${sizeKB} KB)`);

  fs.rmSync(stageDir, { recursive: true });
}

/* ------------------------------------------------------------------ */

console.log(`\nBuilding LeanIX Extension v${VERSION}\n`);

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST);

/* ---- Bundle content scripts ------------------------------------- */

console.log("Bundle:");
const BUNDLE_PATH = path.join(ROOT, "src/content/content-bundle.js");

var combined = CONTENT_ORDER.map(function (f) {
  return fs.readFileSync(path.join(ROOT, f), "utf8");
}).join("\n");

try {
  var result = esbuild.transformSync(combined, {
    loader: "js",
    format: "iife",
    target: "es2015",
  });
  fs.writeFileSync(BUNDLE_PATH, result.code, "utf8");
  const bundleKB = (fs.statSync(BUNDLE_PATH).size / 1024).toFixed(0);
  console.log(`  src/content/content-bundle.js  (${bundleKB} KB)`);
} catch (err) {
  console.error("  Bundle failed:", err.message);
  process.exit(1);
}

/* ---- Chrome ----------------------------------------------------- */

console.log("Chrome:");
const chromeStage = prepareStaging("chrome");
createZip(chromeStage, "leanix-extension-chrome.zip");

/* ---- Edge (identical to Chrome) --------------------------------- */

console.log("Edge:");
const edgeStage = prepareStaging("edge");
createZip(edgeStage, "leanix-extension-edge.zip");

/* ---- Firefox ---------------------------------------------------- */

console.log("Firefox:");
const ffStage = prepareStaging("firefox");

const manifestPath = path.join(ffStage, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

manifest.browser_specific_settings = {
  gecko: {
    id: "leanix-extension@example.com",
    strict_min_version: "128.0",
  },
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("  Added browser_specific_settings.gecko");

createZip(ffStage, "leanix-extension-firefox.zip");

/* ---- Done ------------------------------------------------------- */

console.log("\nBuild complete — dist/ contains:");
const files = fs.readdirSync(DIST).filter(function (f) {
  return f.endsWith(".zip");
});
for (var i = 0; i < files.length; i++) {
  console.log(`  ${files[i]}`);
}
console.log();
