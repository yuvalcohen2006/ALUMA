import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Files that must exist as real files, because something asks for them by
 * name and will not follow a redirect to an HTML page.
 *
 * The SPA rewrite sends every unmatched path to index.html with a 200. That is
 * right for routes and wrong for /favicon.ico: a crawler requesting it got
 * HTML, read that as a broken icon, and kept whatever it had cached — which,
 * on a domain that used to serve someone else's site, was someone else's mark.
 */

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");

const REQUIRED = [
  "favicon.ico",
  "favicon.png",
  "icon-16.png",
  "icon-32.png",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png",
  "site.webmanifest",
];

describe("static icon files", () => {
  it.each(REQUIRED)("%s exists and is not empty", (file) => {
    const path = join(PUBLIC, file);
    expect(existsSync(path), `public/${file} is missing`).toBe(true);
    expect(statSync(path).size).toBeGreaterThan(100);
  });

  it("favicon.ico is a real icon, not a renamed PNG or an HTML page", () => {
    const d = readFileSync(join(PUBLIC, "favicon.ico"));
    // ICONDIR: reserved 0, type 1 (icon), at least one image.
    expect(d.readUInt16LE(0)).toBe(0);
    expect(d.readUInt16LE(2)).toBe(1);
    expect(d.readUInt16LE(4)).toBeGreaterThan(0);
  });

  it("is declared in the document head, with .ico first", () => {
    const html = readFileSync(join(ROOT, "index.html"), "utf8");
    expect(html).toMatch(/<link rel="icon" href="\/favicon\.ico"/);
    expect(html).toMatch(/rel="apple-touch-icon"/);
    expect(html).toMatch(/rel="manifest"/);
  });

  it("the manifest points at icons that exist", () => {
    const m = JSON.parse(readFileSync(join(PUBLIC, "site.webmanifest"), "utf8"));
    expect(m.icons.length).toBeGreaterThan(0);
    for (const icon of m.icons) {
      expect(existsSync(join(PUBLIC, icon.src.replace(/^\//, ""))), icon.src).toBe(true);
    }
  });
})
