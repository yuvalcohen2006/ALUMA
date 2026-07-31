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

      // Live data is the default, everywhere. The placeholder catalogue (20
      // products across 5 categories) is opt-in via VITE_USE_DEMO_DATA=1, for
      // judging a grid or a filter against more than the two rows that happen
      // to be in the database.
      //
      // This used to be inverted — dev discarded live data unless `?live=1` was
      // in the URL — which meant uploading real products and still seeing the
      // fake ones, with nothing to explain why.
      if (import.meta.env.VITE_USE_DEMO_DATA === "1") {
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
