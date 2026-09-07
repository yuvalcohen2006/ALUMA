import { describe, expect, it } from "vitest";
import {
  capEmblems,
  emblemLabel,
  isEmblem,
  MAX_EMBLEMS_PER_GRID,
  resolveEmblems,
} from "./emblems";

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

describe("resolving the automatic new emblem", () => {
  const NOW = new Date("2026-09-07T00:00:00Z");
  const at = (iso: string, id: string, emblem: string | null = null) => ({
    id,
    created_at: iso,
    emblem,
  });

  /**
   * The case this rule exists for. Aluma's 47 products were loaded in two
   * batches days apart, so "newer than 45 days" marks the entire catalogue —
   * every tile badged, which is the same as none.
   */
  it("does not mark a whole bulk-imported catalogue as new", () => {
    const products = [
      ...Array.from({ length: 42 }, (_, i) => at("2026-09-01T10:00:00Z", `old${i}`)),
      ...Array.from({ length: 5 }, (_, i) => at("2026-09-06T10:00:00Z", `fresh${i}`)),
    ];
    const resolved = resolveEmblems(products, NOW);
    expect(resolved.size).toBe(5);
    expect([...resolved.keys()].every((k) => k.startsWith("fresh"))).toBe(true);
  });

  it("ignores anything older than the window", () => {
    const products = [at("2026-01-01T00:00:00Z", "ancient"), at("2026-09-05T00:00:00Z", "recent")];
    const resolved = resolveEmblems(products, NOW);
    expect(resolved.get("ancient")).toBeUndefined();
    expect(resolved.get("recent")).toBe("new");
  });

  it("marks nothing when the shop has added nothing for a year", () => {
    const products = [at("2025-06-01T00:00:00Z", "a"), at("2025-07-01T00:00:00Z", "b")];
    expect(resolveEmblems(products, NOW).size).toBe(0);
  });

  /**
   * A person choosing "popular" is making a claim; "new" is a fact about the
   * calendar. If the calendar won, the owner would set popular, see new, and
   * conclude the field was broken.
   */
  it("lets a hand-set emblem beat the computed one", () => {
    const products = [at("2026-09-06T00:00:00Z", "x", "popular")];
    expect(resolveEmblems(products, NOW).get("x")).toBe("popular");
  });

  it("prefers published_at over created_at when it exists", () => {
    const products = [
      { id: "seeded", created_at: "2026-09-06T00:00:00Z", published_at: "2025-01-01T00:00:00Z" },
    ];
    expect(resolveEmblems(products, NOW).size).toBe(0);
  });

  it("survives a missing or unparseable date", () => {
    const products = [
      { id: "none" },
      { id: "junk", created_at: "not a date" },
      at("2026-09-06T00:00:00Z", "ok"),
    ];
    const resolved = resolveEmblems(products, NOW);
    expect(resolved.get("none")).toBeUndefined();
    expect(resolved.get("junk")).toBeUndefined();
    expect(resolved.get("ok")).toBe("new");
  });
});
