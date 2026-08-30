import { describe, expect, it } from "vitest";
import { isolateLtr, LRI, PDI } from "./bidi";

/**
 * Latin and digits inside a Hebrew sentence are not safe by default.
 *
 * The worst case is a pair of numbers with a neutral between them. In a
 * right-to-left paragraph the Unicode algorithm treats European numbers as
 * right-to-left when it resolves the neutral, so "2400 × 1350" is laid out
 * as two runs in reading order and displays as "1350 × 2400" — the exact
 * opposite of the size we are telling somebody to use.
 *
 * The plain-text fix is an isolate: U+2066 opens it, U+2069 closes it.
 */
describe("isolateLtr", () => {
  it("wraps a run so the paragraph cannot reorder it", () => {
    expect(isolateLtr("2400 × 1350")).toBe(`${LRI}2400 × 1350${PDI}`);
  });

  it("protects a path, whose leading slash would otherwise jump", () => {
    expect(isolateLtr("/admin/login")).toBe(`${LRI}/admin/login${PDI}`);
  });

  it("leaves an empty string alone rather than emitting bare control marks", () => {
    expect(isolateLtr("")).toBe("");
  });

  it("does not double-wrap something already isolated", () => {
    const once = isolateLtr("8MB");
    expect(isolateLtr(once)).toBe(once);
  });

  it("keeps the visible characters exactly as they were", () => {
    const out = isolateLtr("dana@example.com");
    expect(out.replace(LRI, "").replace(PDI, "")).toBe("dana@example.com");
  });

  it("can be dropped into a Hebrew sentence", () => {
    const s = `הסיסמה נקבעה. אפשר להיכנס מ־${isolateLtr("/admin/login")}`;
    expect(s).toContain(LRI);
    expect(s).toContain(PDI);
  });
});
