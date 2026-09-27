import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

type Row = {
  slug: string;
  title: string;
  location: string | null;
  category: string | null;
  description: string | null;
  meta_description: string | null;
  cover_url: string | null;
  gallery: unknown;
};

const db = vi.hoisted(() => ({ rows: [] as Row[] }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({ order: async () => ({ data: db.rows, error: null }) }),
      }),
    }),
  },
}));

vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

const Projects = (await import("./Projects")).default;

const mount = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    </HelmetProvider>,
  );

const row = (n: number): Row => ({
  slug: `project-${n}`,
  title: `פרויקט ${n}`,
  location: "יציץ",
  category: null,
  description: null,
  meta_description: null,
  cover_url: `https://example.com/${n}.jpg`,
  gallery: [],
});

/**
 * The projects page is a grid of tiles, the same as Collections. It used to
 * be zig-zag bands with a numeral each and a faded last photograph, and it
 * stopped at three projects.
 */
describe("the projects page", () => {
  beforeEach(() => {
    db.rows = [];
  });

  it("opens on the title alone, like Collections", () => {
    mount();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("פרויקטים");
    expect(document.body.textContent).not.toContain("מבחר עבודות שתכננו");
  });

  it("shows every published project, not just the first three", async () => {
    db.rows = [1, 2, 3, 4, 5].map(row);
    mount();
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 2 }).length).toBeGreaterThan(5));
    for (const n of [1, 2, 3, 4, 5]) {
      const link = screen.getByRole("link", { name: new RegExp(`פרויקט ${n}`) });
      expect(link.getAttribute("href")).toBe(`/projects/project-${n}`);
    }
  });

  it("lays them out as tiles in one grid, with no numerals and no fade", async () => {
    db.rows = [1, 2, 3].map(row);
    const { container } = mount();
    await waitFor(() => expect(container.querySelectorAll(".tile-grid > li")).toHaveLength(3));
    expect(container.querySelector(".tile-fade-b")).toBeNull();
    expect(container.textContent).not.toMatch(/\b0[1-3]\b/);
    expect(container.textContent).not.toContain("לצפייה בפרויקט");
  });

  it("closes on the invitation with no paragraph under it, and the site's button", () => {
    const { container } = mount();
    expect(container.textContent).not.toContain("כל פרויקט כאן התחיל בשיחה אחת");
    const cta = screen.getByRole("link", { name: /לתיאום שיחה/ });
    expect(cta.className).toContain("btn-shine");
  });

  it("keeps each project reachable by its #slug", async () => {
    db.rows = [1, 2].map(row);
    const { container } = mount();
    await waitFor(() => expect(container.querySelector("#project-2")).toBeTruthy());
  });
});
