import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";

/**
 * The language control. Everything asserted here is something a two-language
 * menu gets wrong: it forgets which language you are in, it sends you to the
 * home page instead of this page, or it stays open over the page you just
 * opened.
 */
const mount = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <LanguageSwitcher />
    </MemoryRouter>,
  );

const openMenu = async (path: string) => {
  const user = userEvent.setup();
  mount(path);
  await user.click(screen.getByRole("button"));
  return user;
};

describe("the language switcher", () => {
  it("names the language you are reading, not the one you would switch to", () => {
    mount("/collections");
    expect(screen.getByRole("button").textContent).toContain("עברית");
    mount("/en/collections");
    expect(screen.getAllByRole("button")[1].textContent).toContain("English");
  });

  it("stays shut until it is asked", () => {
    mount("/");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("false");
  });

  it("offers both languages, each as a link to this same page", async () => {
    await openMenu("/products/dex");
    const links = screen.getAllByRole("menuitem");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/products/dex",
      "/en/products/dex",
    ]);
    expect(links.map((l) => l.textContent)).toEqual(["עברית", "English"]);
  });

  it("marks the language you are in, and only that one", async () => {
    await openMenu("/en/collections");
    const [hebrew, english] = screen.getAllByRole("menuitem");
    expect(english.getAttribute("aria-current")).toBe("true");
    expect(hebrew.getAttribute("aria-current")).toBeNull();
    // Tinted as well as announced: the tick is not the only signal.
    expect(english.className).toContain("bg-secondary");
  });

  it("keeps the query and the fragment when it moves you across", async () => {
    await openMenu("/faq?open=2#contact");
    expect(screen.getAllByRole("menuitem")[1].getAttribute("href")).toBe("/en/faq?open=2#contact");
  });

  it("closes on Escape and hands focus back to the button", async () => {
    const user = await openMenu("/");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button"));
  });

  it("closes when a click lands anywhere else", async () => {
    const user = await openMenu("/");
    await user.click(document.body);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  /** Windows has no flag glyphs: 🇮🇱 renders there as the letters "IL". */
  it("shows real flag artwork rather than spelling it with emoji", async () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LanguageSwitcher />
      </MemoryRouter>,
    );
    const flag = container.querySelector("img");
    expect(flag, "the button carries a flag image").toBeTruthy();
    // A file, inlined by the bundler in tests — either way it is an SVG and
    // not a character the operating system may not have.
    expect(flag!.getAttribute("src")).toMatch(/svg/);
    expect(container.textContent).not.toMatch(/[\u{1F1E6}-\u{1F1FF}]/u);
  });
});
