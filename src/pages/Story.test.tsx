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

  it("opens on the new line, with the paragraph under it at the reading size", () => {
    mount();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("הבית לא נגמר בדלת.");
    const lead = screen.getByText(/היא הדרך שבה הבית ממשיך החוצה/);
    expect(lead.className).toContain("text-lead");
    expect(lead.className).not.toContain("text-small");
  });

  it("sets each sentence of the closing line on a line of its own", () => {
    mount();
    const close = screen.getByText("את הבד צריך לגעת.").parentElement!;
    expect(close.tagName).toBe("H2");
    expect(close.querySelectorAll("span.block")).toHaveLength(2);
  });
});
