import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BUILT_IN_MATERIALS, PHOTOS } from "@/data/materials";
import type { Language } from "@/i18n";

/**
 * A material, in the one shape every screen uses.
 *
 * The materials page, the home strip, the "worth knowing" page and the
 * materials box on a product all render from this, so a material added in the
 * admin appears in all four with nothing else to do.
 */
export type Material = {
  /** The row id, or the slug for one of the built-in four. */
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  tagline: string | null;
  tagline_en: string | null;
  /** The explanation, one entry per paragraph. */
  body: string[];
  /** Large, for the materials page. Empty when nobody has uploaded one. */
  image: string;
  /** Square, for the home strip and the product's materials box. */
  thumb: string;
};

type MaterialRow = {
  id: string;
  slug: string;
  name: string;
  name_en?: string | null;
  tagline?: string | null;
  body?: string | null;
  image_url?: string | null;
};

/** A blank line starts a new paragraph — how the admin's box is explained. */
export const paragraphs = (body: string | null | undefined): string[] =>
  (body ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export const materialFromRow = (row: MaterialRow): Material => {
  // The seeded four carry no image_url: their photograph ships with the code
  // until somebody uploads a replacement, and then the upload wins.
  const bundled = PHOTOS[row.slug];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    name_en: row.name_en?.trim() || null,
    tagline: row.tagline?.trim() || null,
    tagline_en: null,
    body: paragraphs(row.body),
    image: row.image_url || bundled?.image || "",
    thumb: row.image_url || bundled?.thumb || "",
  };
};

const FALLBACK: Material[] = BUILT_IN_MATERIALS.map((m) => ({
  id: m.slug,
  slug: m.slug,
  name: m.name,
  name_en: m.name_en,
  tagline: m.tagline,
  tagline_en: m.tagline_en,
  body: m.body,
  image: PHOTOS[m.slug]?.image ?? "",
  thumb: PHOTOS[m.slug]?.thumb ?? "",
}));

const MATERIALS_KEY = ["materials"] as const;

async function fetchMaterials(): Promise<Material[]> {
  // `select("*")`, for the reason spelled out at length in useCollectionsData:
  // a column list is a hard dependency on a migration having run, and
  // PostgREST rejects the whole query for one unknown name.
  const { data, error } = await supabase
    .from("site_materials")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data as MaterialRow[]) ?? []).map(materialFromRow);
}

/**
 * The materials, from the database, falling back to the four in code.
 *
 * The fallback is not a nicety: the code deploys before the SQL does, so
 * between those two moments this table does not exist. An empty table means
 * the same thing — nobody has added a material yet — and in both cases four
 * real materials beat an empty page.
 */
export function useMaterials() {
  const { data, isPending, isError } = useQuery({
    queryKey: MATERIALS_KEY,
    queryFn: fetchMaterials,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const materials = data && data.length > 0 ? data : FALLBACK;
  return { materials, loading: isPending, usingFallback: !data || data.length === 0, error: isError };
}

/** The name to print, in the language being read. */
export const materialName = (m: Material, lang: Language) =>
  lang === "he" ? m.name : m.name_en || m.name;

/** The one line under the name, in the language being read. */
export const materialTagline = (m: Material, lang: Language) =>
  lang === "he" ? m.tagline : m.tagline_en || m.tagline;

export { FALLBACK as BUILT_IN_MATERIAL_VIEWS };
