import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * The CMS promises more than the code can keep unless these two lists agree.
 *
 * A row in `site_texts` is an invitation: the admin screen labels it by where
 * it appears on the site and offers a Save button. If no component ever asks
 * for that key, the owner edits it, sees "נשמר", and the site does not change
 * — the worst possible failure, because it looks like success.
 *
 * These read the real migration and the real components rather than a fixture,
 * so adding a key without a reader (or deleting a reader) fails here.
 */

const ROOT = process.cwd();
const MIGRATION = "supabase/migrations/20260801120000_cms_texts_faqs_variants.sql";

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (/\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name)) out.push(path);
  }
  return out;
}

/** The keys the admin screen will offer for editing. */
function seededKeys(): string[] {
  const sql = readFileSync(join(ROOT, MIGRATION), "utf8");
  const block = sql.slice(sql.indexOf("insert into public.site_texts"));
  const stop = block.indexOf("insert into public.site_faqs");
  return [...(stop === -1 ? block : block.slice(0, stop)).matchAll(/\('([a-z][\w.]*)',/g)].map(
    (m) => m[1],
  );
}

/** The keys some component actually renders, mapped to where. */
function consumedKeys(): Map<string, string[]> {
  const found = new Map<string, string[]>();
  for (const file of sourceFiles("src")) {
    const src = readFileSync(join(ROOT, file), "utf8");
    if (!src.includes("useSiteText()")) continue;
    for (const [, alias] of src.matchAll(/const\s+(\w+)\s*=\s*useSiteText\(\)/g)) {
      for (const [, key] of src.matchAll(new RegExp(`\\b${alias}\\(\\s*"([a-z][\\w.]*)"`, "g"))) {
        found.set(key, [...(found.get(key) ?? []), relative(".", file)]);
      }
    }
  }
  return found;
}

describe("editable site texts", () => {
  const seeded = seededKeys();
  const consumed = consumedKeys();

  it("seeds a non-trivial set of keys", () => {
    // Guards the parser itself: a regex that silently matched nothing would
    // make every assertion below pass for the wrong reason.
    expect(seeded.length).toBeGreaterThan(5);
  });

  it("renders every key the admin offers for editing", () => {
    const dead = seeded.filter((k) => !consumed.has(k));
    expect(dead).toEqual([]);
  });

  it("seeds every key the components ask for", () => {
    // The other direction: a component asking for an unseeded key renders its
    // fallback forever, and the owner has no field to change it in.
    const missing = [...consumed.keys()].filter((k) => !seeded.includes(k));
    expect(missing).toEqual([]);
  });

  it("gives every key exactly one seeded row", () => {
    const dupes = seeded.filter((k, i) => seeded.indexOf(k) !== i);
    expect(dupes).toEqual([]);
  });
});
