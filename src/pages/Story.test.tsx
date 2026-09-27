import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

/**
 * The About page, against the owner's list of what to cut and what to keep.
 */

vi.mock("@/integrations/supabase/client", () => {
  const chain: Record<string, unknown> = {};
  for (const k of ["select", "eq", "order", "limit", "in"]) chain[k] = () => chain;
  chain.then = (res: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(res);
  chain.maybeSingle = async () => ({ data: null, error: null });
  return { supabase: { from: () => chain } };
});

vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

const Story = (await import("./Story")).default;

const mount = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe("the About page", () => {
  it.each([
    "מה אנחנו לא עושים",
    "לא מוכרים ריהוט שלא היינו שמים בחצר שלנו",
    "לא עובדים במידות סטנדרטיות",
    "לא מבטיחים תאריך אספקה",
    "לא נעלמים אחרי ההתקנה",
    "של ישראל",
    "שלושתנו",
    "אותם אנשים מהמדידה הראשונה",
    "הכי קל להבין את אלומה כשיושבים עליה",
    "אנחנו בונים ריהוט שנשאר בחוץ",
  ])("no longer says %s", (line) => {
    const { container } = mount();
    expect(container.textContent).not.toContain(line);
  });

  it("names nobody under the portraits, and keeps all three drawings", () => {
    const { container } = mount();
    for (const name of ["עידן", "רועי", "בן"]) {
      expect(screen.queryByText(name)).toBeNull();
    }
    const portraits = [...container.querySelectorAll("img")].filter((img) =>
      /portrait/.test(img.getAttribute("src") ?? ""),
    );
    expect(portraits).toHaveLength(3);
  });

  it.each([
    "אלומה היא לא רק ריהוט חוץ",
    "איך נולד פריט",
    "מודדים ומתכננים",
    "מתחילים במרחב עצמו",
    "את הבד צריך לגעת",
  ])("no longer says %s either", (line) => {
    const { container } = mount();
    expect(container.textContent).not.toContain(line);
  });

  it("opens on the shared page title, with no logo over it", () => {
    const { container } = mount();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("הבית לא נגמר בדלת.");
    // Neither the small logo over the title nor the wordmark under the button.
    expect(container.querySelector('img[src*="aluma-logo"]')).toBeNull();
  });

  it("shows no furniture photographs, only the three drawings", () => {
    const { container } = mount();
    const srcs = [...container.querySelectorAll("img")].map((img) => img.getAttribute("src") ?? "");
    expect(srcs.some((src) => /terrace|craft/.test(src))).toBe(false);
    expect(srcs).toHaveLength(3);
  });

  it("closes on the showroom's address, as the heading", () => {
    mount();
    const close = screen.getByText(/אולם התצוגה שלנו מחכה לכם/);
    expect(close.tagName).toBe("H2");
  });
});
