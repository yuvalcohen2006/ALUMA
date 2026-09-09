import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DBProduct } from "@/hooks/useCollectionsData";

/**
 * The three pieces on the home page, chosen rather than stumbled into.
 *
 * What this replaces was not a selection at all. The strip took the first six
 * published products ordered by `sort_order` — but sort_order is only ever
 * written as an index WITHIN a collection, so across the whole catalogue it is
 * mostly ties, and Postgres is free to break a tie differently on every query.
 * Two visitors could see two different home pages. Worse, a new product is
 * saved with sort_order 0, so anything just added jumped straight to the front
 * of the home page whether or not it was ready to be the face of the business.
 *
 * The fallback is deliberate and it is deterministic. On a live site with
 * nothing picked yet, hiding the section would be a worse regression than
 * showing something — so it shows the first three by (sort_order, id), where
 * the id breaks the tie the same way every time.
 */
export function useHomeHighlights(products: DBProduct[]) {
  const [picked, setPicked] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("site_home_highlights")
        .select("product_id, slot")
        .order("slot");
      if (cancelled) return;
      setPicked(((data as { product_id: string }[]) ?? []).map((r) => r.product_id));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Still loading: nothing, rather than a flash of the fallback that then
  // reshuffles into the real choice.
  if (picked === null) return { highlights: [] as DBProduct[], loading: true };

  const byId = new Map(products.map((p) => [p.id, p]));
  const chosen = picked.map((id) => byId.get(id)).filter((p): p is DBProduct => Boolean(p));

  if (chosen.length > 0) return { highlights: chosen, loading: false };

  // (sort_order, id), as the note above says — the sort_order half had been
  // dropped, so the owner's arrangement counted for nothing and the three
  // faces of the business were decided by an alphabetical race between UUIDs.
  // The id is still there to break the ties, which are most of them.
  const fallback = [...products]
    .sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id))
    .slice(0, 3);
  return { highlights: fallback, loading: false };
}
