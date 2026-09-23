import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PHOTO_SPECS } from "@/lib/photo-specs";

/**
 * Every photograph in the admin goes through the same control.
 *
 * PhotoTiles is where a photo is added, adjusted and removed, and it is what
 * states the size — a paragraph above the box was the old way and the owner
 * asked for it to go. What matters now is that no screen rolls its own file
 * input again, and that the spec each one names is real.
 */

const ROOT = process.cwd();
const ADMIN = "src/pages/admin";

const adminFiles = readdirSync(join(ROOT, ADMIN))
  .filter((f) => /\.tsx$/.test(f) && !/\.test\./.test(f))
  .map((f) => `${ADMIN}/${f}`);

const read = (f: string) => readFileSync(join(ROOT, f), "utf8");

/** Screens that put a photograph anywhere. */
const uploaders = adminFiles.filter((f) => read(f).includes("PhotoTiles"));

describe("photo guidance", () => {
  it("finds the screens that accept photographs", () => {
    expect(uploaders.length).toBeGreaterThan(2);
  });

  it("puts every one of them through the same control", () => {
    // A hand-rolled <input type="file"> is how the panel ended up with three
    // different ways to change a picture and no way to adjust one.
    const rolledTheirOwn = adminFiles.filter(
      (f) => /type="file"/.test(read(f)) && !read(f).includes("PhotoTiles"),
    );
    expect(rolledTheirOwn).toEqual([]);
  });

  it("names a spec that actually exists", () => {
    const keys = Object.keys(PHOTO_SPECS);
    const bad: string[] = [];
    for (const file of uploaders) {
      for (const [, key] of read(file).matchAll(/spec="(\w+)"/g)) {
        if (!keys.includes(key)) bad.push(`${file}: ${key}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("gives every spec a real size, not a placeholder", () => {
    for (const [key, spec] of Object.entries(PHOTO_SPECS)) {
      expect(spec.size, key).toMatch(/^\d{3,}\s*×\s*\d{3,}$/);
      // The paragraph of advice that used to go with each of these is gone:
      // the owner asked for the admin to stop explaining itself at him.
      expect(spec.out.w, key).toBeGreaterThan(100);
    }
  });
});
