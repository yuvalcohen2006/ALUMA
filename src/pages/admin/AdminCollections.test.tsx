import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ order: async () => ({ data: [], error: null }) }),
    }),
  },
}));

vi.mock("./AdminLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Signed in, and an admin — so the guard renders its children rather than a
// redirect. Everything else about the guard is left real, because the guard is
// what supplies the crop context in the running app.
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "u1" }, loading: false }),
}));
vi.mock("@/hooks/useIsAdmin", () => ({
  useIsAdmin: () => ({ isAdmin: true, loading: false }),
}));

const AdminCollections = (await import("./AdminCollections")).default;
const AdminGuard = (await import("@/components/AdminGuard")).default;

/**
 * Rendered through AdminGuard, exactly as App.tsx mounts it.
 *
 * The previous version of this file wrapped the screen in CropProvider by
 * hand, and that is why it went green while the real page was a white screen.
 * Every admin page calls useCrop() and then RENDERS AdminLayout — so while the
 * provider lived inside AdminLayout it was a descendant of its own consumer,
 * useContext found nothing, and the hook threw before anything painted.
 *
 * A test may not assemble a tree the application does not. If a page needs a
 * provider, the test's job is to prove something really puts one above it.
 */
const renderScreen = () =>
  render(
    <MemoryRouter>
      <AdminGuard>
        <AdminCollections />
      </AdminGuard>
    </MemoryRouter>,
  );

describe("collections and products", () => {
  it("renders inside the guard without the crop context throwing", async () => {
    renderScreen();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /הקולקציה הראשונה/ })).toBeTruthy(),
    );
  });

  /**
   * Clicking "קולקציה חדשה" took the whole admin panel down with a white
   * screen. The collection dialog read `editProd.id` — the PRODUCT being
   * edited — and when you are creating a collection there is no product.
   */
  it("opens the new-collection dialog instead of taking the panel down", async () => {
    renderScreen();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /הקולקציה הראשונה/ })).toBeTruthy(),
    );

    await userEvent.setup().click(screen.getByRole("button", { name: /הקולקציה הראשונה/ }));

    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(screen.getByLabelText(/שם הקולקציה/)).toBeTruthy();
  });

  it("does not ask about product finishes while creating a collection", async () => {
    renderScreen();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /הקולקציה הראשונה/ })).toBeTruthy(),
    );
    await userEvent.setup().click(screen.getByRole("button", { name: /הקולקציה הראשונה/ }));

    const dialog = await screen.findByRole("dialog");
    // Colours belong to a product. A collection has none, and offering them
    // here is what dragged the null product into this dialog.
    expect(dialog.textContent).not.toMatch(/גימור|צבע/);
  });
});

/**
 * The structural half of the same lesson, so it cannot come back by someone
 * moving the provider somewhere that looks tidier.
 */
describe("where the crop context lives", () => {
  it("is supplied above the pages, not by the layout they render", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

    expect(read("src/components/AdminGuard.tsx")).toContain("<CropProvider>");
    expect(read("src/pages/admin/AdminLayout.tsx")).not.toContain("CropProvider");
  });
});
