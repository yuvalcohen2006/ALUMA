import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ insert: async () => ({ error: null }) }) },
}));

const Newsletter = (await import("./Newsletter")).default;

/**
 * `dir="auto"` decides direction from the first strong character of the
 * VALUE. An empty field has none, so it falls back to left-to-right — and the
 * Hebrew placeholder sits against the left edge of a right-to-left page.
 *
 * The field has to hold both: a Hebrew prompt while empty, a Latin address
 * once you type one.
 */
describe("the club sign-up field", () => {
  it("puts the Hebrew placeholder on the reading edge while empty", () => {
    render(<Newsletter />);
    expect(screen.getByLabelText(/מייל|אימייל|כתובת/)).toHaveAttribute("dir", "rtl");
  });

  it("switches to left-to-right once an address is being typed", async () => {
    render(<Newsletter />);
    const field = screen.getByLabelText(/מייל|אימייל|כתובת/);
    await userEvent.setup().type(field, "dana@example.com");
    expect(field).toHaveAttribute("dir", "ltr");
  });

  it("goes back to Hebrew if the field is cleared again", async () => {
    const user = userEvent.setup();
    render(<Newsletter />);
    const field = screen.getByLabelText(/מייל|אימייל|כתובת/);
    await user.type(field, "a");
    await user.clear(field);
    expect(field).toHaveAttribute("dir", "rtl");
  });
});
