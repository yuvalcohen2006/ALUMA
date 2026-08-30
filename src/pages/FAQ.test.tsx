import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ order: async () => ({ data: [], error: null }) }) }),
    }),
    functions: { invoke: async () => ({ data: { ok: true }, error: null }) },
  },
}));

vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

const FAQ = (await import("./FAQ")).default;

const renderFaq = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <FAQ />
      </MemoryRouter>
    </HelmetProvider>,
  );

/**
 * The form was hidden behind a plus-row, matching the questions above it.
 * That read nicely and worked badly: someone who arrives wanting to write to
 * you has to first work out that the row is a row and not a heading.
 */
describe("the questions page", () => {
  it("shows the message form without anyone having to open it", () => {
    renderFaq();
    expect(screen.getByLabelText(/שם מלא/)).toBeTruthy();
    expect(screen.getByLabelText(/טלפון/)).toBeTruthy();
  });

  it("has a real send button, not a row that expands", () => {
    renderFaq();
    expect(screen.getByRole("button", { name: /שליחת ההודעה/ })).toBeTruthy();
  });

  it("offers a jump straight to the form from the top of the page", () => {
    renderFaq();
    const jump = screen.getByRole("link", { name: /כתבו לנו/ });
    expect(jump.getAttribute("href")).toBe("#contact");
  });

  it("gives that jump somewhere to land", () => {
    const { container } = renderFaq();
    expect(container.querySelector("#contact")).toBeTruthy();
  });
});
