import { describe, expect, it, vi } from "vitest";
import { render as rtlRender, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const insert = vi.fn(async () => ({ error: null }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ insert }) },
}));
vi.mock("@/hooks/useSiteText", () => ({ useSiteText: () => (_k: string, f: string) => f }));

const Newsletter = (await import("./components/home/Newsletter")).default;

// The band reads the language off the URL — the empty field takes the page's
// direction — so it is rendered here inside a router, as it is in the app.
const render = (ui: React.ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

/**
 * The club form took anything, said thank you, and then latched that success
 * into localStorage — so a visitor who mistyped their address could never get
 * the form back to correct it, and the owner's list filled with addresses
 * nothing can be sent to. noValidate switches off the browser's own checks and
 * the table has no format constraint, so this was the only place left to look.
 */
describe("the club signup", () => {
  it("refuses an address that is not one, and says so", async () => {
    localStorage.clear();
    insert.mockClear();
    render(<Newsletter />);

    const field = screen.getByRole("textbox");
    await userEvent.setup().type(field, "asdf");
    await userEvent.setup().click(screen.getByRole("button", { name: /.+/ }));

    expect(insert).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(field.getAttribute("aria-invalid")).toBe("true");
    // And critically: nothing was latched, so the form is still there to fix.
    expect(localStorage.getItem("aluma_newsletter")).toBeNull();
  });

  it("clears the complaint as soon as the visitor starts fixing it", async () => {
    localStorage.clear();
    insert.mockClear();
    render(<Newsletter />);
    const user = userEvent.setup();
    const field = screen.getByRole("textbox");

    await user.type(field, "asdf");
    await user.click(screen.getByRole("button", { name: /.+/ }));
    expect(screen.getByRole("alert")).toBeTruthy();

    await user.type(field, "@x.com");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("accepts a real address", async () => {
    localStorage.clear();
    insert.mockClear();
    render(<Newsletter />);
    await userEvent.setup().type(screen.getByRole("textbox"), "  Yuval@Gmail.com ");
    await userEvent.setup().click(screen.getByRole("button", { name: /.+/ }));

    expect(insert).toHaveBeenCalledWith({ email: "yuval@gmail.com", name: null });
  });
});
