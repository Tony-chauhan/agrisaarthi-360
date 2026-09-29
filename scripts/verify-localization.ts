/**
 * LOCALIZATION VERIFIER
 *
 * Two checks:
 *  A. Dictionary parity — every key path that exists in `en` must exist in
 *     `hi` (and vice versa) with the same shape (string / function / array).
 *  B. Hardcoded copy scan — flags multi-word English-looking JSX text nodes
 *     in app/ and components/ that bypass the dictionary. Best effort by
 *     design (line-based scan of `>text<` spans); known-acceptable literals
 *     live in the ALLOWLIST below with a reason.
 *
 * Run: npx tsx scripts/verify-localization.ts
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { en } from "../lib/i18n/en";
import { hi } from "../lib/i18n/hi";

let failures = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS  ${message}`);
  } else {
    failures++;
    console.error(`  FAIL  ${message}`);
  }
}

/* ---------------------------- A. Parity ------------------------------ */

function collectPaths(
  value: unknown,
  prefix: string,
  out: Map<string, string>
): void {
  if (Array.isArray(value)) {
    out.set(prefix, "array");
    value.forEach((item, i) => collectPaths(item, `${prefix}[${i}]`, out));
    return;
  }
  if (typeof value === "function") {
    out.set(prefix, "function");
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      collectPaths(child, prefix ? `${prefix}.${key}` : key, out);
    }
    return;
  }
  out.set(prefix, typeof value);
}

const enPaths = new Map<string, string>();
const hiPaths = new Map<string, string>();
collectPaths(en, "", enPaths);
collectPaths(hi, "", hiPaths);

const enOnly: string[] = [];
for (const [path, shape] of enPaths) {
  if (path === "") continue;
  if (!hiPaths.has(path)) {
    enOnly.push(path);
  } else if (hiPaths.get(path) !== shape) {
    failures++;
    console.error(
      `  FAIL  shape mismatch at "${path}": en=${shape} hi=${hiPaths.get(path)}`
    );
  }
}
const hiOnly: string[] = [];
for (const path of hiPaths.keys()) {
  if (path === "") continue;
  if (!enPaths.has(path)) hiOnly.push(path);
}

assert(enOnly.length === 0, `A1 every en key exists in hi (${enOnly.length} missing)`);
if (enOnly.length > 0) {
  for (const path of enOnly.slice(0, 20)) console.error(`        missing in hi: ${path}`);
}
assert(hiOnly.length === 0, `A2 every hi key exists in en (${hiOnly.length} missing)`);
if (hiOnly.length > 0) {
  for (const path of hiOnly.slice(0, 20)) console.error(`        missing in en: ${path}`);
}

/* ----------------------- B. Hardcoded copy scan ----------------------- */

const SCAN_ROOTS = ["app", "components"];
const ALLOWLIST: { match: string; reason: string }[] = [
  { match: "AI Model", reason: "canonical source label (also in dictionaries)" },
  { match: "Decision Engine", reason: "canonical source label (also in dictionaries)" },
  { match: "Saarthi AI", reason: "brand name — identical in both languages" },
];

function listTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      out.push(...listTsFiles(full));
    } else if (entry.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

// Multi-word English-looking text nodes: `> Some Words <` spans.
const TEXT_NODE = />[^<>{}]*?([A-Z][a-z]+(?:\s+[A-Za-z][a-zA-Z'’,.\-]+)+)[^<>{}]*?</;

const flagged: string[] = [];
for (const root of SCAN_ROOTS) {
  for (const file of listTsFiles(root)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (
        trimmed.startsWith("*") ||
        trimmed.startsWith("/*") ||
        trimmed.startsWith("//")
      ) {
        return; // comments are documentation, not copy
      }
      const match = TEXT_NODE.exec(line);
      if (!match) return;
      const text = match[1];
      if (ALLOWLIST.some((a) => text.includes(a.match))) return;
      flagged.push(`${relative(".", file)}:${i + 1} "${text}"`);
    });
  }
}

assert(
  flagged.length === 0,
  `B1 no hardcoded multi-word JSX copy outside the dictionary (${flagged.length} flagged)`
);
for (const item of flagged.slice(0, 30)) {
  console.error(`        hardcoded copy: ${item}`);
}

/* ------------------------------ Verdict ------------------------------- */

if (failures === 0) {
  console.log("\nALL LOCALIZATION CHECKS PASSED");
  process.exit(0);
} else {
  console.error(`\n${failures} LOCALIZATION CHECK(S) FAILED`);
  process.exit(1);
}
