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
  name_en: string | null;
  emblem: string | null;
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
            "id, collection_id, slug, name, name_en, emblem, tag, tagline, description, highlights, materials, dimensions, cover_url, gallery, price, price_note"
          )
          .eq("published", true)
          .order("sort_order"),
      ]);
      const loadedCollections = (cols as DBCollection[]) || [];
      // Only pieces whose collection is also published. The product query asks
      // about the product's own flag and nothing else, so hiding a collection
      // used to leave its furniture on the home page and in search — visible
      // everywhere except the one place the owner had hidden it.
      const publishedCollections = new Set(loadedCollections.map((c) => c.id));
      const loadedProducts = ((prods as any[]) || [])
        .map(normaliseProduct)
        .filter((p) => publishedCollections.has(p.collection_id));

      // No placeholder catalogue any more. It existed so an empty database
      // did not render an empty page, and it earned its keep — but the shop is
      // stocked now, and fake furniture that outlives the real thing is how a
      // customer ends up looking at products nobody sells.
      setCollections(loadedCollections);
      setProducts(loadedProducts);
      setLoading(false);
    })();
  }, []);

  return { collections, products, loading };
}
