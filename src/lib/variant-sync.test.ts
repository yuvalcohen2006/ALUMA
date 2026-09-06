import { describe, expect, it } from "vitest";
import { planVariantSync } from "./variant-sync";

const saved = (id: string, name: string, swatch = "#fff", image_url: string | null = null) => ({
  id,
  name,
  swatch,
  image_url,
});
const draft = (name: string, swatch = "#fff", image_url: string | null = null) => ({
  name,
  swatch,
  image_url,
});

/**
 * Colours used to be written straight to the database one row at a time, which
 * is why you had to save a piece of furniture before you could give it any.
 * Now they are edited alongside everything else and written when the product
 * is saved — so the plan has to say precisely what changed.
 */
describe("planVariantSync", () => {
  it("inserts a colour that has never been saved", () => {
    const plan = planVariantSync([], [draft("לבן")]);
    expect(plan.inserts).toHaveLength(1);
    expect(plan.inserts[0].name).toBe("לבן");
    expect(plan.updates).toEqual([]);
    expect(plan.deletes).toEqual([]);
  });

  it("updates a colour that already exists", () => {
    const plan = planVariantSync([saved("v1", "לבן")], [{ ...saved("v1", "שמנת") }]);
    expect(plan.updates).toHaveLength(1);
    expect(plan.updates[0].name).toBe("שמנת");
    expect(plan.inserts).toEqual([]);
  });

  it("deletes a colour the owner removed", () => {
    const plan = planVariantSync([saved("v1", "לבן"), saved("v2", "אפור")], [saved("v1", "לבן")]);
    expect(plan.deletes).toEqual(["v2"]);
  });

  it("does all three at once", () => {
    const plan = planVariantSync(
      [saved("v1", "לבן"), saved("v2", "אפור")],
      [saved("v1", "שמנת"), draft("טיק")],
    );
    expect(plan.updates.map((u) => u.id)).toEqual(["v1"]);
    expect(plan.inserts.map((i) => i.name)).toEqual(["טיק"]);
    expect(plan.deletes).toEqual(["v2"]);
  });

  it("numbers the colours in the order they appear on screen", () => {
    const plan = planVariantSync([], [draft("א"), draft("ב"), draft("ג")]);
    expect(plan.inserts.map((i) => i.sort_order)).toEqual([0, 1, 2]);
  });

  it("renumbers existing colours when they are reordered", () => {
    const plan = planVariantSync(
      [saved("v1", "א"), saved("v2", "ב")],
      [saved("v2", "ב"), saved("v1", "א")],
    );
    expect(plan.updates.find((u) => u.id === "v2")!.sort_order).toBe(0);
    expect(plan.updates.find((u) => u.id === "v1")!.sort_order).toBe(1);
  });

  it("ignores a colour with no name rather than saving a blank swatch", () => {
    const plan = planVariantSync([], [draft("  "), draft("לבן")]);
    expect(plan.inserts.map((i) => i.name)).toEqual(["לבן"]);
  });

  it("does nothing at all when nothing changed", () => {
    const rows = [saved("v1", "לבן", "#fff", "a.png")];
    const plan = planVariantSync(rows, rows.map((r) => ({ ...r })));
    expect(plan.inserts).toEqual([]);
    expect(plan.deletes).toEqual([]);
    expect(plan.updates).toEqual([]);
  });

  it("carries the product id onto every insert", () => {
    const plan = planVariantSync([], [draft("לבן")], "prod-1");
    expect(plan.inserts[0].product_id).toBe("prod-1");
  });
});
