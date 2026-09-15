import type { Language } from "@/i18n";

/**
 * The name to show for a piece of content, in the language being read.
 *
 * This exists because the English name was dead data. `site_collections` has
 * carried a `name_en` column since the CMS was built, the query selects it, and
 * every component then rendered `name_he` — so a visitor on /en read English
 * navigation, English headings and English body copy, and then Hebrew
 * collection names inside them. Products had no English name at all.
 *
 * The fallback is deliberate and it is to Hebrew, not to empty. A missing
 * translation should look like an untranslated name, which is a thing a person
 * can read and report; it should never look like a missing product.
 *
 * Blank-but-present counts as missing. A text column that someone opened and
 * left as "" or "   " is not a translation, and treating it as one is how a
 * catalogue ends up with unnamed rows.
 */
export function localizedName(
  lang: Language,
  he: string,
  en?: string | null,
): string {
  if (lang !== "he" && en && en.trim()) return en.trim();
  return he;
}

const HEBREW = /[֐-׿]/;

/**
 * A product's name, which is a name and not a word, so it is not translated.
 *
 * The owner named every piece in Latin letters — "milo", "Elba", "tano trio" —
 * and asked for those names on the Hebrew site too, spelled and capitalised
 * exactly as typed. They had been transliterated into Hebrew for a few days
 * (מילו, אלבה), with the originals kept in `name_en`.
 *
 * On the Hebrew site, in order:
 *   1. `name` when it has no Hebrew in it: that is the owner's own spelling,
 *      and an edit to it in the admin shows up straight away.
 *   2. `name_en` when `name` is a Hebrew transliteration: the original, which
 *      the transliteration moved there.
 *   3. `name` as it stands, for a piece only ever named in Hebrew. A Hebrew
 *      name is better than no name.
 *
 * The English site is unchanged: its own field first, then the name.
 */
export function productName(
  lang: Language,
  name: string,
  en?: string | null,
): string {
  const english = en?.trim();
  if (lang !== "he") return english || name;
  if (!HEBREW.test(name)) return name;
  return english || name;
}
