import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { defaultAnnouncements } from "@dnd-kit/core";

const COLS = [
  { id: "7f3a9c2e-1b4d-4e88-9a01-c5d2e6f70abc", slug: "sofas", name_he: "ספות חוץ",
    name_en: null, intro: null, image_url: null, sort_order: 0, published: true },
  { id: "22222222-2222-4222-8222-222222222222", slug: "chairs", name_he: "כורסאות",
    name_en: null, intro: null, image_url: null, sort_order: 1, published: false },
];
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: (t: string) => ({
    select: () => ({ order: async () => ({ data: t === "site_collections" ? COLS : [], error: null }) }) }) },
}));
vi.mock("./AdminLayout", () => ({ default: ({ children }: any) => <div>{children}</div> }));
const AdminCollections = (await import("./AdminCollections")).default;

describe("what the live region actually says during a keyboard reorder", () => {
  it("announces", async () => {
    const { container } = render(<MemoryRouter><AdminCollections /></MemoryRouter>);
    await screen.findByRole("link", { name: /ספות חוץ/ });
    const handle = screen.getByRole("button", { name: /שינוי הסדר של ספות חוץ/ });
    handle.focus();
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: " ", code: "Space", bubbles: true }));
    await waitFor(() => {
      const live = container.ownerDocument.querySelector("[aria-live]")!;
      expect(live.textContent).not.toBe("");
    }, { timeout: 2000 });
    const live = container.ownerDocument.querySelector("[aria-live]")!;
    console.log("### LIVE REGION ON PICK UP:", JSON.stringify(live.textContent));
    console.log("### dnd-kit default announcement templates:");
    console.log("   onDragStart:", defaultAnnouncements.onDragStart({ active: { id: COLS[0].id } } as any));
    console.log("   onDragEnd  :", defaultAnnouncements.onDragEnd({ active: { id: COLS[0].id }, over: { id: COLS[1].id } } as any));
  });
});
