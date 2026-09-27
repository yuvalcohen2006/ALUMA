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
  length_cm: 240,
  width_cm: 92,
  height_cm: null,
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
    // It is its own cell on the first row, in the photograph's column, and
    // the photograph follows it on the second.
    const cell = heading.closest("[dir='ltr']")!;
    expect(cell.className).toContain("md:row-start-1");
    const img = container.querySelector("img[alt*='dex']");
    expect(img).toBeTruthy();
    expect(heading.compareDocumentPosition(img!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelectorAll("h1").length).toBe(1);
  });

  /**
   * The owner's request: the top of על המוצר lines up with the top of the
   * photograph, not with the name above it. On a wide screen both start on
   * the grid's second row.
   */
  it("starts the writing on the same row as the photograph", async () => {
    mount();
    await screen.findByText("על המוצר");
    const about = screen.getByText("על המוצר").closest("div")!.parentElement!;
    expect(about.className).toContain("md:row-start-2");
    const photoColumn = document.querySelector("[class*='md:sticky']")!;
    expect(photoColumn.className).toContain("md:row-start-2");
  });

  it("lists each measurement given, with its unit, and leaves out the blanks", async () => {
    mount();
    const box = (await screen.findByText("מידות")).closest("div")!.parentElement!;
    expect([...box.querySelectorAll("dt")].map((r) => r.textContent)).toEqual(["אורך", "רוחב"]);
    expect([...box.querySelectorAll("dd")].map((r) => r.textContent)).toEqual([
      "240 ס״מ",
      "92 ס״מ",
    ]);
  });

  it("falls back to the old single dimensions line when that is all there is", async () => {
    db.product = product({ length_cm: null, width_cm: null, dimensions: "אורך 240 ס״מ" });
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
    db.product = product({ length_cm: null, width_cm: null, material_ids: [], dimensions: null });
    mount();
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByText("מידות")).toBeNull();
    expect(screen.queryByText("חומרים")).toBeNull();
  });

  /**
   * על המוצר and חומרים share one frame. מידות keeps the same padding and
   * place in the column, without the border — the owner's call, so the
   * short list does not read as a third equal panel.
   */
  it("frames the about and materials boxes alike, and leaves the sizes unframed", async () => {
    mount();
    await screen.findByText("על המוצר");
    const box = (title: string) => screen.getByText(title).closest("div")!.className;
    expect(box("על המוצר")).toBe(box("חומרים"));
    expect(box("על המוצר")).toContain("border-border");
    expect(box("מידות")).not.toContain("border-border");
    // Same padding either way, so the sizes sit exactly where a framed box would.
    for (const title of ["על המוצר", "מידות", "חומרים"]) {
      expect(box(title)).toContain("p-6");
      expect(box(title)).toContain("md:p-8");
    }
  });

  it("sets the number to the right of the unit, close to its label", async () => {
    mount();
    const box = (await screen.findByText("מידות")).closest("div")!;
    const row = box.querySelector("dl > div")!;
    // Close together: no justify-between throwing the value to the far edge.
    expect(row.className).not.toContain("justify-between");
    // Not isolated as LTR, so in a right-to-left page the number sits right of ס״מ.
    const value = row.querySelector("dd")!;
    expect(value.querySelector("bdi, [dir='ltr']")).toBeNull();
    expect(value.textContent).toBe("240 ס״מ");
  });

  it("adds the owner's free line under the materials he ticked, as plain text", async () => {
    db.product = product({ materials: ["חבל קלוע ביד"] });
    mount();
    const box = (await screen.findByText("חומרים")).closest("div")!;
    expect(box.textContent).toContain("חבל קלוע ביד");
    // The ticked ones are links; the free line is not.
    const links = within(box).getAllByRole("link").map((l) => l.textContent);
    expect(links.some((t) => t?.includes("חבל קלוע ביד"))).toBe(false);
  });

  it("shows the materials box for the free line alone, with nothing ticked", async () => {
    db.product = product({ material_ids: [], materials: ["חבל קלוע ביד"] });
    mount();
    expect((await screen.findByText("חומרים")).closest("div")!.textContent).toContain("חבל קלוע ביד");
  });
});
