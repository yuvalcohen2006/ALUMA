import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { localizedName, productName } from "./localized-name";

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
describe("productName", () => {
  it("keeps the owner's Latin spelling on the Hebrew site, casing and all", () => {
    expect(productName("he", "milo", null)).toBe("milo");
    expect(productName("he", "Elba", "Elba")).toBe("Elba");
    expect(productName("he", "tano trio", "tano trio")).toBe("tano trio");
  });

  /** The live state until the names script runs: Hebrew in `name`, the
   *  original in `name_en`. */
  it("undoes the transliteration by reading the original back", () => {
    expect(productName("he", "מילו", "milo")).toBe("milo");
    expect(productName("he", "ג'יימס", "James")).toBe("James");
  });

  it("prefers the name field once it is Latin, so an admin edit shows", () => {
    expect(productName("he", "Dex", "dex")).toBe("Dex");
  });

  it("falls back to a Hebrew name rather than to nothing", () => {
    expect(productName("he", "ספסל", null)).toBe("ספסל");
    expect(productName("he", "ספסל", "   ")).toBe("ספסל");
  });

  it("leaves the English site reading its own field first", () => {
    expect(productName("en", "dex", "Dex fire table")).toBe("Dex fire table");
    expect(productName("en", "מילו", "milo")).toBe("milo");
    expect(productName("en", "milo", null)).toBe("milo");
  });
});

describe("where the product name has to reach", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("is used by every page that prints a product name", () => {
    for (const f of [
      "src/pages/CollectionPage.tsx",
      "src/pages/CollectionDetail.tsx",
      "src/components/home/FeaturedProducts.tsx",
    ]) {
      expect(read(f)).toContain("productName(");
      // localizedName on a product would put the Hebrew transliteration back.
      expect(read(f)).not.toMatch(/localizedName\(lang, (p|c|item)\.name,/);
    }
  });

  it("is actually fetched by the product page", () => {
    // A column list here is also a hard dependency on a migration having run:
    // PostgREST rejects the whole query with a 400 for one unknown name.
    expect(read("src/pages/CollectionDetail.tsx")).toContain('.select("*")');
  });
});
