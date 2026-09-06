import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * The sizes on the admin screens, pinned to the systems they came from.
 *
 * These numbers are not taste. Each one is published by a design system that
 * ships a real content manager, and each was wrong here before it was right:
 * the catalogue rows carried a 56px thumbnail that matches no documented size,
 * the tables dropped to 12px in cells, and the sidebar ran as small as 10px.
 *
 * What is deliberately NOT guarded is content width. No system publishes a
 * line-length or max-width rule that covers list rows — WCAG's is Level AAA,
 * satisfied by a mechanism, and scoped to blocks of prose — so the widths on
 * these screens are judgement, and a test would only make them look sourced.
 */

const ADMIN = "src/pages/admin";
const ROOT = process.cwd();

function adminFiles(): string[] {
  return readdirSync(join(ROOT, ADMIN))
    .filter((n) => /\.tsx?$/.test(n) && !/\.test\./.test(n))
    .map((n) => `${ADMIN}/${n}`);
}

const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("admin type sizes", () => {
  /**
   * Atlassian raised its own floor from 11px to 12px "for enhanced
   * accessibility and readability", and removed the escape hatch that let
   * anyone go under it. No standard mandates a minimum — this is a borrowed
   * floor, not a legal one — but a person reading a sidebar at 10px does not
   * care which of those it is.
   */
  it("never goes below 12px", () => {
    const under = adminFiles().flatMap((f) =>
      [...read(f).matchAll(/text-\[(\d+)px\]/g)]
        .filter((m) => Number(m[1]) < 12)
        .map((m) => `${f}: ${m[0]}`),
    );
    expect(under).toEqual([]);
  });

  /**
   * Carbon holds table row text and column headers at 14px at every one of its
   * five row heights — the 24px extra-small row still sets 14px text and buys
   * its density from padding instead. Shrinking the type is the one move it
   * does not make.
   */
  it("keeps table cells and column headers at 14px", () => {
    const small = adminFiles().flatMap((f) =>
      read(f)
        .split("\n")
        .map((line, i) => ({ line, n: i + 1 }))
        .filter(({ line }) => /<(td|th|thead)\b[^>]*\btext-xs\b/.test(line))
        .map(({ n }) => `${f}:${n}`),
    );
    expect(small).toEqual([]);
  });
});

/** The two screens that list things with a picture. */
const ROW_FILES = [
  `${ADMIN}/AdminCollections.tsx`,
  `${ADMIN}/AdminCollectionProducts.tsx`,
];

describe("catalogue row thumbnails", () => {
  /**
   * Polaris fixes its Thumbnail to 24 / 40 / 60 / 80px and calls 60px the
   * default, reserving 24px for tightly condensed cells and warning off 80px
   * "in lists of like items". 56px — where these rows sat — is not one of the
   * four; it was a Tailwind step, chosen because h-14 exists.
   */
  it("use a size Polaris actually publishes", () => {
    for (const f of ROW_FILES) {
      expect(read(f)).toContain("h-[60px] w-[60px]");
    }
  });

  /**
   * Polaris's square frame letterboxes: the image is centred at its natural
   * ratio inside the box, never cropped to fill it. That matters for furniture
   * shot off-square — a cover-crop takes the legs off a chair and the person
   * uploading it never finds out.
   */
  it("letterbox rather than crop", () => {
    for (const f of ROW_FILES) {
      const thumb = read(f)
        .split("\n")
        .filter((l) => l.includes("h-[60px] w-[60px]"))
        .join("\n");
      expect(thumb).toContain("object-contain");
      expect(thumb).not.toContain("object-cover");
    }
  });
});
