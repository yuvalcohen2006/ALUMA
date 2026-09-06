import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

/** Two collections with transliterated Hebrew slugs, as the admin writes them. */
const COLLECTIONS = [
  {
    id: "c1",
    slug: "kysavt",
    name_he: "כיסאות",
    name_en: null,
    intro: null,
    image_url: "https://example.test/chairs.avif",
    sort_order: 0,
  },
  {
    id: "c2",
    slug: "slvny-chvtz",
    name_he: "סלוני חוץ",
    name_en: null,
    intro: null,
    image_url: null,
    sort_order: 1,
  },
];

const PRODUCTS = [
  { id: "p1", collection_id: "c1", slug: "aria", name: "אריה", cover_url: "https://example.test/a.png" },
  { id: "p2", collection_id: "c1", slug: "bela", name: "בלה", cover_url: "https://example.test/b.png" },
  { id: "p3", collection_id: "c2", slug: "cira", name: "סירה", cover_url: "https://example.test/c.png" },
];

vi.mock("@/hooks/useCollectionsData", async () => {
  const actual = await vi.importActual<typeof import("@/hooks/useCollectionsData")>(
    "@/hooks/useCollectionsData",
  );
  return {
    ...actual,
    useCollections: () => ({
      collections: COLLECTIONS,
      products: PRODUCTS.map((p) => ({
        ...p,
        description: [],
        highlights: [],
        materials: [],
        gallery: [],
        tag: null,
        tagline: null,
        dimensions: null,
        price: null,
        price_note: null,
      })),
      loading: false,
    }),
  };
});

vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

const Collections = (await import("./Collections")).default;

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <Collections />
      </MemoryRouter>
    </HelmetProvider>,
  );

/**
 * The categories grid was eight hand-written tiles. Two linked to slugs that
 * did not exist ("salons", "fire-tables") and six linked back to the page you
 * were already on — so every tile on the collections screen was a 404 or a
 * no-op. Nothing revealed it until real collections existed, because with an
 * empty database the fake tiles were the only thing on the page.
 */
describe("the collections screen", () => {
  it("shows every collection that exists", async () => {
    renderPage();
    expect(await screen.findByText("כיסאות")).toBeTruthy();
    expect(screen.getByText("סלוני חוץ")).toBeTruthy();
  });

  it("links only to slugs that actually exist", async () => {
    const { container } = renderPage();
    await waitFor(() => expect(screen.getByText("כיסאות")).toBeTruthy());

    const real = new Set(COLLECTIONS.map((c) => c.slug));
    const dead = [...container.querySelectorAll('a[href*="/collections/"]')]
      .map((a) => a.getAttribute("href")!.split("/collections/")[1])
      .filter((slug) => slug && !real.has(slug));

    expect(dead).toEqual([]);
  });

  it("has no link that goes back to the page it is on", async () => {
    const { container } = renderPage();
    await waitFor(() => expect(screen.getByText("כיסאות")).toBeTruthy());
    const selfLinks = [...container.querySelectorAll("a")]
      .map((a) => a.getAttribute("href"))
      .filter((h) => h === "/collections");
    expect(selfLinks).toEqual([]);
  });

  it("gives every collection somewhere to click", async () => {
    const { container } = renderPage();
    await waitFor(() => expect(screen.getByText("כיסאות")).toBeTruthy());
    for (const c of COLLECTIONS) {
      expect(
        container.querySelector(`a[href="/collections/${c.slug}"]`),
        `no link for ${c.slug}`,
      ).toBeTruthy();
    }
  });

  it("says how many pieces each collection holds", async () => {
    renderPage();
    // Hebrew spells small numbers as words, and has a distinct form for two.
    // Chairs holds two, lounges holds one.
    expect(await screen.findByText("שני פריטים")).toBeTruthy();
    expect(screen.getByText("פריט אחד")).toBeTruthy();
  });
});
