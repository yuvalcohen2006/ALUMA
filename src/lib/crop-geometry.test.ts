import { describe, expect, it } from "vitest";
import {
  centeredOffset,
  clampOffset,
  coverScale,
  displaySize,
  isUpscaling,
  maxUsefulZoom,
  offsetToPercent,
  percentToOffset,
  sourceRect,
  zoomAbout,
  type CropView,
} from "./crop-geometry";

const WINDOW = { w: 400, h: 400 };
/** A landscape phone photo: wider than the square window. */
const LANDSCAPE = { w: 4000, h: 3000 };
/** A portrait one. */
const PORTRAIT = { w: 3000, h: 4000 };

describe("cover scale", () => {
  it("scales by the tighter axis so the window is always filled", () => {
    // 400/3000 would leave the width short, so the height decides.
    expect(coverScale(LANDSCAPE, WINDOW)).toBeCloseTo(400 / 3000);
    expect(coverScale(PORTRAIT, WINDOW)).toBeCloseTo(400 / 3000);
  });

  it("covers exactly, never under", () => {
    for (const img of [LANDSCAPE, PORTRAIT, { w: 400, h: 400 }, { w: 100, h: 900 }]) {
      const d = displaySize(img, WINDOW, 1);
      expect(d.w).toBeGreaterThanOrEqual(WINDOW.w - 1e-9);
      expect(d.h).toBeGreaterThanOrEqual(WINDOW.h - 1e-9);
    }
  });
});

describe("clamping", () => {
  /**
   * The invariant the whole dialog rests on: there is no reachable state where
   * a corner of the crop is empty, so no export can have a transparent edge.
   */
  it("never lets the image uncover the window", () => {
    const display = displaySize(LANDSCAPE, WINDOW, 1);
    for (const [tx, ty] of [
      [999, 999],
      [-99999, -99999],
      [0, 0],
      [-10, 5],
    ]) {
      const c = clampOffset(tx, ty, display, WINDOW);
      expect(c.tx).toBeLessThanOrEqual(0);
      expect(c.ty).toBeLessThanOrEqual(0);
      expect(c.tx + display.w).toBeGreaterThanOrEqual(WINDOW.w - 1e-9);
      expect(c.ty + display.h).toBeGreaterThanOrEqual(WINDOW.h - 1e-9);
    }
  });

  it("pins an axis with no slack to zero rather than inverting its range", () => {
    // A square image in a square window has slack on neither axis.
    const display = displaySize({ w: 1000, h: 1000 }, WINDOW, 1);
    expect(clampOffset(50, -50, display, WINDOW)).toEqual({ tx: 0, ty: 0 });
  });
});

describe("source rectangle", () => {
  it("is the whole image when centred at zoom 1 on a matching aspect", () => {
    const img = { w: 1600, h: 1600 };
    const view: CropView = { zoom: 1, ...centeredOffset(displaySize(img, WINDOW, 1), WINDOW) };
    const r = sourceRect(view, img, WINDOW);
    expect(r.sx).toBeCloseTo(0);
    expect(r.sy).toBeCloseTo(0);
    expect(r.sw).toBeCloseTo(1600);
    expect(r.sh).toBeCloseTo(1600);
  });

  it("takes the middle band of a landscape photo in a square window", () => {
    const view: CropView = {
      zoom: 1,
      ...centeredOffset(displaySize(LANDSCAPE, WINDOW, 1), WINDOW),
    };
    const r = sourceRect(view, LANDSCAPE, WINDOW);
    expect(r.sw).toBeCloseTo(3000);
    expect(r.sh).toBeCloseTo(3000);
    expect(r.sx).toBeCloseTo(500); // (4000 - 3000) / 2
    expect(r.sy).toBeCloseTo(0);
  });

  it("stays inside the image at every reachable offset", () => {
    const display = displaySize(LANDSCAPE, WINDOW, 1.7);
    for (const [tx, ty] of [[0, 0], [-9999, -9999], [-100, -250]]) {
      const c = clampOffset(tx, ty, display, WINDOW);
      const r = sourceRect({ zoom: 1.7, ...c }, LANDSCAPE, WINDOW);
      expect(r.sx).toBeGreaterThanOrEqual(-1e-6);
      expect(r.sy).toBeGreaterThanOrEqual(-1e-6);
      expect(r.sx + r.sw).toBeLessThanOrEqual(LANDSCAPE.w + 1e-6);
      expect(r.sy + r.sh).toBeLessThanOrEqual(LANDSCAPE.h + 1e-6);
    }
  });
});

describe("zooming", () => {
  /**
   * Zoom used to walk the subject into a corner: the transform origin is the
   * top-left, so scaling pushed everything down and across and the person had
   * to drag it back after every scroll.
   */
  it("keeps the centre of the window still", () => {
    const start: CropView = { zoom: 1, ...centeredOffset(displaySize(LANDSCAPE, WINDOW, 1), WINDOW) };
    const before = sourceRect(start, LANDSCAPE, WINDOW);
    const centreBefore = { x: before.sx + before.sw / 2, y: before.sy + before.sh / 2 };

    const zoomed = zoomAbout(start, LANDSCAPE, WINDOW, 2);
    const after = sourceRect(zoomed, LANDSCAPE, WINDOW);
    const centreAfter = { x: after.sx + after.sw / 2, y: after.sy + after.sh / 2 };

    expect(centreAfter.x).toBeCloseTo(centreBefore.x, 4);
    expect(centreAfter.y).toBeCloseTo(centreBefore.y, 4);
  });

  it("still covers the window after zooming out to 1", () => {
    const start: CropView = { zoom: 3, tx: -800, ty: -600 };
    const out = zoomAbout(start, LANDSCAPE, WINDOW, 1);
    const display = displaySize(LANDSCAPE, WINDOW, 1);
    expect(out.tx + display.w).toBeGreaterThanOrEqual(WINDOW.w - 1e-9);
    expect(out.ty + display.h).toBeGreaterThanOrEqual(WINDOW.h - 1e-9);
  });
});

describe("the sliders", () => {
  it("round-trip an offset through a percentage", () => {
    const view: CropView = { zoom: 1.5, tx: -120, ty: -40 };
    const pct = offsetToPercent(view, LANDSCAPE, WINDOW);
    const back = percentToOffset(pct, LANDSCAPE, WINDOW, view.zoom);
    expect(back.tx).toBeCloseTo(view.tx);
    expect(back.ty).toBeCloseTo(view.ty);
  });

  it("report 50 on an axis that cannot move, instead of dividing by zero", () => {
    const square = { w: 1000, h: 1000 };
    const view: CropView = { zoom: 1, tx: 0, ty: 0 };
    expect(offsetToPercent(view, square, WINDOW)).toEqual({ x: 50, y: 50 });
  });
});

describe("upscaling", () => {
  it("knows when the crop has gone past the source resolution", () => {
    const output = { w: 1600, h: 1600 };
    const small = { w: 1200, h: 1200 };
    const view: CropView = { zoom: 1, ...centeredOffset(displaySize(small, WINDOW, 1), WINDOW) };
    expect(isUpscaling(view, small, WINDOW, output)).toBe(true);

    const big = { w: 4000, h: 4000 };
    const bigView: CropView = { zoom: 1, ...centeredOffset(displaySize(big, WINDOW, 1), WINDOW) };
    expect(isUpscaling(bigView, big, WINDOW, output)).toBe(false);
  });

  it("reports the zoom at which a large photo starts to soften", () => {
    // 4000px of source through a window that maps to 4000 source px at zoom 1,
    // exported at 1600 => 2.5x of headroom.
    expect(maxUsefulZoom({ w: 4000, h: 4000 }, WINDOW, { w: 1600, h: 1600 })).toBeCloseTo(2.5);
  });

  it("never reports less than 1, so a small photo is still croppable", () => {
    expect(maxUsefulZoom({ w: 300, h: 300 }, WINDOW, { w: 1600, h: 1600 })).toBe(1);
  });
});
