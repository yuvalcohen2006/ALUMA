import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import WhatsAppButton from "./WhatsAppButton";
import AccessibilityWidget from "./AccessibilityWidget";

/**
 * Two things float above every page. They have to sit in different corners,
 * and the one the client asked for has to be on the right.
 *
 * `start` and `end` are reading-direction words: under RTL `start` is the
 * RIGHT edge and `end` is the LEFT one. Both buttons were written with `end`,
 * which put them in the same corner on top of each other.
 */

/**
 * Both of these live inside the router in the real app — the accessibility
 * panel links to /accessibility, and that link is language-aware — so they are
 * rendered here the way they are actually mounted.
 */
const inRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

/** The inline-axis edge a fixed element is pinned to. */
function edge(el: Element | null) {
  const cls = el?.className ?? "";
  if (/(?:^|\s)start-\d/.test(cls)) return "start";
  if (/(?:^|\s)end-\d/.test(cls)) return "end";
  return null;
}

describe("the floating buttons", () => {
  it("puts WhatsApp on the reading-start edge — bottom right in Hebrew", () => {
    const { getByLabelText } = inRouter(<WhatsAppButton />);
    const fab = getByLabelText("צרו קשר בוואטסאפ");
    expect(edge(fab)).toBe("start");
    expect(fab.className).toMatch(/bottom-\d/);
  });

  it("keeps the accessibility button in the opposite corner", () => {
    const { getByLabelText } = inRouter(<AccessibilityWidget />);
    expect(edge(getByLabelText("פתיחת תפריט נגישות"))).toBe("end");
  });

  it("never stacks the two in one corner", () => {
    const whatsapp = inRouter(<WhatsAppButton />);
    const a11y = inRouter(<AccessibilityWidget />);
    expect(edge(whatsapp.getByLabelText("צרו קשר בוואטסאפ"))).not.toBe(
      edge(a11y.getByLabelText("פתיחת תפריט נגישות")),
    );
  });
});
