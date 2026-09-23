import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const rows = vi.hoisted(() => ({ list: [] as unknown[], error: null as unknown }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ order: async () => ({ data: rows.list, error: rows.error }) }),
      insert: async () => ({ error: rows.error }),
    }),
  },
}));

vi.mock("./AdminLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "u1" }, loading: false }) }));
vi.mock("@/hooks/useIsAdmin", () => ({ useIsAdmin: () => ({ isAdmin: true, loading: false }) }));

const AdminMaterials = (await import("./AdminMaterials")).default;
const AdminGuard = (await import("@/components/AdminGuard")).default;

/**
 * Mounted through AdminGuard, exactly as App.tsx mounts it — the guard is what
 * supplies the crop context, and a screen that calls useCrop() outside one is
 * a white panel. See AdminCollections.test for the full story.
 */
const renderScreen = () =>
  render(
    <MemoryRouter>
      <AdminGuard>
        <AdminMaterials />
      </AdminGuard>
    </MemoryRouter>,
  );

describe("the materials screen", () => {
  it("renders inside the guard without the crop context throwing", async () => {
    rows.list = [];
    rows.error = null;
    renderScreen();
    await waitFor(() => expect(screen.getByRole("heading", { name: "חומרים" })).toBeTruthy());
    expect(screen.getByRole("button", { name: /חומר חדש/ })).toBeTruthy();
  });

  it("says what the site is showing while there are no materials yet", async () => {
    rows.list = [];
    rows.error = null;
    renderScreen();
    await waitFor(() => expect(screen.getByText(/אין עדיין חומרים/)).toBeTruthy());
  });

  it("gives every material its fields, and shows an unpublished one too", async () => {
    rows.error = null;
    rows.list = [
      {
        id: "1",
        slug: "teak",
        name: "עץ טיק",
        name_en: "Teak",
        tagline: "מזדקן לאפור",
        body: "אחת.",
        image_url: null,
        published: false,
        sort_order: 10,
      },
    ];
    renderScreen();
    await waitFor(() => expect(screen.getByLabelText("שם")).toBeTruthy());
    expect((screen.getByLabelText("שם") as HTMLInputElement).value).toBe("עץ טיק");
    expect((screen.getByLabelText("הסבר") as HTMLTextAreaElement).value).toBe("אחת.");
    expect((screen.getByLabelText("מפורסם") as HTMLInputElement).checked).toBe(false);
  });

  /**
   * The bug the owner hit: "new material" answered "could not be created" and
   * nothing said why. The table was not there — one script away — and a toast
   * that vanishes is no way to learn that.
   */
  it("says which script is missing instead of failing quietly", async () => {
    rows.list = [];
    rows.error = { code: "PGRST205", message: "Could not find the table 'public.site_materials' in the schema cache" };
    renderScreen();
    await waitFor(() => expect(screen.getByText(/עדיין לא מופעל במסד הנתונים/)).toBeTruthy());
    expect(screen.getByText(/20260917120000_materials_and_sizes\.sql/)).toBeTruthy();
    // And it does not also claim the list is simply empty.
    expect(screen.queryByText(/אין עדיין חומרים/)).toBeNull();
  });
});
