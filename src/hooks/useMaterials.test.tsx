import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/**
 * Materials come from the database, and the four in code are what the site
 * shows until they do.
 *
 * That fallback is the whole reason this hook exists rather than a query at
 * each call site: the code deploys before the SQL does, so there is always a
 * window where site_materials is not there at all, and /materials, the home
 * strip and the "worth knowing" page must not go blank in it.
 */
const query = vi.hoisted(() => ({ rows: [] as unknown[], error: null as unknown }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: async () => ({ data: query.rows, error: query.error }),
        }),
      }),
    }),
  },
}));

const { useMaterials, paragraphs, materialName } = await import("./useMaterials");

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

const row = (over: Record<string, unknown> = {}) => ({
  id: "row-1",
  slug: "teak",
  name: "עץ טיק",
  name_en: "Teak",
  tagline: "מזדקן לאפור כסוף",
  body: "פסקה ראשונה.\n\nפסקה שנייה.",
  image_url: "https://example.com/teak.jpg",
  ...over,
});

beforeEach(() => {
  query.rows = [];
  query.error = null;
});

describe("useMaterials", () => {
  it("shows the four built into the site while the table is empty", async () => {
    const { result } = renderHook(() => useMaterials(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.materials.map((m) => m.slug)).toEqual([
      "sunbrella",
      "aluminum",
      "granite-porcelain",
      "polystone",
    ]);
    expect(result.current.usingFallback).toBe(true);
    // And with their photographs, which ship in the bundle.
    expect(result.current.materials.every((m) => m.image && m.thumb)).toBe(true);
  });

  it("falls back the same way when the table is not there yet", async () => {
    query.error = { message: 'relation "site_materials" does not exist' };
    const { result } = renderHook(() => useMaterials(), { wrapper });
    await waitFor(() => expect(result.current.materials.length).toBe(4));
    expect(result.current.materials[0].slug).toBe("sunbrella");
  });

  it("prefers what the owner added", async () => {
    query.rows = [row()];
    const { result } = renderHook(() => useMaterials(), { wrapper });
    await waitFor(() => expect(result.current.usingFallback).toBe(false));
    expect(result.current.materials.map((m) => m.name)).toEqual(["עץ טיק"]);
    expect(result.current.materials[0].image).toBe("https://example.com/teak.jpg");
  });

  it("keeps the bundled photograph for a seeded row with no upload", async () => {
    query.rows = [row({ slug: "sunbrella", image_url: null })];
    const { result } = renderHook(() => useMaterials(), { wrapper });
    await waitFor(() => expect(result.current.usingFallback).toBe(false));
    const [m] = result.current.materials;
    expect(m.image).toBeTruthy();
    expect(m.thumb).toBeTruthy();
    expect(m.image).not.toBe("");
  });

  it("leaves a material with no photograph without one, rather than borrowing", async () => {
    query.rows = [row({ slug: "brand-new", image_url: null })];
    const { result } = renderHook(() => useMaterials(), { wrapper });
    await waitFor(() => expect(result.current.usingFallback).toBe(false));
    expect(result.current.materials[0].image).toBe("");
  });
});

describe("the explanation", () => {
  it("starts a new paragraph at a blank line, which is what the admin says", () => {
    expect(paragraphs("אחת.\n\nשתיים.\n\n\nשלוש.")).toEqual(["אחת.", "שתיים.", "שלוש."]);
  });

  it("keeps a single line break inside one paragraph", () => {
    expect(paragraphs("שורה\nוהמשכה")).toEqual(["שורה\nוהמשכה"]);
  });

  it("treats an empty explanation as no paragraphs at all", () => {
    expect(paragraphs(null)).toEqual([]);
    expect(paragraphs("   ")).toEqual([]);
  });
});

describe("naming a material", () => {
  const teak = {
    id: "1",
    slug: "teak",
    name: "עץ טיק",
    name_en: "Teak",
    tagline: null,
    tagline_en: null,
    body: [],
    image: "",
    thumb: "",
  };

  it("uses the English name on the English site, and the Hebrew one in Hebrew", () => {
    expect(materialName(teak, "he")).toBe("עץ טיק");
    expect(materialName(teak, "en")).toBe("Teak");
  });

  it("falls back to the Hebrew name rather than to nothing", () => {
    expect(materialName({ ...teak, name_en: null }, "en")).toBe("עץ טיק");
  });
});
