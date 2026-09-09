import { describe, expect, it, vi } from "vitest";
import { render as rtlRender, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ insert: async () => ({ error: null }) }) },
}));

const Newsletter = (await import("./Newsletter")).default;

/** Rendered at a path, because the empty field takes the page's direction. */
const render = (path = "/") =>
  rtlRender(
    <MemoryRouter initialEntries={[path]}>
      <Newsletter />
    </MemoryRouter>,
  );

/**
 * `dir="auto"` decides direction from the first strong character of the
 * VALUE. An empty field has none, so it falls back to left-to-right — and the
 * Hebrew placeholder sits against the left edge of a right-to-left page.
 *
 * The field has to hold both: the page's own direction while it shows a
 * prompt in the page's language, and Latin once an address is typed. It used
 * to hardcode "rtl" for the empty state, which pushed the English placeholder
 * to the far side of a left-aligned page and made the text jump across the
 * field the moment a character was typed.
 */
describe("the club sign-up field", () => {
  it("puts the Hebrew placeholder on the reading edge while empty", () => {
    render();
    expect(screen.getByLabelText(/מייל|אימייל|כתובת/)).toHaveAttribute("dir", "rtl");
  });

  it("switches to left-to-right once an address is being typed", async () => {
    render();
    const field = screen.getByLabelText(/מייל|אימייל|כתובת/);
    await userEvent.setup().type(field, "dana@example.com");
    expect(field).toHaveAttribute("dir", "ltr");
  });

  it("goes back to Hebrew if the field is cleared again", async () => {
    const user = userEvent.setup();
    render();
    const field = screen.getByLabelText(/מייל|אימייל|כתובת/);
    await user.type(field, "a");
    await user.clear(field);
    expect(field).toHaveAttribute("dir", "rtl");
  });

  it("follows the page into English rather than forcing Hebrew's direction", () => {
    // By role, not by label: the label's language comes from i18n, which the
    // language shell sets in the real app. Direction comes from the URL, and
    // that is what this is about.
    render("/en");
    expect(screen.getByRole("textbox")).toHaveAttribute("dir", "ltr");
  });
});
