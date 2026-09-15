import { describe, expect, it } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { framedCount, framedPhoto } from "./framed-photos";
import { normaliseProduct } from "@/hooks/useCollectionsData";

const BUCKET = "https://jzqayfllojeqivwbbuyf.supabase.co/storage/v1/object/public/site-collections/";
// dex: a 1156×488 strip with a fire table running edge to edge.
const DEX = `${BUCKET}1788688340884-qlu9sz.png`;

describe("framedPhoto", () => {
  it("has a square for every file the script wrote", () => {
    const files = readdirSync(join(process.cwd(), "src/assets/products")).filter((f) => f.endsWith(".webp"));
    expect(files.length).toBeGreaterThan(40);
    expect(framedCount).toBe(files.length);
  });

  it("swaps an old upload for its square", () => {
    const url = framedPhoto(DEX);
    expect(url).not.toBe(DEX);
    expect(url).toMatch(/1788688340884-qlu9sz.*\.webp/);
  });

  /** Uploaded through the crop window: already a square the owner framed. */
  it("leaves a photo it has no square for exactly as it is", () => {
    const fresh = `${BUCKET}1799999999999-abcdef.jpg`;
    expect(framedPhoto(fresh)).toBe(fresh);
  });

  it("matches only this project's product bucket", () => {
    const elsewhere = "https://example.com/uploads/1788688340884-qlu9sz.png";
    expect(framedPhoto(elsewhere)).toBe(elsewhere);
  });

  it("ignores a query string on the stored address", () => {
    expect(framedPhoto(`${DEX}?v=2`)).toMatch(/\.webp/);
  });

  it("passes nothing through as nothing", () => {
    expect(framedPhoto(null)).toBeNull();
    expect(framedPhoto("")).toBe("");
  });
});

describe("the product row the pages receive", () => {
  it("carries the square for the cover and every gallery photo", () => {
    const p = normaliseProduct({ id: "1", cover_url: DEX, gallery: [DEX, `${BUCKET}new.jpg`] });
    expect(p.cover_url).toMatch(/\.webp/);
    expect(p.gallery[0]).toMatch(/\.webp/);
    expect(p.gallery[1]).toBe(`${BUCKET}new.jpg`);
  });
});
