import { describe, expect, it } from "vitest";
import type { Backdrop, SceneItem } from "@/data/sceneItems";
import {
  MAX_SCALE,
  MIN_SCALE,
  clampToFloor,
  clampedScaleAt,
  scaleAt,
  shadowFor,
  snapRotation,
  sortByDepth,
  spriteSize,
} from "./sceneGeometry";

const backdrop: Backdrop = {
  id: "test",
  name: "test",
  src: "",
  width: 1600,
  height: 1000,
  yHorizon: 400,
  yRef: 900,
  pxPerMetreAtRef: 250,
  floor: { top: 560, bottom: 980 },
  glaze: "#000",
};

const sofa: SceneItem = {
  id: "sofa",
  name: "sofa",
  category: "seating",
  realWidthCm: 100,
  realDepthCm: 100,
  realHeightCm: 70,
  anchor: { x: 0.5, y: 1 },
  variants: [],
};

describe("scaleAt", () => {
  it("is exactly 1 at the reference row", () => {
    expect(scaleAt(backdrop, backdrop.yRef)).toBe(1);
  });

  it("is 0 at the horizon — infinitely far away", () => {
    expect(scaleAt(backdrop, backdrop.yHorizon)).toBe(0);
  });

  it("is LINEAR in distance below the horizon, not 1/y", () => {
    // Halfway between horizon and reference must be exactly half scale. This is
    // the property that makes furniture sit on the ground; an eased or
    // inverse-y curve looks plausible and is wrong.
    const mid = (backdrop.yHorizon + backdrop.yRef) / 2;
    expect(scaleAt(backdrop, mid)).toBeCloseTo(0.5, 10);

    const quarter = backdrop.yHorizon + (backdrop.yRef - backdrop.yHorizon) * 0.25;
    expect(scaleAt(backdrop, quarter)).toBeCloseTo(0.25, 10);
  });

  it("grows past 1 in front of the reference row", () => {
    expect(scaleAt(backdrop, 1150)).toBeCloseTo(1.5, 10);
  });
});

describe("clampedScaleAt", () => {
  it("never returns a size small enough to read as a glitch", () => {
    expect(clampedScaleAt(backdrop, backdrop.yHorizon)).toBe(MIN_SCALE);
    expect(clampedScaleAt(backdrop, -500)).toBe(MIN_SCALE);
  });

  it("caps growth at the front of the plate", () => {
    expect(clampedScaleAt(backdrop, 99_999)).toBe(MAX_SCALE);
  });
});

describe("spriteSize", () => {
  it("draws a 70cm sofa at 175px on the reference row", () => {
    // 0.7m × 250px/m × scale 1
    const { height } = spriteSize(backdrop, sofa, backdrop.yRef, 1);
    expect(height).toBeCloseTo(175, 6);
  });

  it("halves that height halfway to the horizon", () => {
    const mid = (backdrop.yHorizon + backdrop.yRef) / 2;
    const { height } = spriteSize(backdrop, sofa, mid, 1);
    expect(height).toBeCloseTo(87.5, 6);
  });

  it("keeps the sprite's own aspect ratio", () => {
    const { width, height } = spriteSize(backdrop, sofa, backdrop.yRef, 2);
    expect(width / height).toBeCloseTo(2, 10);
  });
});

describe("clampToFloor", () => {
  it("keeps items on the floor rather than in the sky or the pool", () => {
    expect(clampToFloor(backdrop, 100)).toBe(backdrop.floor.top);
    expect(clampToFloor(backdrop, 5000)).toBe(backdrop.floor.bottom);
    expect(clampToFloor(backdrop, 700)).toBe(700);
  });
});

describe("sortByDepth", () => {
  it("draws far items first so near ones overlap them", () => {
    const out = sortByDepth([{ y: 900 }, { y: 600 }, { y: 750 }]);
    expect(out.map((i) => i.y)).toEqual([600, 750, 900]);
  });

  it("does not mutate its input", () => {
    const input = [{ y: 900 }, { y: 600 }];
    sortByDepth(input);
    expect(input.map((i) => i.y)).toEqual([900, 600]);
  });
});

describe("snapRotation", () => {
  it("hard-snaps near a cardinal even without shift", () => {
    expect(snapRotation(2, false)).toBe(0);
    expect(snapRotation(358, false)).toBe(0);
    expect(snapRotation(91.5, false)).toBe(90);
  });

  it("snaps to 15° steps while shift is held", () => {
    expect(snapRotation(52, true)).toBe(45);
    expect(snapRotation(38, true)).toBe(45);
  });

  it("leaves free rotation alone otherwise", () => {
    expect(snapRotation(52, false)).toBe(52);
  });

  it("normalises negative and over-spun angles", () => {
    expect(snapRotation(-45, false)).toBe(315);
    expect(snapRotation(370, false)).toBe(10);
  });
});

describe("shadowFor", () => {
  it("is much wider than it is tall — a floor contact, not a blob", () => {
    const s = shadowFor(200, 1);
    expect(s.radiusX).toBeGreaterThan(s.radiusY * 3);
  });

  it("fades slightly with distance", () => {
    expect(shadowFor(200, 0.4).opacity).toBeLessThan(shadowFor(200, 1).opacity);
  });
});
