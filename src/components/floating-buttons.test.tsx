import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
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

/** The inline-axis edge a fixed element is pinned to. */
function edge(el: Element | null) {
  const cls = el?.className ?? "";
  if (/(?:^|\s)start-\d/.test(cls)) return "start";
  if (/(?:^|\s)end-\d/.test(cls)) return "end";
  return null;
}

describe("the floating buttons", () => {
  it("puts WhatsApp on the reading-start edge — bottom right in Hebrew", () => {
    const { getByLabelText } = render(<WhatsAppButton />);
    const fab = getByLabelText("צרו קשר בוואטסאפ");
    expect(edge(fab)).toBe("start");
    expect(fab.className).toMatch(/bottom-\d/);
  });

  it("keeps the accessibility button in the opposite corner", () => {
    const { getByLabelText } = render(<AccessibilityWidget />);
    expect(edge(getByLabelText("פתיחת תפריט נגישות"))).toBe("end");
  });

  it("never stacks the two in one corner", () => {
    const whatsapp = render(<WhatsAppButton />);
    const a11y = render(<AccessibilityWidget />);
    expect(edge(whatsapp.getByLabelText("צרו קשר בוואטסאפ"))).not.toBe(
      edge(a11y.getByLabelText("פתיחת תפריט נגישות")),
    );
  });
});
