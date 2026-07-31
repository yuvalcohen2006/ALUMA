import type { Backdrop, SceneItem } from "@/data/sceneItems";

/**
 * The one piece of maths the scene builder's realism rests on.
 *
 * For a level camera looking at a flat floor, a ground-standing object's
 * on-screen height is directly proportional to how far its base sits BELOW the
 * horizon line. Not 1/y, not exponential — linear:
 *
 *   an object of real height H at depth d projects to f·H/d pixels,
 *   and its base lands f·h/d pixels below the horizon (h = camera height),
 *   so pixelHeight = (H/h) · (yBase − yHorizon).
 *
 * Which is why dragging a sofa up the picture makes it smaller: up the picture
 * IS further away. Get this right and things sit on the ground; approximate it
 * and everything floats.
 */

/** Scale factor at a given baseline, relative to the backdrop's reference row. */
export function scaleAt(backdrop: Backdrop, yBase: number): number {
  const span = backdrop.yRef - backdrop.yHorizon;
  if (span <= 0) return 1;
  return (yBase - backdrop.yHorizon) / span;
}

/**
 * Clamped so nothing can be parked on the horizon at 4% size (which reads as a
 * rendering fault, not as distance) or dragged to the very front and blown up
 * past the plate.
 */
export const MIN_SCALE = 0.35;
export const MAX_SCALE = 1.9;

export function clampedScaleAt(backdrop: Backdrop, yBase: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scaleAt(backdrop, yBase)));
}

/** On-screen size of an item placed with its base at `yBase`. */
export function spriteSize(
  backdrop: Backdrop,
  item: SceneItem,
  yBase: number,
  naturalRatio: number
): { width: number; height: number } {
  const s = clampedScaleAt(backdrop, yBase);
  const height = (item.realHeightCm / 100) * backdrop.pxPerMetreAtRef * s;
  return { width: height * naturalRatio, height };
}

/** Keep a dragged item inside the backdrop's usable floor band. */
export function clampToFloor(backdrop: Backdrop, y: number): number {
  return Math.min(backdrop.floor.bottom, Math.max(backdrop.floor.top, y));
}

export function clampToWidth(backdrop: Backdrop, x: number): number {
  return Math.min(backdrop.width, Math.max(0, x));
}

/**
 * Painter's order: things further away (smaller y) are drawn first, so nearer
 * furniture overlaps them. Derived from position, never chosen by the user —
 * asking someone to manage z-order is asking them to do the renderer's job.
 */
export function sortByDepth<T extends { y: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.y - b.y);
}

/** Rotation snaps to 15°, and hard-snaps to a cardinal within 3° of one. */
export function snapRotation(deg: number, shiftHeld: boolean): number {
  const normalised = ((deg % 360) + 360) % 360;
  for (const cardinal of [0, 90, 180, 270, 360]) {
    if (Math.abs(normalised - cardinal) <= 3) return cardinal % 360;
  }
  if (!shiftHeld) return normalised;
  return (Math.round(normalised / 15) * 15) % 360;
}

/**
 * Contact-shadow geometry, in the sprite's own pixels.
 *
 * A wide, very flat ellipse under the footprint. Nearer items get a slightly
 * crisper shadow, which is what stops a row of identical smudges reading as
 * stickers.
 */
export function shadowFor(width: number, scale: number) {
  return {
    radiusX: width * 0.46,
    radiusY: width * 0.13,
    opacity: 0.3 * (0.75 + 0.25 * Math.min(1, scale)),
  };
}
