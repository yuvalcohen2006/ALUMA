import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * House rules for the admin panel, as the owner stated them.
 *
 * "Make sure every single text line in the admin page is at least 16px" and
 * "remove all of the unhelpful and confusing lines". Both are easy to honour
 * once and lose a screen at a time, so they are checked here rather than
 * remembered.
 */
const ROOT = process.cwd();
const DIRS = ["src/pages/admin", "src/components/admin"];

const adminFiles = () =>
  DIRS.flatMap((dir) =>
    readdirSync(join(ROOT, dir))
      .filter((f) => f.endsWith(".tsx") && !f.includes(".test."))
      .map((f) => `${dir}/${f}`),
  );

const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("the admin panel reads at arm's length", () => {
  /** Tailwind: text-xs is 12px and text-sm is 14px. Neither is allowed here. */
  it("sets no text under 16px", () => {
    const offenders: string[] = [];
    for (const file of adminFiles()) {
      const source = read(file);
      for (const match of source.matchAll(/\btext-(xs|sm)\b|text-\[(1[0-5])px\]/g)) {
        offenders.push(`${file}: ${match[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("keeps a way out of every screen", () => {
    // The shell draws the trail and the menu; every screen goes through it.
    const layout = read("src/pages/admin/AdminLayout.tsx");
    expect(layout).toContain('aria-label="מיקום"');
    expect(layout).toContain("navGroups.map");
    for (const file of adminFiles()) {
      if (file.endsWith("AdminLayout.tsx") || file.endsWith("AdminLogin.tsx")) continue;
      if (!read(file).includes("export default")) continue;
      // Every screen renders inside the shell, so the sidebar, the phone menu
      // and the trail come with it.
      if (/const Admin\w+ = \(\) =>|function Admin\w+\(/.test(read(file))) {
        expect(read(file), file).toMatch(/<AdminLayout/);
      }
    }
  });

  /**
   * The lines the owner named, and the ones like them: a paragraph under a
   * field explaining what the field will do to the site.
   */
  it("has dropped the paragraphs that explained the panel to itself", () => {
    const gone = [
      "שם המידה קודם",
      "מ־5 ומטה מופיעה שורה כתומה",
      "צלמו מאותה זווית",
      "כל צבע הוא עיגול בעמוד המוצר",
      "בחרו עד שלושה מוצרים",
      "לא חובה. אם תמלאו",
      "הכותרת שגוגל וקוראי מסך רואים",
      "כל שדה כאן הוא טקסט שמופיע באתר",
    ];
    const all = adminFiles().map(read).join("\n");
    expect(gone.filter((line) => all.includes(line))).toEqual([]);
  });

  /** A photo needs its size; it does not need a warning. */
  it("states a photo's size without a paragraph about it", () => {
    const specs = read("src/lib/photo-specs.ts");
    expect(specs).not.toContain("watchOut");
    expect(specs).toContain("1600 × 1200");
  });
});
