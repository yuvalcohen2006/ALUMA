/** A colour as the form holds it. No `id` means it has never been saved. */
export type DraftVariant = {
  id?: string;
  name: string;
  swatch: string;
  image_url: string | null;
};

export type VariantPlan = {
  inserts: (DraftVariant & { product_id: string; sort_order: number })[];
  updates: (DraftVariant & { id: string; sort_order: number })[];
  deletes: string[];
};

/**
 * What to write so the saved colours match what is on screen.
 *
 * Colours used to be written to the database the moment you clicked "add",
 * which meant a product had to exist before it could have any — hence the
 * "save the product first" message, and a two-step flow for what a person
 * thinks of as one job. Editing them in the form and computing the difference
 * at save time removes that step entirely, and a product created and abandoned
 * leaves nothing behind.
 *
 * Order is taken from the array, not from whatever the rows held before, so
 * dragging a colour up actually moves it on the site.
 */
export function planVariantSync(
  original: (DraftVariant & { id: string })[],
  drafts: DraftVariant[],
  productId = "",
): VariantPlan {
  const before = new Map(original.map((o) => [o.id, o]));
  const unchanged = (d: DraftVariant, sort_order: number) => {
    const o = d.id ? before.get(d.id) : undefined;
    return (
      !!o &&
      o.name === d.name &&
      o.swatch === d.swatch &&
      o.image_url === d.image_url &&
      original.indexOf(o) === sort_order
    );
  };
  // A colour with no name is a row the owner started and left blank; saving it
  // would put an unlabelled dot on the product page.
  const kept = drafts.filter((d) => d.name.trim());

  const inserts: VariantPlan["inserts"] = [];
  const updates: VariantPlan["updates"] = [];

  kept.forEach((d, sort_order) => {
    // An untouched row in an unchanged position needs no write at all.
    if (d.id && unchanged(d, sort_order)) return;
    if (d.id) updates.push({ ...d, id: d.id, sort_order });
    else inserts.push({ ...d, product_id: productId, sort_order });
  });

  const stillHere = new Set(kept.map((d) => d.id).filter(Boolean));
  const deletes = original.map((o) => o.id).filter((id) => !stillHere.has(id));

  return { inserts, updates, deletes };
}
