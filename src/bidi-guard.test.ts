import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { LRI } from "@/lib/bidi";

/**
 * Two numbers with a neutral between them, in a Hebrew line, come out
 * backwards: "2400 × 1350" displays as "1350 × 2400". Whoever reads it then
 * shoots the wrong size and nobody finds out until the photograph is wrong.
 *
 * Every such pair has to be isolated — as <Ltr> in JSX, or with a U+2066
 * isolate in a plain string.
 */

const ROOT = process.cwd();

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (/\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name)) out.push(path);
  }
  return out;
}

const files = sourceFiles("src")
  .map((f) => f.split("\\").join("/"))
  // Data files hold values, not rendered lines. What matters for those is that
  // the component rendering them isolates the value — checked separately.
  .filter((f) => !f.startsWith("src/data/"));
const HEBREW = /[\u0590-\u05FF]/;
/** 1600 × 1600, 800 x 600 — digits, a neutral, digits. */
const DIMENSION = /\d{2,}\s*[×x*]\s*\d{2,}/;

describe("mixed Hebrew and Latin", () => {
  it("never leaves a dimension pair open to reordering", () => {
    const offenders: string[] = [];
    for (const file of files) {
      readFileSync(join(ROOT, file), "utf8")
        .split(/\r?\n/)
        .forEach((line, i) => {
          if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) return;
          if (!DIMENSION.test(line)) return;
          // Safe if the line carries an isolate, wraps it in <Ltr>, or has no
          // Hebrew on it at all for the algorithm to fight with.
          const isolated = line.includes(LRI) || /<Ltr\b/.test(line);
          if (!isolated && HEBREW.test(line)) offenders.push(`${file}:${i + 1}`);
        });
    }
    expect(offenders).toEqual([]);
  });

  it("keeps a path out of the reach of the surrounding paragraph", () => {
    // A leading "/" is neutral: in a Hebrew line it hops to the far end and
    // "/admin/login" reads as "admin/login/".
    const offenders: string[] = [];
    for (const file of files) {
      readFileSync(join(ROOT, file), "utf8")
        .split(/\r?\n/)
        .forEach((line, i) => {
          const trimmed = line.trimStart();
          if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
          if (!HEBREW.test(line)) return;
          // A quoted "/path/like/this" sitting in a Hebrew string.
          if (!/["'`][^"'`]*[\u0590-\u05FF][^"'`]*\/[a-z]+\/[a-z]+/.test(line)) return;
          if (line.includes(LRI) || /<Ltr\b/.test(line)) return;
          offenders.push(`${file}:${i + 1}`);
        });
    }
    expect(offenders).toEqual([]);
  });
});

describe("values that arrive from the database", () => {
  it("renders every product dimension inside an isolate", () => {
    // The owner types "320 × 260 ס״מ" into the admin. Rendered bare in a
    // Hebrew line it reads "260 × 320" — a different sofa.
    const offenders: string[] = [];
    for (const file of files) {
      readFileSync(join(ROOT, file), "utf8")
        .split(/\r?\n/)
        .forEach((line, i) => {
          if (!/\{\s*\w+\.dimensions\s*\}/.test(line)) return;
          if (/<Ltr\b/.test(line) || /dir="ltr"/.test(line)) return;
          offenders.push(`${file}:${i + 1}`);
        });
    }
    expect(offenders).toEqual([]);
  });
});
