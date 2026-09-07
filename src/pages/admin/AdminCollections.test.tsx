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

const AdminCollections = (await import("./AdminCollections")).default;
const { CropProvider } = await import("@/components/admin/CropProvider");

/**
 * CropProvider is normally supplied by AdminLayout, which this file mocks away.
 * It is provided here rather than made optional: a screen that cannot reach the
 * crop step must fail loudly, because the alternative is silently uploading an
 * uncropped photograph.
 */
const renderScreen = () =>
  render(
    <MemoryRouter>
      <CropProvider>
        <AdminCollections />
      </CropProvider>
    </MemoryRouter>,
  );

/**
 * Clicking "קולקציה חדשה" took the whole admin panel down with a white screen.
 *
 * The collection dialog read `editProd.id` — the PRODUCT being edited — and
 * when you are creating a collection there is no product, so it was null.
 * Nothing about a collection needs to know about a product, which is what
 * made it invisible on the way in.
 */
describe("collections and products", () => {
  it("opens the new-collection dialog instead of taking the panel down", async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByRole("button", { name: /הקולקציה הראשונה/ })).toBeTruthy());

    await userEvent.setup().click(screen.getByRole("button", { name: /הקולקציה הראשונה/ }));

    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(screen.getByLabelText(/שם הקולקציה/)).toBeTruthy();
  });

  it("does not ask about product finishes while creating a collection", async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByRole("button", { name: /הקולקציה הראשונה/ })).toBeTruthy());
    await userEvent.setup().click(screen.getByRole("button", { name: /הקולקציה הראשונה/ }));

    const dialog = await screen.findByRole("dialog");
    // Colours belong to a product. A collection has none, and offering them
    // here is what dragged the null product into this dialog.
    expect(dialog.textContent).not.toMatch(/גימור|צבע/);
  });
});
