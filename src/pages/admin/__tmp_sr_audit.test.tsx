import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const COLS = [
  { id: "7f3a9c2e-1b4d-4e88-9a01-c5d2e6f70abc", slug: "sofas", name_he: "ספות חוץ",
    name_en: null, intro: null, image_url: null, sort_order: 0, published: true },
  { id: "22222222-2222-4222-8222-222222222222", slug: "chairs", name_he: "כורסאות",
    name_en: null, intro: null, image_url: "http://x/a.jpg", sort_order: 1, published: false },
];

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (t: string) => ({
      select: () => ({ order: async () => ({ data: t === "site_collections" ? COLS : [], error: null }) }),
    }),
  },
}));
vi.mock("./AdminLayout", () => ({ default: ({ children }: any) => <div>{children}</div> }));

const AdminCollections = (await import("./AdminCollections")).default;

describe("screen reader audit", () => {
  it("dumps the accessibility-relevant DOM", async () => {
    render(<MemoryRouter><AdminCollections /></MemoryRouter>);
    const link = await screen.findByRole("link", { name: /ספות חוץ/ });
    const li = link.closest("li")!;
    const ul = li.parentElement!;

    console.log("### UL attrs:", ul.tagName, JSON.stringify(
      Object.fromEntries([...ul.attributes].map(a => [a.name, a.value]))));
    console.log("### explicit role on ul:", ul.getAttribute("role"));

    const handle = li.querySelector("button")!;
    console.log("### DRAG HANDLE attrs:", JSON.stringify(
      Object.fromEntries([...handle.attributes].map(a => [a.name, a.value]))));

    const describedBy = handle.getAttribute("aria-describedby");
    const desc = describedBy ? document.getElementById(describedBy) : null;
    console.log("### aria-describedby target text:", JSON.stringify(desc?.textContent));

    console.log("### secondary <p> text:", JSON.stringify(
      li.querySelector("p")!.textContent));

    console.log("### fallback icon branch svg:", li.querySelector("div > svg")?.outerHTML.slice(0, 140));

    console.log("### live region(s):");
    document.querySelectorAll("[role=status],[aria-live]").forEach(n =>
      console.log("   ", n.getAttribute("role"), n.getAttribute("aria-live"), JSON.stringify(n.textContent)));

    console.log("### full row a11y order:");
    li.querySelectorAll("a,button,img,svg,p").forEach(n =>
      console.log("   ", n.tagName, "|name:", n.getAttribute("aria-label") ?? n.getAttribute("alt") ?? n.textContent?.trim().slice(0,30)));
    expect(true).toBe(true);
  });
});
