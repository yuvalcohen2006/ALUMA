import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ShineButton from "./shine-button";

/**
 * The site's one button, as a page link, an outside link or a form button,
 * on a light, dark or terracotta background.
 */
describe("the site's button", () => {
  const mount = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

  it("is a router link when it goes to a page of the site", () => {
    mount(<ShineButton to="/faq#contact">לתיאום שיחה</ShineButton>);
    const link = screen.getByRole("link", { name: "לתיאום שיחה" });
    expect(link.getAttribute("href")).toBe("/faq#contact");
    expect(link.className).toContain("btn-shine");
  });

  it("is a plain link when it leaves the site", () => {
    mount(
      <ShineButton href="https://waze.com/ul?q=x" target="_blank" rel="noopener noreferrer" on="dark">
        Waze
      </ShineButton>,
    );
    const link = screen.getByRole("link", { name: "Waze" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.className).toContain("btn-shine-dark");
  });

  it("is a real button for a form, and never submits by accident", () => {
    mount(
      <>
        <ShineButton>פתיחה</ShineButton>
        <ShineButton type="submit" disabled>
          שליחה
        </ShineButton>
      </>,
    );
    expect(screen.getByRole("button", { name: "פתיחה" }).getAttribute("type")).toBe("button");
    const send = screen.getByRole("button", { name: "שליחה" }) as HTMLButtonElement;
    expect(send.type).toBe("submit");
    expect(send.disabled).toBe(true);
  });

  it("takes the terracotta version on a terracotta background", () => {
    mount(<ShineButton to="/" on="terracotta">בית</ShineButton>);
    expect(screen.getByRole("link").className).toContain("btn-shine-terracotta");
  });
});
