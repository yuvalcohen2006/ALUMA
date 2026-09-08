import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import i18n from "@/i18n";

const COLLECTIONS = [
  { id: "c1", slug: "kysavt", name_he: "כיסאות", name_en: null, intro: null,
    image_url: "https://example.test/chairs.avif", sort_order: 0 },
  { id: "c2", slug: "slvny-chvtz", name_he: "סלוני חוץ", name_en: null, intro: null,
    image_url: null, sort_order: 1 },
];
const PRODUCTS = [
  { id: "p1", collection_id: "c1", slug: "aria", name: "אריה", cover_url: "x" },
];

vi.mock("@/hooks/useCollectionsData", async () => {
  const actual = await vi.importActual<typeof import("@/hooks/useCollectionsData")>(
    "@/hooks/useCollectionsData");
  return { ...actual, useCollections: () => ({
    collections: COLLECTIONS,
    products: PRODUCTS.map((p) => ({ ...p, description: [], highlights: [], materials: [],
      gallery: [], tag: null, tagline: null, dimensions: null, price: null, price_note: null })),
    loading: false }) };
});
vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

const Collections = (await import("./pages/Collections")).default;

const renderAt = (path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Collections />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe("probe", () => {
  it("A: what is the h1 on /en", async () => {
    await i18n.changeLanguage("en");
    renderAt("/en/collections");
    await waitFor(() => expect(screen.getByRole("heading", { level: 1 })).toBeTruthy());
    const h1 = screen.getByRole("heading", { level: 1 });
    console.log("EN H1 >>>", JSON.stringify(h1.textContent));
    const metas = [...document.querySelectorAll("p")].map((p) => p.textContent);
    console.log("EN metas >>>", JSON.stringify(metas));
    const links = [...document.querySelectorAll("a")].map((a) => [a.getAttribute("href"), a.textContent]);
    console.log("EN links >>>", JSON.stringify(links));
    await i18n.changeLanguage("he");
  });

  it("B: malformed hash", async () => {
    let err: unknown = null;
    try {
      renderAt("/collections#%");
      await waitFor(() => expect(screen.getByRole("heading", { level: 1 })).toBeTruthy());
    } catch (e) { err = e; }
    console.log("HASH ERROR >>>", err instanceof Error ? err.name + ": " + err.message : String(err));
  });
});
