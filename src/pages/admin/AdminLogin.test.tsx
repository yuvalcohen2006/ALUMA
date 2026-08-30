import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const state = vi.hoisted(() => ({
  signInError: null as string | null,
  userId: "user-1",
  roleRows: null as { role: string } | null,
  signedOut: false,
  navigatedTo: null as string | null,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: async () =>
        state.signInError
          ? { data: { user: null }, error: { message: state.signInError } }
          : { data: { user: { id: state.userId } }, error: null },
      signOut: async () => {
        state.signedOut = true;
        return { error: null };
      },
      signInWithOAuth: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: state.roleRows, error: null }) }),
        }),
      }),
    }),
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => (to: string) => (state.navigatedTo = to) };
});

const AdminLogin = (await import("./AdminLogin")).default;

const renderLogin = () =>
  render(
    <MemoryRouter>
      <AdminLogin />
    </MemoryRouter>,
  );

async function signIn(email = "outdooraluma@gmail.com", password = "correct-horse") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("אימייל"), email);
  await user.type(screen.getByLabelText("סיסמה"), password);
  await user.click(screen.getByRole("button", { name: "כניסה" }));
}

/**
 * The panel had no door of its own — you signed in through the customers'
 * club and hoped you landed somewhere useful. This is the door, and it has to
 * hold: a correct password for an account that is NOT an admin must not get
 * in, and must not be left quietly signed in either.
 */
describe("the admin login", () => {
  beforeEach(() => {
    state.signInError = null;
    state.roleRows = { role: "admin" };
    state.signedOut = false;
    state.navigatedTo = null;
  });

  it("lets an admin in", async () => {
    renderLogin();
    await signIn();
    await waitFor(() => expect(state.navigatedTo).toBe("/admin"));
  });

  it("keeps out an account that is not an admin, even with the right password", async () => {
    state.roleRows = null;
    renderLogin();
    await signIn("someone@example.com");
    expect(await screen.findByText(/לא מוגדר כמנהל/)).toBeTruthy();
    expect(state.navigatedTo).toBeNull();
  });

  it("signs that account back out rather than leaving it half-logged-in", async () => {
    state.roleRows = null;
    renderLogin();
    await signIn("someone@example.com");
    await waitFor(() => expect(state.signedOut).toBe(true));
  });

  it("says the password was wrong without saying which half was wrong", async () => {
    state.signInError = "Invalid login credentials";
    renderLogin();
    await signIn();
    // Never "no such user" — that tells an attacker which addresses exist.
    expect(await screen.findByText(/האימייל או הסיסמה/)).toBeTruthy();
    expect(state.navigatedTo).toBeNull();
  });

  it("will not submit an empty form", async () => {
    renderLogin();
    await userEvent.setup().click(screen.getByRole("button", { name: "כניסה" }));
    expect(state.navigatedTo).toBeNull();
  });

  it("still offers Google, because that is how the first admin got in", async () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /Google/ })).toBeTruthy();
  });
});
