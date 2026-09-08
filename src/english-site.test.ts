import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * What an English visitor actually gets.
 *
 * Two defects sat here together and neither was visible from the Hebrew site.
 *
 * `useSiteText(key, fallback)` returns the fallback VERBATIM on /en — the
 * editable layer is Hebrew-only, deliberately, because the admin is Hebrew. So
 * a hardcoded Hebrew second argument is not a fallback at all: it is the
 * English page's copy. The home page shipped its heading, its brand paragraph
 * and its primary call to action in Hebrew to every English visitor.
 *
 * And <main> hardcoded dir="rtl", so every logical property inside it resolved
 * against the wrong axis: text-start right-aligned English headings, and every
 * ms-/me-/start-/end- on every page pointed the wrong way.
 */

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const HEBREW = /[\u0590-\u05FF]/;

function files(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...files(p));
    else if (/\.tsx$/.test(e.name) && !/\.test\./.test(e.name)) out.push(p);
  }
  return out;
}

describe("the English home page", () => {
  it("has no Hebrew string standing in as its copy", () => {
    const offenders: string[] = [];
    for (const f of files("src/components/home")) {
      for (const m of read(f).matchAll(/t\(\s*"home\.[a-z.]+"\s*,\s*([^)]+?)\)/g)) {
        const arg = m[1].trim();
        if (arg.startsWith('"') && HEBREW.test(arg)) offenders.push(`${f}: ${arg.slice(0, 40)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("has an English translation for every key the home page asks for", () => {
    const en = JSON.parse(read("src/i18n/locales/en/home.json"));
    const he = JSON.parse(read("src/i18n/locales/he/home.json"));
    const flat = (o: Record<string, unknown>, p = ""): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        v && typeof v === "object" ? flat(v as Record<string, unknown>, `${p}${k}.`) : [`${p}${k}`],
      );
    expect(flat(he).sort()).toEqual(flat(en).sort());
  });

  it("carries no Hebrew inside the English catalogue", () => {
    const en = read("src/i18n/locales/en/home.json");
    expect(HEBREW.test(en), "en/home.json contains Hebrew").toBe(false);
  });
});

describe("page direction", () => {
  /**
   * The nearest dir attribute is what a logical property resolves against, so
   * one hardcoded value on <main> was enough to lay the whole English site out
   * backwards.
   */
  it("follows the language rather than being hardcoded", () => {
    const layout = read("src/components/Layout.tsx");
    expect(layout).toContain("dir={LANGUAGE_DIR[lang]}");
    expect(layout).not.toMatch(/<main[^>]*dir="rtl"/);
  });
});
