import type { Language } from "@/i18n";

/**
 * The single word that can sit under a product's name on a tile.
 *
 * An enum, not the free-text `tag` column that already exists. An emblem whose
 * value is whatever somebody typed cannot be styled, translated, counted or
 * capped, and the whole value of an emblem is that it is rare — which is only
 * enforceable if the set is closed.
 *
 * It is deliberately NOT a pill over the photograph. At the luxury end the
 * badge is either absent entirely (Minotti, Poliform, Cassina and B&B Italia
 * ship none at all; Audo's theme has a six-position badge grid and every slot
 * is empty) or it is bare text under the name, which is what Net-a-Porter does
 * on the ~33% of tiles it badges. A filled pill in a corner is what a discount
 * retailer does, and it also drags in a contrast fight with the photograph
 * underneath it.
 *
 * No uppercase and no letter-spacing. That convention is Latin micro-caps and
 * does not transfer — Hebrew is unicase, so uppercase does nothing and tracking
 * only loosens words that were already hard to read. Net-a-Porter reaches the
 * same conclusion for Arabic in their own stylesheet.
 */
export const EMBLEMS = ["popular", "hot", "new"] as const;

export type Emblem = (typeof EMBLEMS)[number];

const LABELS: Record<Emblem, Record<Language, string>> = {
  popular: { he: "מבוקש", en: "Popular" },
  hot: { he: "חם עכשיו", en: "Hot right now" },
  new: { he: "חדש", en: "New" },
};

export function isEmblem(value: unknown): value is Emblem {
  return typeof value === "string" && (EMBLEMS as readonly string[]).includes(value);
}

export function emblemLabel(emblem: Emblem, lang: Language): string {
  return LABELS[emblem][lang];
}

/** What the owner picks from, in the admin. Hebrew, because the admin is. */
export const EMBLEM_OPTIONS: { value: Emblem; label: string }[] = EMBLEMS.map((value) => ({
  value,
  label: LABELS[value].he,
}));

/**
 * How many tiles in one grid may carry an emblem.
 *
 * Rarity is the entire mechanism. Net-a-Porter badges about a third of a page
 * of hundreds; on a strip of three, two emblems is already two thirds and the
 * word stops meaning anything. The cap is applied when rendering rather than
 * when saving, so the owner can mark whatever they like and the page still
 * refuses to shout.
 */
export const MAX_EMBLEMS_PER_GRID = 1;

/**
 * Blank out every emblem past the cap, keeping the earliest in document order.
 *
 * Returns a parallel array rather than filtering, so callers keep their indices.
 */
export function capEmblems<T>(
  items: T[],
  emblemOf: (item: T) => string | null | undefined,
  max = MAX_EMBLEMS_PER_GRID,
): (Emblem | null)[] {
  let used = 0;
  return items.map((item) => {
    const value = emblemOf(item);
    if (!isEmblem(value) || used >= max) return null;
    used += 1;
    return value;
  });
}
