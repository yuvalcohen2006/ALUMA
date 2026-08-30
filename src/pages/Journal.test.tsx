import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

type Row = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tag: string | null;
  read_minutes: number | null;
  published_at: string | null;
};

const posts = vi.hoisted(() => ({ rows: [] as Row[], threw: false }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: async () => {
            if (posts.threw) throw new Error("offline");
            return { data: posts.rows, error: null };
          },
        }),
      }),
    }),
  },
}));

vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

const Journal = (await import("./Journal")).default;

const render_ = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <Journal />
      </MemoryRouter>
    </HelmetProvider>,
  );

const post = (over: Partial<Row> = {}): Row => ({
  id: "1",
  slug: "how-teak-ages",
  title: "איך טיק מזדקן בחוץ",
  excerpt: "מה קורה לעץ אחרי שלוש שנים בשמש",
  cover_image_url: "teak.jpg",
  tag: "חומרים",
  read_minutes: 5,
  published_at: "2026-08-01T00:00:00Z",
  ...over,
});

/**
 * The admin has a מגזין screen. Articles written there were reachable at
 * /journal/:slug and listed nowhere — publishing one changed nothing a visitor
 * could see.
 */
describe("שווה לדעת", () => {
  beforeEach(() => {
    posts.rows = [];
    posts.threw = false;
  });

  it("lists an article published in the admin", async () => {
    posts.rows = [post()];
    const { findByText, container } = render_();
    expect(await findByText("איך טיק מזדקן בחוץ")).toBeTruthy();
    expect(container.querySelector('a[href*="/journal/how-teak-ages"]')).toBeTruthy();
  });

  it("lists every published article, newest first as the query returns them", async () => {
    posts.rows = [post(), post({ id: "2", slug: "second", title: "כתבה שנייה" })];
    const { findByText } = render_();
    expect(await findByText("כתבה שנייה")).toBeTruthy();
  });

  it("shows no article section at all when nothing is published", async () => {
    const { container, queryByText } = render_();
    await waitFor(() => expect(container.querySelector("section")).toBeTruthy());
    // An empty heading over an empty list is worse than no heading.
    expect(queryByText("מהמגזין")).toBeNull();
  });

  it("still shows the materials when the articles cannot be fetched", async () => {
    posts.threw = true;
    const { findByText } = render_();
    // The materials are the point of the page; a failed request must not take
    // them down with it.
    expect(await findByText("עוד על החומרים")).toBeTruthy();
  });

  it("always shows the materials", async () => {
    posts.rows = [post()];
    const { findByText } = render_();
    expect(await findByText("עוד על החומרים")).toBeTruthy();
  });
});
