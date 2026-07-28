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
};

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
            "id, collection_id, slug, name, tag, tagline, description, highlights, materials, dimensions, cover_url, gallery"
          )
          .eq("published", true)
          .order("sort_order"),
      ]);
      const loadedCollections = (cols as DBCollection[]) || [];
      const loadedProducts = ((prods as any[]) || []).map((p) => ({
        ...p,
        description: Array.isArray(p.description) ? p.description : [],
        highlights: Array.isArray(p.highlights) ? p.highlights : [],
        materials: Array.isArray(p.materials) ? p.materials : [],
        gallery: Array.isArray(p.gallery) ? p.gallery : [],
      })) as DBProduct[];

      // While the site is being designed, development runs on the placeholder
      // catalogue — 20 products across 5 categories — rather than whatever few
      // rows happen to be in the database. There is no point judging a grid,
      // a carousel or a filter against two records.
      //
      // Production is never affected. Add `?live=1` to see the real database
      // contents in development when reconnecting the CMS.
      const wantsLive =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).has("live");

      if (import.meta.env.DEV && !wantsLive) {
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
