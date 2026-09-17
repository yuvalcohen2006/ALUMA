import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * One page, one composition per material, an anchor each.
 *
 * The anchors are load-bearing: every material listed on a product page links
 * to `/materials#slug`, and the old per-material addresses redirect here.
 */
const query = vi.hoisted(() => ({ rows: [] as unknown[] }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({ order: async () => ({ data: query.rows, error: null }) }),
      }),
    }),
  },
}));

vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

const Materials = (await import("./Materials")).default;

const mount = (path = "/materials") =>
  render(
    <HelmetProvider>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={[path]}>
          <Materials />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );

beforeEach(() => {
  query.rows = [];
});

describe("the materials page", () => {
  it("shows the four the site ships with while the table is empty", async () => {
    const { container } = mount();
    await waitFor(() => expect(container.querySelectorAll("li.material-block").length).toBe(4));
    expect([...container.querySelectorAll("li.material-block")].map((li) => li.id)).toEqual([
      "sunbrella",
      "aluminum",
      "granite-porcelain",
      "polystone",
    ]);
  });

  it("gives every material the same parts, in the same order", async () => {
    query.rows = [
      { id: "1", slug: "teak", name: "עץ טיק", tagline: "מזדקן לאפור", body: "אחת.\n\nשתיים.", image_url: "t.jpg" },
      { id: "2", slug: "rope", name: "חבל קלוע", tagline: null, body: "שורה אחת.", image_url: "r.jpg" },
    ];
    const { container } = mount();
    await waitFor(() => expect(container.querySelectorAll("li.material-block").length).toBe(2));

    for (const block of container.querySelectorAll("li.material-block")) {
      expect(within(block as HTMLElement).getByRole("heading", { level: 2 })).toBeTruthy();
      expect(block.querySelector("img")).toBeTruthy();
    }
    // Two paragraphs from the first, one from the second: a blank line splits.
    const first = container.querySelector("#teak")!;
    expect(first.querySelectorAll("p").length).toBe(3); // tagline + two paragraphs
  });

  it("does not print an empty frame for a material with no photograph", async () => {
    query.rows = [{ id: "1", slug: "rope", name: "חבל", tagline: null, body: "כך.", image_url: null }];
    const { container } = mount();
    await waitFor(() => expect(container.querySelector("#rope")).toBeTruthy());
    expect(container.querySelector("#rope img")).toBeNull();
  });

  /**
   * The highlight is a class the page sets, not CSS :target. :target is the
   * obvious tool and it does not work: the blocks render after the data
   * arrives, and the browser has stopped looking for the fragment by then.
   */
  it("lights the material it was sent to", async () => {
    query.rows = [
      { id: "1", slug: "teak", name: "עץ טיק", tagline: null, body: "אחת.", image_url: "t.jpg" },
      { id: "2", slug: "rope", name: "חבל", tagline: null, body: "שתיים.", image_url: "r.jpg" },
    ];
    const { container } = mount("/materials#rope");
    await waitFor(() => expect(container.querySelector("#rope.is-found")).toBeTruthy());
    expect(container.querySelector("#teak.is-found")).toBeNull();
  });

  it("lights nothing when you simply open the page", async () => {
    query.rows = [{ id: "1", slug: "teak", name: "עץ טיק", tagline: null, body: "אחת.", image_url: "t.jpg" }];
    const { container } = mount();
    await waitFor(() => expect(container.querySelector("#teak")).toBeTruthy());
    expect(container.querySelector(".is-found")).toBeNull();
  });

  it("still has its own heading", async () => {
    mount();
    await waitFor(() => expect(screen.getByRole("heading", { level: 1 })).toBeTruthy());
  });
});
