import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

/**
 * The admin has collected "השם באנגלית" on every product since the migration,
 * and the guide asks the owner to fill it in — while the product page and the
 * collection grid both rendered the Hebrew name regardless, and the product
 * query did not even fetch the column. Collections did it properly, which is
 * exactly why it looked finished.
 */
describe("where the English name has to reach", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("is used by every page that prints a product name", () => {
    for (const f of ["src/pages/CollectionPage.tsx", "src/pages/CollectionDetail.tsx"]) {
      expect(read(f)).toContain("localizedName(");
    }
  });

  it("is actually fetched by the product page", () => {
    // A column list here is also a hard dependency on a migration having run:
    // PostgREST rejects the whole query with a 400 for one unknown name.
    expect(read("src/pages/CollectionDetail.tsx")).toContain('.select("*")');
  });
});
