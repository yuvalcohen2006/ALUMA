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
