import { describe, expect, it } from "vitest";
import { capEmblems, emblemLabel, isEmblem, MAX_EMBLEMS_PER_GRID } from "./emblems";

describe("emblems", () => {
  it("only recognises the three it defines", () => {
    expect(isEmblem("popular")).toBe(true);
    expect(isEmblem("new")).toBe(true);
    expect(isEmblem("sale")).toBe(false);
    expect(isEmblem("")).toBe(false);
    expect(isEmblem(null)).toBe(false);
    expect(isEmblem(undefined)).toBe(false);
  });

  it("has a label in both languages", () => {
    expect(emblemLabel("new", "he")).toBe("חדש");
    expect(emblemLabel("new", "en")).toBe("New");
  });
});

describe("the cap", () => {
  /**
   * Rarity is the whole mechanism. On a strip of three, two emblems is two
   * thirds of the row and the word stops carrying anything.
   */
  it("keeps only the first, in document order", () => {
    const rows = [{ e: "popular" }, { e: "new" }, { e: "hot" }];
    expect(capEmblems(rows, (r) => r.e)).toEqual(["popular", null, null]);
  });

  it("skips rows with no emblem without spending the budget", () => {
    const rows = [{ e: null }, { e: "new" }, { e: "hot" }];
    expect(capEmblems(rows, (r) => r.e)).toEqual([null, "new", null]);
  });

  it("ignores a value the database should never have held", () => {
    const rows = [{ e: "clearance" }, { e: "new" }];
    expect(capEmblems(rows, (r) => r.e)).toEqual([null, "new"]);
  });

  it("returns one entry per item so callers keep their indices", () => {
    const rows = [{ e: "new" }, { e: null }, { e: "hot" }, { e: null }];
    expect(capEmblems(rows, (r) => r.e)).toHaveLength(rows.length);
  });

  it("defaults to a cap of one", () => {
    expect(MAX_EMBLEMS_PER_GRID).toBe(1);
  });
});
