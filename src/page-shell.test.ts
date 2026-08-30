import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Every public page arrives inside <Layout>.
 *
 * Three pages hand-rolled a Header and a Footer instead. That looks the same
 * in a screenshot and is not the same page: Layout is also what carries the
 * skip-to-content link, the <main> landmark, the accessibility widget, the
 * WhatsApp button and the cookie notice. A page that opts out of it silently
 * drops all five.
 */

const ROOT = process.cwd();
const DIR = "src/pages";

const pages = readdirSync(join(ROOT, DIR)).filter(
  (f) => /\.tsx$/.test(f) && !/\.test\./.test(f),
);

const read = (f: string) => readFileSync(join(ROOT, DIR, f), "utf8");

describe("public pages", () => {
  it("finds the pages", () => {
    expect(pages.length).toBeGreaterThan(15);
  });

  it("all render inside the site layout", () => {
    const bare = pages.filter((f) => !read(f).includes("<Layout"));
    expect(bare).toEqual([]);
  });

  it("none reach for the header or footer directly", () => {
    // Importing them is how a page ends up outside the layout in the first
    // place: it looks finished, so nobody notices what is missing.
    const direct = pages.filter((f) => {
      const src = read(f);
      return (
        /import Header from "@\/components\/Header"/.test(src) ||
        /import Footer from "@\/components\/Footer"/.test(src)
      );
    });
    expect(direct).toEqual([]);
  });
});

describe("landmarks", () => {
  it("no page declares a second <main>", () => {
    // Layout already provides the one <main id="main-content">. A second is
    // invalid, and a screen reader offers two "main" landmarks to choose from.
    const doubled = pages.filter((f) => /<main\b/.test(read(f)));
    expect(doubled).toEqual([]);
  });
});
