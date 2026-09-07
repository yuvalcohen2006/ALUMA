import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The site must survive a deploy that lands before its migration does.
 *
 * This is not hypothetical. A column list naming `name_en` and `emblem` shipped
 * one commit before the SQL that creates them, and PostgREST does not ignore an
 * unknown column — it rejects the ENTIRE query with a 400. So `products` came
 * back null and every product on the site vanished: empty collection pages, an
 * empty catalogue, an empty home page. Not degraded. Gone.
 *
 * Code deploys on push; SQL is run by a person. The gap between them is normal
 * and will happen again, so the read path has to tolerate a column that does
 * not exist yet.
 */

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("the catalogue read path", () => {
  it("does not enumerate columns that a pending migration might add", () => {
    const src = read("src/hooks/useCollectionsData.ts");
    const block = src.slice(src.indexOf('from("site_collection_products")'));
    const select = block.slice(0, block.indexOf(".eq("));
    expect(select, "product reads should select * — see the comment there").toContain('select("*")');
  });

  /**
   * The other half: a column that is absent must read as absent, not as
   * undefined leaking through a type that promises `string | null`.
   */
  it("normalises columns that may not exist yet", () => {
    const src = read("src/hooks/useCollectionsData.ts");
    expect(src).toMatch(/name_en:\s*p\?\.name_en \?\? null/);
    expect(src).toMatch(/emblem:\s*p\?\.emblem \?\? null/);
  });

  /**
   * A table that does not exist yet returns an error and null data. Anything
   * reading one has to treat that as "nothing picked", not as a crash.
   */
  it("treats a missing highlights table as nothing picked", () => {
    expect(read("src/hooks/useHomeHighlights.ts")).toMatch(/\?\?\s*\[\]/);
  });
});
