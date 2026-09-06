import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * An icon-only control needs a hand-sized target, whatever the icon's size.
 *
 * Material asks for 48dp, Apple for 44pt, and the reason the two agree is that
 * a fingertip is a fingertip. This bit us when the catalogue rows were made
 * compact: the row got shorter, and the edit and delete buttons inside it came
 * down with it to 36px — under the floor on the exact screens someone uses on
 * a phone to fix a product while standing in a showroom.
 *
 * Material's own guidance on density is the rule here: shrink a component by
 * changing its dimensions, not by cutting the padding out of its controls.
 */

const ROOT = process.cwd();

/** Screens whose rows were deliberately compacted. */
const ROW_FILES = [
  "src/pages/admin/AdminCollections.tsx",
  "src/pages/admin/AdminCollectionProducts.tsx",
];

/** 44px. Tailwind's h-11 — anything smaller is under the floor. */
const BIG_ENOUGH = /\bh-(1[1-9]|[2-9]\d)\b/;

describe("icon-only controls", () => {
  it("are at least 44px on every compacted row", () => {
    const offenders: string[] = [];
    for (const file of ROW_FILES) {
      const src = readFileSync(join(ROOT, file), "utf8");
      // An aria-label on a control with no text content is an icon button.
      for (const [block] of src.matchAll(/<(?:button|Link)\b[^>]*aria-label=[\s\S]{0,600}?\/>|<(?:button|Link)\b[^>]*aria-label=[\s\S]{0,600}?<\/(?:button|Link)>/g)) {
        const cls = block.match(/className="([^"]*)"/)?.[1] ?? "";
        if (!BIG_ENOUGH.test(cls)) {
          offenders.push(`${file}: ${block.slice(0, 60).replace(/\s+/g, " ")}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
