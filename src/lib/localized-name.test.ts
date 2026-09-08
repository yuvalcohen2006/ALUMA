import { describe, expect, it } from "vitest";
import { localizedName } from "./localized-name";

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
