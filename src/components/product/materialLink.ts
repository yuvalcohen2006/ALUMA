import { materials } from "@/data/materials";

/**
 * Product materials arrive from the CMS as free strings ("אלומיניום", "בד
 * Sunbrella", "חבל ימי"), while the materials library is keyed by slug. This
 * resolves one to the other so a material chip on a product page can open the
 * material's own page — and, crucially, returns null for anything it does not
 * recognise so an unknown string renders as plain ink instead of a link to a
 * 404.
 *
 * The canonical names come from the data itself, so adding a material to
 * src/data/materials.ts wires its chips up with no change here. ALIASES only
 * covers the shorthands editors actually type in the CMS.
 */

/** Shorthand → slug. Keys are matched case-insensitively after trimming. */
const ALIASES: Record<string, string> = {
  sunbrella: "sunbrella",
  "בד sunbrella": "sunbrella",
  גרניט: "granite-porcelain",
  "שיש גרניט": "granite-porcelain",
  "גרניט פורצלן": "granite-porcelain",
  polystone: "polystone",
  "פוליסטון": "polystone",
  "אלומיניום בציפוי אבקה": "aluminum",
};

const norm = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const lookup = (() => {
  const known = new Set(materials.map((m) => m.slug));
  const map = new Map<string, string>();
  for (const m of materials) map.set(norm(m.name), m.slug);
  // An alias may not outlive its material: if the library ever drops one, the
  // alias stops resolving too rather than pointing at a page that is gone.
  for (const [alias, slug] of Object.entries(ALIASES)) {
    if (known.has(slug)) map.set(norm(alias), slug);
  }
  return map;
})();

/** The material page slug for a free-string material name, or null. */
export const materialSlug = (name: string): string | null =>
  lookup.get(norm(name)) ?? null;
