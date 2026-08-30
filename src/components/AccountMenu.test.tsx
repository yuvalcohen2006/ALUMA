import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const auth = vi.hoisted(() => ({
  user: null as { email?: string; user_metadata?: { full_name?: string } } | null,
  loading: false,
  signedOut: false,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    ...auth,
    signOut: async () => {
      auth.signedOut = true;
    },
  }),
}));

const AccountMenu = (await import("./AccountMenu")).default;

const renderMenu = () =>
  render(
    <MemoryRouter>
      <AccountMenu />
    </MemoryRouter>,
  );

/**
 * Being signed in was invisible. You joined the club, the header looked
 * exactly as it had before, and the only way to check was to navigate to the
 * account page and see whether it let you in.
 */
describe("the account menu", () => {
  beforeEach(() => {
    auth.user = null;
    auth.loading = false;
    auth.signedOut = false;
  });

  it("shows nothing at all when nobody is signed in", () => {
    const { container } = renderMenu();
    expect(container).toBeEmptyDOMElement();
  });

  it("shows nothing while it is still working out who you are", () => {
    auth.loading = true;
    auth.user = { email: "dana@example.com" };
    const { container } = renderMenu();
    // Flashing a name and then removing it is worse than waiting a beat.
    expect(container).toBeEmptyDOMElement();
  });

  it("greets you by name when it has one", () => {
    auth.user = { email: "dana@example.com", user_metadata: { full_name: "דנה כהן" } };
    renderMenu();
    expect(screen.getByRole("button", { name: /דנה/ })).toBeTruthy();
  });

  it("falls back to the part of the email before the @", () => {
    auth.user = { email: "dana@example.com" };
    renderMenu();
    expect(screen.getByRole("button", { name: /dana/ })).toBeTruthy();
  });

  it("stays closed until you ask for it", () => {
    auth.user = { email: "dana@example.com" };
    renderMenu();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getByRole("button", { name: /dana/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("opens onto the things you would actually want", async () => {
    auth.user = { email: "dana@example.com" };
    renderMenu();
    await userEvent.setup().click(screen.getByRole("button", { name: /dana/ }));
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /מעקב/ })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /פרטים/ })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /יציאה/ })).toBeTruthy();
  });

  it("closes on Escape, so it never traps you", async () => {
    auth.user = { email: "dana@example.com" };
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: /dana/ }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("signs you out from the menu", async () => {
    auth.user = { email: "dana@example.com" };
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: /dana/ }));
    await user.click(screen.getByRole("menuitem", { name: /יציאה/ }));
    expect(auth.signedOut).toBe(true);
  });
});
