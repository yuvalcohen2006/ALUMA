import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { mergeContact } from "@/lib/site-contact";

const contact = vi.hoisted(() => ({ hours: undefined as string | undefined }));

vi.mock("@/hooks/useSiteContact", () => ({
  useSiteContact: () => mergeContact({ hours: contact.hours }),
}));

const ShowroomBand = (await import("./ShowroomBand")).default;

/**
 * /admin/settings has an opening-hours field. It was stored and never shown,
 * so an owner announcing "closed for the holidays" would have announced it to
 * nobody.
 */
describe("the showroom band", () => {
  it("shows the note the owner wrote about opening hours", () => {
    contact.hours = "סגור בין 10 ל-15 באוגוסט";
    const { getByText } = render(<ShowroomBand />);
    expect(getByText("סגור בין 10 ל-15 באוגוסט")).toBeTruthy();
  });

  it("shows no note line at all when the field is empty", () => {
    contact.hours = "";
    const { queryByTestId } = render(<ShowroomBand />);
    expect(queryByTestId("hours-note")).toBeNull();
  });

  it("still shows the weekly hours either way", () => {
    contact.hours = "";
    const { getByText } = render(<ShowroomBand />);
    expect(getByText("ראשון – חמישי")).toBeTruthy();
  });
});
