import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: null, loading: false }) }));
vi.mock("@/components/AccountMenu", () => ({ default: () => null }));

const Header = (await import("./Header")).default;

/**
 * DIY is not ready. It keeps its place in the header, greyed out, and it is
 * not a link — in the bar or in the phone menu.
 */
describe("the header's DIY item", () => {
  it("is greyed out and goes nowhere, in the bar and in the phone menu", () => {
    const { container } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    const items = screen.getAllByText("עשה זאת בעצמך");
    expect(items).toHaveLength(2);
    for (const item of items) {
      expect(item.closest("a")).toBeNull();
      expect(item.getAttribute("aria-disabled")).toBe("true");
    }
    expect(container.querySelector('a[href="/diy"]')).toBeNull();
  });

  it("still links everything else", () => {
    const { container } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    for (const href of ["/collections", "/projects", "/faq", "/club", "/story"]) {
      expect(container.querySelectorAll(`a[href="${href}"]`).length).toBeGreaterThan(0);
    }
  });
});
