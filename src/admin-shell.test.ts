import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Every admin screen has to arrive inside the shell.
 *
 * Three of them rendered a bare <div>: no sidebar, no way back, and no
 * padding, so the content sat flush against the edge of the window. From
 * those screens the only way out was the browser's back button — and on a
 * phone, where the nav is a strip at the top rather than a sidebar, there was
 * nothing at all.
 */

const ROOT = process.cwd();
const DIR = "src/pages/admin";

/** Not screens: the shell itself, the login page, and an in-dialog panel. */
const NOT_A_SCREEN = ["AdminLayout.tsx", "AdminLogin.tsx", "ProductFinishes.tsx"];

const screens = readdirSync(join(ROOT, DIR))
  .filter((f) => /\.tsx$/.test(f) && !/\.test\./.test(f) && !NOT_A_SCREEN.includes(f));

const read = (f: string) => readFileSync(join(ROOT, DIR, f), "utf8");

describe("admin screens", () => {
  it("finds the screens", () => {
    expect(screens.length).toBeGreaterThan(8);
  });

  it("all render inside the shell, so every one has navigation", () => {
    const bare = screens.filter((f) => !read(f).includes("<AdminLayout"));
    expect(bare).toEqual([]);
  });

  it("all open on a heading at the same size", () => {
    // A screen that sets its own heading size reads as a different product.
    const odd = screens.filter((f) => {
      const src = read(f);
      const h1 = src.match(/<h1[^>]*className="([^"]*)"/);
      return h1 ? !h1[1].includes("text-3xl") : false;
    });
    expect(odd).toEqual([]);
  });
});
