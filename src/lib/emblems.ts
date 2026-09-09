import type { Language } from "@/i18n";

/**
 * The single word that can sit under a product's name on a tile.
 *
 * An enum, not the free-text `tag` column that already exists. An emblem whose
 * value is whatever somebody typed cannot be styled, translated, counted or
 * capped, and the whole value of an emblem is that it is rare — which is only
 * enforceable if the set is closed.
 *
 * It IS a pill over the photograph, at the client's explicit request, and this
 * note used to argue at length that it should not be — which is worse than no
 * note at all, because it described the opposite of what ships.
 *
 * The argument is still worth keeping for the shape it forced. At the luxury
 * end the badge is either absent (Minotti, Poliform, Cassina and B&B Italia
 * ship none) or bare text under the name (Net-a-Porter, on the ~33% of tiles
 * it badges), and a translucent pill over a photograph is a contrast fight it
 * cannot win. So the pill is SOLID charcoal — 13.6:1 on any photograph there
 * will ever be — rather than a tint, and at most one or two tiles in a grid
 * carry one at all. That is the discount-retailer failure mode avoided by
 * restraint rather than by absence.
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

/** How recently a piece must have arrived to count as new. */
export const NEW_WINDOW_DAYS = 45;

/**
 * How many pieces may be automatically new at once, however many qualify.
 *
 * This cap is the whole reason the automatic rule works here. Aluma's 47
 * products were loaded in two batches a few days apart, so a plain "newer than
 * 45 days" test marks the ENTIRE catalogue new — every tile badged, which is
 * the same as no tile badged. Taking the most recent handful instead means the
 * emblem stays rare no matter how the catalogue was filled, and it degrades
 * correctly in the other direction too: a shop that adds nothing for a year
 * shows no "new" rather than freezing one on forever.
 */
export const MAX_AUTO_NEW = 5;

type Dated = { id: string; created_at?: string | null; published_at?: string | null; emblem?: string | null };

/**
 * Work out which pieces are new, and let a hand-set emblem win.
 *
 * A person choosing "popular" is making a claim about the piece; "new" is a
 * fact about the calendar. When they collide the person wins — otherwise the
 * owner marks something popular, sees "new" instead, and reasonably concludes
 * the field is broken.
 *
 * published_at is preferred over created_at where it exists: created_at is when
 * the ROW was inserted, which for a bulk import says nothing about when the
 * piece went live. It is read defensively because the column arrives with a
 * migration and the code ships first.
 */
export function resolveEmblems<T extends Dated>(
  products: T[],
  now: Date = new Date(),
): Map<string, Emblem> {
  const out = new Map<string, Emblem>();

  const cutoff = now.getTime() - NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const dateOf = (p: Dated) => {
    const raw = p.published_at ?? p.created_at;
    const t = raw ? Date.parse(raw) : NaN;
    return Number.isNaN(t) ? null : t;
  };

  const fresh = products
    .map((p) => ({ p, t: dateOf(p) }))
    .filter((x): x is { p: T; t: number } => x.t !== null && x.t >= cutoff)
    .sort((a, b) => b.t - a.t)
    .slice(0, MAX_AUTO_NEW);

  for (const { p } of fresh) out.set(p.id, "new");
  // Second, so a hand-set value overwrites the computed one.
  for (const p of products) if (isEmblem(p.emblem)) out.set(p.id, p.emblem);

  return out;
}

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
