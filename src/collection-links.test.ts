import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * A collection link must be built from data, never typed by hand.
 *
 * The categories grid on /collections carried eight hand-written tiles. Two
 * pointed at slugs like "salons" and "fire-tables"; six pointed at nothing at
 * all. The real collections are named in Hebrew and their slugs are
 * transliterated on save — "כיסאות" becomes "kysavt" — so no hand-written
 * slug could ever match one. Every tile was either a 404 or a link back to
 * the page you were already on.
 *
 * Nothing about that was visible until real collections existed.
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

const files = [...sourceFiles("src/pages"), ...sourceFiles("src/components")]
  .map((f) => f.split("\\").join("/"))
  .filter((f) => !f.includes("/admin/"));

describe("collection links", () => {
  it("are never built from a hand-written slug", () => {
    const offenders: string[] = [];
    for (const file of files) {
      readFileSync(join(ROOT, file), "utf8")
        .split(/\r?\n/)
        .forEach((line, i) => {
          const trimmed = line.trimStart();
          if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
          // Only routing: an asset living under assets/collections/ is a
          // file path, not a link.
          if (/^import /.test(trimmed) || /@\/assets/.test(line)) return;
          if (!/(to|href)\s*[=(]/.test(line)) return;
          // A literal path segment after /collections/ — as opposed to an
          // interpolated ${...} from a database row.
          if (/\/collections\/[a-z]/.test(line)) offenders.push(`${file}:${i + 1} ${trimmed.slice(0, 60)}`);
        });
    }
    expect(offenders).toEqual([]);
  });

  it("are never built from a hand-written product slug either", () => {
    const offenders: string[] = [];
    for (const file of files) {
      readFileSync(join(ROOT, file), "utf8")
        .split(/\r?\n/)
        .forEach((line, i) => {
          const trimmed = line.trimStart();
          if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
          if (/^import /.test(trimmed) || /@\/assets/.test(line)) return;
          if (!/(to|href)\s*[=(]/.test(line)) return;
          if (/\/products\/[a-z]/.test(line)) offenders.push(`${file}:${i + 1}`);
        });
    }
    expect(offenders).toEqual([]);
  });
});

describe("product photographs", () => {
  it("are never cropped on the product page", () => {
    // The photographs are square by spec. The main image boxes are not always
    // square, so object-cover silently cut the top and bottom off the
    // furniture — on the one page whose entire job is showing the furniture.
    const src = readFileSync(join(ROOT, "src/pages/CollectionDetail.tsx"), "utf8");
    const mainImages = [...src.matchAll(/galleryImages\[[^\]]+\][\s\S]{0,400}?className="([^"]+)"/g)];
    expect(mainImages.length).toBeGreaterThan(0);
    for (const [, cls] of mainImages) {
      expect(cls, "main product image must not crop").not.toMatch(/object-cover/);
    }
  });
});
