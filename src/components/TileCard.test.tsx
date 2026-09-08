import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TileCard from "./TileCard";

const renderTile = (props: Partial<React.ComponentProps<typeof TileCard>> = {}) =>
  render(
    <MemoryRouter>
      <TileCard to="/products/x" image="/x.jpg" alt="" title="כיסא" {...props} />
    </MemoryRouter>,
  );

/**
 * The tile is used by six grids, so a defect here shows up in six places at
 * once. These are the things a visitor sees rather than the things a type
 * checker catches.
 */
describe("the tile", () => {
  it("renders its name and links where it was told to", () => {
    renderTile();
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/products/x");
    expect(screen.getByRole("heading", { name: "כיסא" })).toBeTruthy();
  });

  it("shows no label when there is none, rather than an empty box", () => {
    const { container } = renderTile();
    expect(container.querySelector(".rounded-full")).toBeNull();
  });

  /**
   * The owner asked for the label ON the photograph. Over an image the fill has
   * to be opaque — a translucent pill reads differently on pale stone than on a
   * dusk sky — so this pins both the placement and the solid fill.
   */
  it("puts the label on the photograph, opaque, at the reading start", () => {
    renderTile({ emblem: "new" });
    const badge = screen.getByText("חדש");
    const cls = badge.getAttribute("class") ?? "";

    expect(cls).toContain("absolute");
    expect(cls).toContain("start-4");
    // Solid charcoal on white type — 13.6:1 over any photograph.
    expect(cls).toContain("bg-foreground");
    expect(cls).toContain("text-background");
    // A slash in a Tailwind colour is an alpha value; there must not be one.
    expect(cls).not.toMatch(/bg-foreground\//);
    // It must never eat a click meant for the tile.
    expect(cls).toContain("pointer-events-none");

    // Inside the image frame, not the text block.
    const frame = badge.parentElement;
    expect(frame?.className).toContain("overflow-hidden");
  });

  it("keeps the label out of the text block", () => {
    renderTile({ emblem: "popular", meta: "עץ טיק" });
    const meta = screen.getByText("עץ טיק");
    expect(meta.parentElement?.textContent).not.toContain("מבוקש");
  });

  it("renders a title that is a real heading, for anything listing it", () => {
    renderTile({ as: "h2", title: "סלונים" });
    expect(screen.getByRole("heading", { level: 2, name: "סלונים" })).toBeTruthy();
  });

  /**
   * Half this catalogue is named in Latin — aero, milo, ciro — and those names
   * sit inside a Hebrew page. Without dir="auto" they inherited the page
   * direction and hung off the wrong edge of the line.
   */
  it("aligns each label to the side its own language starts from", () => {
    renderTile({ title: "aero", meta: "עץ טיק" });
    const title = screen.getByRole("heading", { name: "aero" });
    expect(title.getAttribute("dir")).toBe("auto");
    expect(title.className).toContain("text-start");

    const meta = screen.getByText("עץ טיק");
    expect(meta.getAttribute("dir")).toBe("auto");
    expect(meta.className).toContain("text-start");
  });

  /** An empty alt is correct for a photo the title already names — but the
   *  element must still be there, or a missing image has no box at all. */
  it("still renders a frame when there is no photograph yet", () => {
    const { container } = renderTile({ image: null });
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".bg-muted")).toBeTruthy();
  });
});
