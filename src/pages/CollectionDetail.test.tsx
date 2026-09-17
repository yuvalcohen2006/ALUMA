import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * A product page: the name over the photograph, then three boxes that match.
 */
const db = vi.hoisted(() => ({
  product: null as Record<string, unknown> | null,
  materials: [] as unknown[],
}));

vi.mock("@/integrations/supabase/client", () => {
  const table = (name: string) => {
    const chain: Record<string, unknown> = {};
    for (const k of ["select", "eq", "neq", "in", "order", "limit"]) chain[k] = () => chain;
    chain.then = (res: (v: unknown) => unknown) =>
      Promise.resolve({
        data: name === "site_materials" ? db.materials : [],
        error: null,
      }).then(res);
    chain.maybeSingle = async () => ({
      data:
        name === "site_collection_products"
          ? db.product
          : name === "site_collections"
            ? { id: "c1" }
            : null,
      error: null,
    });
    return chain;
  };
  return { supabase: { from: (name: string) => table(name) } };
});

vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

const CollectionDetail = (await import("./CollectionDetail")).default;

const mount = () =>
  render(
    <HelmetProvider>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        {/* Routed, not just mounted: the page reads its slug from the URL. */}
        <MemoryRouter initialEntries={["/products/dex"]}>
          <Routes>
            <Route path="/products/:slug" element={<CollectionDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );

const MATERIALS = [
  { id: "m1", slug: "sunbrella", name: "בד Sunbrella", tagline: "נוחות שלא נכנעת לשמש", body: "כך.", image_url: "s.jpg" },
  { id: "m2", slug: "polystone", name: "PolyStone", tagline: null, body: "כך.", image_url: "p.jpg" },
];

const product = (over: Record<string, unknown> = {}) => ({
  id: "p1",
  collection_id: "c1",
  slug: "dex",
  name: "dex",
  name_en: "dex",
  tagline: "שולחן אש",
  description: ["פסקה על המוצר."],
  highlights: [],
  materials: [],
  material_ids: ["m2", "m1"],
  sizes: [
    { label: "אורך", value: "240 ס״מ" },
    { label: "עומק", value: "92 ס״מ" },
  ],
  dimensions: null,
  cover_url: "dex.jpg",
  gallery: [],
  price: null,
  price_note: null,
  stock: null,
  published: true,
  sort_order: 0,
  ...over,
});

beforeEach(() => {
  db.product = product();
  db.materials = MATERIALS;
});

describe("the product page", () => {
  it("puts the name above the photograph, set from the left", async () => {
    const { container } = mount();
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("dex");
    // The lockup is marked LTR, so a Latin name sits at the left in Hebrew too.
    expect(heading.closest("[dir='ltr']")).toBeTruthy();
    // And it comes before the photographs in its own column.
    const column = heading.closest("div")!.parentElement!;
    const img = column.querySelector("img");
    expect(img).toBeTruthy();
    expect(heading.compareDocumentPosition(img!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelectorAll("h1").length).toBe(1);
  });

  it("lists the sizes one to a row, label and value", async () => {
    mount();
    const box = (await screen.findByText("מידות")).closest("div")!.parentElement!;
    const rows = box.querySelectorAll("dt");
    expect([...rows].map((r) => r.textContent)).toEqual(["אורך", "עומק"]);
    expect([...box.querySelectorAll("dd")].map((r) => r.textContent)).toEqual(["240 ס״מ", "92 ס״מ"]);
  });

  it("falls back to the old single dimensions line when that is all there is", async () => {
    db.product = product({ sizes: [], dimensions: "אורך 240 ס״מ" });
    mount();
    const box = (await screen.findByText("מידות")).closest("div")!.parentElement!;
    expect(box.querySelectorAll("dd")[0].textContent).toBe("אורך 240 ס״מ");
  });

  it("lists the materials it is made of, in the order they were ticked", async () => {
    mount();
    const box = (await screen.findByText("חומרים")).closest("div")!.parentElement!;
    const links = within(box).getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/materials#polystone",
      "/materials#sunbrella",
    ]);
    expect(links[0].textContent).toContain("PolyStone");
  });

  it("drops a material that has since been deleted rather than leaving a gap", async () => {
    db.product = product({ material_ids: ["m1", "gone"] });
    mount();
    const box = (await screen.findByText("חומרים")).closest("div")!.parentElement!;
    expect(within(box).getAllByRole("link")).toHaveLength(1);
  });

  it("shows no box at all for a piece with no sizes and no materials", async () => {
    db.product = product({ sizes: [], material_ids: [], dimensions: null });
    mount();
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByText("מידות")).toBeNull();
    expect(screen.queryByText("חומרים")).toBeNull();
  });

  /** The client's words: the sizes and materials boxes look like the about box. */
  it("gives all three boxes the same frame", async () => {
    mount();
    await screen.findByText("על המוצר");
    const frames = ["על המוצר", "מידות", "חומרים"].map(
      (title) => screen.getByText(title).closest("div")!.className,
    );
    expect(new Set(frames).size).toBe(1);
    expect(frames[0]).toContain("border-border");
  });
});
