import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
 * The form sits behind a labelled disclosure button, so the page opens on the
 * four ways to reach a person rather than on a form.
 *
 * These used to assert the opposite — that the fields were visible without
 * anyone opening anything — and they kept passing after the change because
 * jsdom implements neither `inert` nor a grid collapsing to 0fr, so the
 * collapsed fields are still findable in the DOM. The button's own
 * aria-expanded is the thing to test, because it is also what a screen reader
 * is told.
 */
describe("the questions page", () => {
  const discloser = () => screen.getByRole("button", { name: /השארת פרטים|סגירת הטופס/ });

  it("keeps the form closed until someone asks for it", () => {
    renderFaq();
    expect(discloser().getAttribute("aria-expanded")).toBe("false");
  });

  it("opens it on the button, and says so", async () => {
    renderFaq();
    await userEvent.setup().click(discloser());
    expect(discloser().getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByLabelText(/שם מלא/)).toBeTruthy();
    expect(screen.getByLabelText(/טלפון/)).toBeTruthy();
  });

  it("has a real send button once it is open", async () => {
    renderFaq();
    await userEvent.setup().click(discloser());
    expect(screen.getByRole("button", { name: /שליחת ההודעה/ })).toBeTruthy();
  });

  it("no longer carries the lines the owner cut", () => {
    const { container } = renderFaq();
    for (const line of [
      "כל מה שאנחנו נשאלים לפני שמזמינים",
      "כתבו לנו ↓",
      "לא מצאתם את התשובה?",
      "גודל המרפסת או החצר",
    ]) {
      expect(container.textContent).not.toContain(line);
    }
  });

  it("titles the page plainly", () => {
    renderFaq();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("שאלות ותשובות");
  });

  it("puts \"כתבו לנו\" over the ways to reach us", () => {
    const { container } = renderFaq();
    const heading = screen.getByRole("heading", { name: "כתבו לנו" });
    expect(container.querySelector("#contact")?.contains(heading)).toBe(true);
  });

  it("sends the email card straight to Gmail, as one link", () => {
    renderFaq();
    const card = screen.getByRole("link", { name: /כתבו לנו במייל/ });
    expect(card.getAttribute("href")).toMatch(/^https:\/\/mail\.google\.com\/mail\/\?view=cm&fs=1&to=/);
    expect(card.querySelectorAll("a")).toHaveLength(0);
  });

  it("points the showroom card at Waze's own link, which a phone opens in the app", () => {
    renderFaq();
    const waze = [...document.querySelectorAll("a")].filter((a) =>
      (a.getAttribute("href") ?? "").startsWith("https://waze.com/ul?"),
    );
    expect(waze.length).toBeGreaterThan(0);
  });

  it("keeps the #contact anchor the rest of the site links to", () => {
    const { container } = renderFaq();
    expect(container.querySelector("#contact")).toBeTruthy();
  });
});
