import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DBCollection = {
  id: string;
  slug: string;
  name_he: string;
  name_en: string | null;
  intro: string | null;
  image_url: string | null;
  sort_order: number;
};

export type DBProduct = {
  id: string;
  collection_id: string;
  slug: string;
  name: string;
  tag: string | null;
  tagline: string | null;
  description: string[];
  highlights: { title: string; desc: string }[];
  materials: string[];
  dimensions: string | null;
  cover_url: string | null;
  gallery: string[];
  /** Optional — most pieces are made to order and carry no price. */
  price: number | null;
  price_note: string | null;
};

/**
 * A product row as the pages expect it.
 *
 * The four list columns are JSON, and a row can come back with any of them
 * null — from a hand-edited row, or one saved before the column existed. The
 * product page calls `.length` on all four, so a null there is a white screen
 * on a real product. Anything that is not already an array becomes an empty
 * one; a bare string is NOT a one-item list, or every `.map` over it would
 * spread it into characters.
 */
export const normaliseProduct = (p: any): DBProduct => ({
  ...p,
  description: Array.isArray(p?.description) ? p.description : [],
  highlights: Array.isArray(p?.highlights) ? p.highlights : [],
  materials: Array.isArray(p?.materials) ? p.materials : [],
  gallery: Array.isArray(p?.gallery) ? p.gallery : [],
});

export function useCollections() {
  const [collections, setCollections] = useState<DBCollection[]>([]);
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: cols }, { data: prods }] = await Promise.all([
        supabase
          .from("site_collections")
          .select("id, slug, name_he, name_en, intro, image_url, sort_order")
          .eq("published", true)
          .order("sort_order"),
        supabase
          .from("site_collection_products")
          .select(
            "id, collection_id, slug, name, tag, tagline, description, highlights, materials, dimensions, cover_url, gallery, price, price_note"
          )
          .eq("published", true)
          .order("sort_order"),
      ]);
      const loadedCollections = (cols as DBCollection[]) || [];
      const loadedProducts = ((prods as any[]) || []).map(normaliseProduct);

      // Real data ALWAYS wins when it exists. The placeholder catalogue only
      // fills an empty page, so there is nothing to judge a layout against.
      //
      // Two earlier versions of this were both wrong. The original discarded
      // live data in dev unless `?live=1` was in the URL, so uploading real
      // products still showed the fake ones. The fix over-corrected to
      // opt-in-only, which meant an empty database rendered an empty catalogue
      // and the page looked broken.
      //
      // Falling back on zero rows gets both: upload one real product and the
      // placeholders vanish on their own. `VITE_USE_DEMO_DATA=0` forces them
      // off if you specifically want to see the empty state.
      const demoAllowed = import.meta.env.VITE_USE_DEMO_DATA !== "0";
      if (demoAllowed && loadedProducts.length === 0) {
        const { demoCollections, demoProducts } = await import("@/data/demoCollections");
        setCollections(demoCollections);
        setProducts(demoProducts);
        setLoading(false);
        return;
      }

      setCollections(loadedCollections);
      setProducts(loadedProducts);
      setLoading(false);
    })();
  }, []);

  return { collections, products, loading };
}
