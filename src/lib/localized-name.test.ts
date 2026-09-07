import { describe, expect, it } from "vitest";
import { hasBothNames, localizedName } from "./localized-name";

describe("localizedName", () => {
  it("shows the Hebrew name on the Hebrew site", () => {
    expect(localizedName("he", "כיסאות", "Chairs")).toBe("כיסאות");
  });

  it("shows the English name on the English site", () => {
    expect(localizedName("en", "כיסאות", "Chairs")).toBe("Chairs");
  });

  /**
   * The bug this whole file exists for: name_en was selected by the query and
   * then never read, so /en showed Hebrew collection names under English
   * headings.
   */
  it("falls back to Hebrew rather than to nothing", () => {
    expect(localizedName("en", "כיסאות", null)).toBe("כיסאות");
    expect(localizedName("en", "כיסאות", undefined)).toBe("כיסאות");
  });

  /** A field someone opened and left blank is not a translation. */
  it("treats blank and whitespace as no translation at all", () => {
    expect(localizedName("en", "כיסאות", "")).toBe("כיסאות");
    expect(localizedName("en", "כיסאות", "   ")).toBe("כיסאות");
  });

  it("trims a translation that was pasted with whitespace", () => {
    expect(localizedName("en", "כיסאות", "  Chairs  ")).toBe("Chairs");
  });
});

describe("hasBothNames", () => {
  it("requires both to be present and non-blank", () => {
    expect(hasBothNames("כיסאות", "Chairs")).toBe(true);
    expect(hasBothNames("כיסאות", "")).toBe(false);
    expect(hasBothNames("כיסאות", "  ")).toBe(false);
    expect(hasBothNames("", "Chairs")).toBe(false);
    expect(hasBothNames(null, "Chairs")).toBe(false);
    expect(hasBothNames("כיסאות", null)).toBe(false);
    expect(hasBothNames(undefined, undefined)).toBe(false);
  });

  /**
   * The admin's rule and the site's fallback must agree. Anything the rule
   * accepts, the site must be able to render in both languages.
   */
  it("agrees with what localizedName can actually render", () => {
    const rows: [string | null, string | null][] = [
      ["כיסאות", "Chairs"],
      ["כיסאות", " "],
      ["כיסאות", null],
    ];
    for (const [he, en] of rows) {
      if (hasBothNames(he, en)) {
        expect(localizedName("en", he!, en)).not.toBe(he);
      } else {
        expect(localizedName("en", he ?? "", en)).toBe(he ?? "");
      }
    }
  });
});
