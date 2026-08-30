import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Nothing a visitor has to read is allowed to be tiny.
 *
 * 16px is the floor for running text on a phone — below it iOS zooms the page
 * on focus, and everyone squints. The site has a five-role scale precisely so
 * nobody has to pick a number; a raw `text-xs` in a page is someone stepping
 * outside it, and it is always smaller than the floor.
 *
 * The admin panel is exempt: it is a tool used at a desk by two people, and it
 * uses shadcn's own sizes throughout.
 */

const ROOT = process.cwd();

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (/\.tsx$/.test(entry.name) && !/\.test\./.test(entry.name)) out.push(path);
  }
  return out;
}

const publicFiles = [...sourceFiles("src/pages"), ...sourceFiles("src/components")]
  .map((f) => f.split("\\").join("/"))
  .filter((f) => !f.includes("/admin/") && !f.includes("/ui/"));

const read = (f: string) => readFileSync(join(ROOT, f), "utf8");

describe("the type scale", () => {
  it("defines running text at 16px or more", () => {
    const config = readFileSync(join(ROOT, "tailwind.config.ts"), "utf8");
    const small = config.match(/small: \["([\d.]+)rem"/);
    expect(small, "a `small` role should exist").toBeTruthy();
    // 1rem = 16px. `small` is the smaller of the two running-text roles, so
    // it is the one that decides the floor.
    expect(Number(small![1])).toBeGreaterThanOrEqual(1);
  });

  it("is what every public page uses — no raw tiny sizes", () => {
    const offenders: string[] = [];
    for (const file of publicFiles) {
      const src = read(file);
      src.split(/\r?\n/).forEach((line, i) => {
        // text-xs is 12px; anything hand-set below 14px is under the floor too.
        if (/\btext-xs\b/.test(line) || /text-\[(?:[0-9]|1[0-3])px\]/.test(line)) {
          offenders.push(`${file}:${i + 1}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});
