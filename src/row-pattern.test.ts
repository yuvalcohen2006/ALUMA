import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The catalogue rows, checked against what three adversarial reviewers found
 * wrong with them. Every rule here is a defect that shipped.
 */

const ROOT = process.cwd();
const FILES = [
  "src/pages/admin/AdminCollections.tsx",
  "src/pages/admin/AdminCollectionProducts.tsx",
];
const read = (f: string) => readFileSync(join(ROOT, f), "utf8");

describe("catalogue rows", () => {
  it("keep list semantics that Tailwind's preflight would strip", () => {
    // `ol, ul, menu { list-style: none }` in preflight makes Safari/VoiceOver
    // drop the list role, so neither "list, 9 items" nor "1 of 9" is spoken.
    // This codebase already knew — Club.tsx and DIY.tsx carry the same rule.
    for (const f of FILES) {
      for (const [tag] of read(f).matchAll(/<ul\b[^>]*>/g)) {
        expect(tag, `${f}: <ul> without role="list"`).toMatch(/role="list"/);
      }
    }
  });

  it("paint the focus ring they promise", () => {
    // `outline-2` sets outline-WIDTH only, and outline-style's initial value
    // is none — so a ring built from width, offset and colour paints nothing
    // at all. The bare `outline` utility is what emits outline-style: solid.
    for (const f of FILES) {
      const src = read(f);
      if (!/focus-visible:after:outline-2/.test(src)) continue;
      expect(src, `${f}: ring has width but no style`).toMatch(
        /focus-visible:after:outline(?![-\w])/,
      );
    }
  });

  it("leave dead space between the row link and the delete button", () => {
    // inset-0 runs the navigate surface edge to edge, so one pixel outboard of
    // delete navigates and one pixel inboard deletes.
    for (const f of FILES) {
      const src = read(f);
      if (!/after:absolute/.test(src)) continue;
      expect(src, `${f}: stretched link covers the whole row`).not.toMatch(
        /after:absolute after:inset-0/,
      );
    }
  });

  it("show their actions on a device that cannot hover", () => {
    // opacity-0 with only a :hover reveal leaves the controls invisible but
    // hit-testable on touch — and the stretched link means tapping to reveal
    // navigates away instead.
    for (const f of FILES) {
      const src = read(f);
      for (const [cls] of src.matchAll(/className="[^"]*group-hover:opacity-100[^"]*"/g)) {
        expect(cls, `${f}: hover-only reveal`).toMatch(/hover:none/);
      }
    }
  });

  it("announce drags by name rather than by UUID", () => {
    // dnd-kit's defaults read the id — a 36-character hex string — in English,
    // into an assertive live region, on a Hebrew interface.
    for (const f of FILES) {
      const src = read(f);
      if (!/<DndContext/.test(src)) continue;
      expect(src, `${f}: DndContext without announcements`).toMatch(/dragAnnouncements/);
      expect(src, `${f}: handle keeps dnd-kit's English role description`).toMatch(
        /sortableHandleAttributes/,
      );
    }
  });
});
