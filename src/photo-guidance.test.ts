import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PHOTO_SPECS } from "@/lib/photo-specs";

/**
 * Every screen that accepts a photo has to say what the photo should be.
 *
 * Otherwise the owner uploads a 600px phone screenshot, the site stretches it,
 * and the only feedback anyone gets is that the site "looks cheap" — which
 * nobody traces back to an upload box that asked for nothing.
 */

const ROOT = process.cwd();
const ADMIN = "src/pages/admin";

const adminFiles = readdirSync(join(ROOT, ADMIN))
  .filter((f) => /\.tsx$/.test(f) && !/\.test\./.test(f))
  .map((f) => `${ADMIN}/${f}`);

const read = (f: string) => readFileSync(join(ROOT, f), "utf8");

/** Screens with a file input are screens that need a spec. */
const uploaders = adminFiles.filter((f) => read(f).includes("uploadFile("));

describe("photo guidance", () => {
  it("finds the screens that accept uploads", () => {
    expect(uploaders.length).toBeGreaterThan(2);
  });

  it("tells the owner what the photo should be, on every one of them", () => {
    const silent = uploaders.filter((f) => !read(f).includes("<PhotoSpec"));
    expect(silent).toEqual([]);
  });

  it("names a spec that actually exists", () => {
    const keys = Object.keys(PHOTO_SPECS);
    const bad: string[] = [];
    for (const file of uploaders) {
      for (const [, key] of read(file).matchAll(/<PhotoSpec\s+spec="(\w+)"/g)) {
        if (!keys.includes(key)) bad.push(`${file}: ${key}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("gives every spec a real size, not a placeholder", () => {
    for (const [key, spec] of Object.entries(PHOTO_SPECS)) {
      expect(spec.size, key).toMatch(/^\d{3,}\s*×\s*\d{3,}$/);
      expect(spec.watchOut.length, key).toBeGreaterThan(20);
    }
  });
});
