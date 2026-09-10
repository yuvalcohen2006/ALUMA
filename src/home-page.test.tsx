import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * The home page, checked against what the client actually asked for.
 *
 * The smoke test next door answers "does it mount". This answers "is it
 * right" — and every assertion here is something that has already been wrong
 * once: the paragraph rendered four lines, the flame rendered fourteen pixels
 * wide, the plate was invisible against the band.
 */

const COLLECTIONS = [
  { id: "c1", slug: "lounges", name_he: "סלוני חוץ", name_en: "Lounges", intro: "", image_url: "a.jpg", sort_order: 0 },
  { id: "c2", slug: "dining", name_he: "פינות אוכל", name_en: "Dining", intro: "", image_url: "b.jpg", sort_order: 1 },
  { id: "c3", slug: "fire", name_he: "שולחנות אש", name_en: "Fire", intro: "", image_url: "c.jpg", sort_order: 2 },
];

const product = (id: string, name: string, stock: number | null) => ({
  id,
  collection_id: "c1",
  slug: id,
  name,
  name_en: name,
  emblem: null,
  tag: null,
  tagline: "",
  description: [],
  highlights: [],
  materials: [],
  dimensions: null,
  cover_url: id + ".jpg",
  gallery: [],
  price: null,
  price_note: null,
  stock,
  sort_order: 0,
  published: true,
  created_at: "2026-09-01T00:00:00Z",
  published_at: "2026-09-01T00:00:00Z",
});

const PRODUCTS = [product("p1", "מילו", 2), product("p2", "אריה", 40), product("p3", "קול", null)];

vi.mock("@/integrations/supabase/client", () => {
  const table = (rows: unknown[]) => {
    const chain: Record<string, unknown> = {};
    for (const k of ["select", "eq", "neq", "in", "gte", "not", "order", "limit"]) chain[k] = () => chain;
    chain.then = (res: (v: unknown) => unknown) => Promise.resolve({ data: rows, error: null }).then(res);
    chain.maybeSingle = async () => ({ data: null, error: null });
    chain.single = async () => ({ data: null, error: null });
    return chain;
  };
  return {
    supabase: {
      from: (name: string) => {
        if (name === "site_collections") return table(COLLECTIONS);
        if (name === "site_collection_products") return table(PRODUCTS);
        if (name === "site_home_highlights") return table(PRODUCTS.map((p, i) => ({ product_id: p.id, slot: i + 1 })));
        return table([]);
      },
      functions: { invoke: async () => ({ data: { ok: true }, error: null }) },
      auth: {
        getSession: async () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      },
    },
  };
});

const Index = (await import("./pages/Index")).default;

const mount = () =>
  render(
    <HelmetProvider>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={["/"]}>
          <Index />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );

describe("the home page", () => {
  it("puts the opening paragraph on three lines, not four", async () => {
    const { container } = mount();
    const lead = await screen.findByText(/אלומה נולדה מתוך חיבור/);
    const paragraph = lead.parentElement?.querySelector("p");
    expect(paragraph, "the statement paragraph").toBeTruthy();
    expect(paragraph!.querySelectorAll("span.block")).toHaveLength(3);
    expect(container).toBeTruthy();
  });

  it("keeps the opening sentence on one line", async () => {
    mount();
    const lead = await screen.findByText(/אלומה נולדה מתוך חיבור/);
    expect(lead.className).toContain("whitespace-nowrap");
  });

  it("gives the flame a box it actually fills", async () => {
    const { container } = mount();
    // Wait for the COLLECTIONS section, not for any svg — the hero's scroll
    // chevron satisfies `querySelector("svg")` long before the catalogue has
    // loaded, which is how this test first passed its wait and then found
    // nothing.
    await screen.findByText("סלוני חוץ");
    // Queried by reading the attribute rather than by selector: a CSS
    // attribute selector is lower-cased in an HTML document, so
    // `[viewBox="..."]` silently matches nothing on an SVG element.
    const flame = [...container.querySelectorAll("svg")].find(
      (el) => el.getAttribute("viewBox") === "0 0 64 100",
    );
    expect(flame, "the flame").toBeTruthy();
    // Two subpaths and evenodd, or the inner flame is not a hole and the mark
    // reads as a solid blob at small sizes.
    const path = flame!.querySelector("path")!;
    expect(path.getAttribute("fill-rule")).toBe("evenodd");
    expect((path.getAttribute("d") ?? "").match(/Z/g)).toHaveLength(2);
    // Sized by height with the width free, or it renders squashed into a square.
    expect(flame!.getAttribute("class")).toContain("w-auto");
    // And it carries the gradient rather than the source's flat pink.
    expect(container.innerHTML).toContain("#B85A31");
    expect(container.innerHTML).not.toContain("#e15b64");
  });

  it("floats the motes without putting them in the accessibility tree", async () => {
    const { container } = mount();
    await waitFor(() => expect(container.querySelectorAll(".mote").length).toBeGreaterThan(0));
    const field = container.querySelector(".mote")!.parentElement!;
    expect(field.getAttribute("aria-hidden")).toBe("true");
    expect(field.className).toContain("pointer-events-none");
  });

  it("says how many are left only for the piece that is actually low", async () => {
    mount();
    // p1 has 2 left; p2 has 40; p3 is not counted at all.
    await waitFor(() => expect(screen.getByText(/נותרו 2 במלאי/)).toBeTruthy());
    expect(screen.queryByText(/נותרו 40/)).toBeNull();
    expect(screen.queryAllByText(/נותרו/)).toHaveLength(1);
  });

  it("puts the collection name on a plate over the photograph", async () => {
    const { container } = mount();
    await waitFor(() => expect(screen.getByText("סלוני חוץ")).toBeTruthy());
    const plate = screen.getByText("סלוני חוץ").closest("div");
    expect(plate!.className).toContain("bg-background");
    expect(plate!.className).toContain("absolute");
    expect(container.querySelectorAll(".tile-soften").length).toBeGreaterThan(0);
  });
});
