import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

const auth = vi.hoisted(() => ({ user: null as { email?: string } | null, loading: false }));

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => auth }));
// Header and footer are not what this page is being judged on, and they drag in
// the whole i18n + router stack.
vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

const Club = (await import("./Club")).default;

function renderClub() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <Club />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

/**
 * The client's words: "three buttons directing you to fill out a form in a
 * single page, that's insane". A membership page has exactly one thing it
 * wants you to do, so it should ask exactly once.
 */
describe("the club page", () => {
  beforeEach(() => {
    auth.user = null;
    auth.loading = false;
  });

  it("asks you to join exactly once", () => {
    const { container } = renderClub();
    const joins = container.querySelectorAll('a[href*="mode=signup"]');
    expect(joins).toHaveLength(1);
  });

  it("offers exactly one way in for someone who already has an account", () => {
    const { container } = renderClub();
    const signIns = [...container.querySelectorAll('a[href="/club/auth"]')];
    expect(signIns).toHaveLength(1);
  });

  it("sends a signed-in member to their account, and only once", () => {
    auth.user = { email: "someone@example.com" };
    const { container } = renderClub();
    expect(container.querySelectorAll('a[href="/club/dashboard"]')).toHaveLength(1);
    // Nobody who is already a member should still be asked to sign up.
    expect(container.querySelectorAll('a[href*="mode=signup"]')).toHaveLength(0);
  });

  it("is built from two sections under the hero", () => {
    const { container } = renderClub();
    // PageHero brings its own <section>; the body is what the client counted.
    expect(container.querySelectorAll("section")).toHaveLength(3);
  });

  it("no longer opens with the explainer the client asked to drop", () => {
    const { queryByText } = renderClub();
    expect(queryByText("מה זה מועדון אלומה")).toBeNull();
  });

  it("still names the benefits and the steps", () => {
    const { container } = renderClub();
    expect(within(container).getByText("הרשמה")).toBeTruthy();
    expect(within(container).getByText("עולם שלם נפתח")).toBeTruthy();
  });
});
