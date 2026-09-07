/**
 * The arithmetic behind the crop dialog, kept away from the DOM so it can be
 * tested rather than eyeballed.
 *
 * The model is the one every CMS crop tool that non-designers use has settled
 * on: a FIXED window, and the photograph moves underneath it. The alternative —
 * dragging a rectangle around a fixed photograph — asks the person to think
 * about two objects at once, and every tool aimed at shop staff rather than
 * retouchers (Squarespace, Wix, Craft, Shopify's focal point) hides the
 * rectangle entirely.
 *
 * One invariant holds everywhere below: the photograph always covers the
 * window. There is no state in which a corner of the crop is empty, which means
 * there is no state that exports a transparent edge, and no error message is
 * ever needed to explain one.
 *
 * Coordinates: `tx`/`ty` are the offset of the image's top-left corner from the
 * window's top-left corner, in CSS pixels, and are therefore zero or negative.
 * They are physical, not logical — the photograph does not flip when the
 * interface language does.
 */

export type CropView = {
  /** Multiplier over the scale at which the image exactly covers the window. */
  zoom: number;
  tx: number;
  ty: number;
};

export type Size = { w: number; h: number };

/** The scale at which the image exactly covers the window — zoom 1. */
export function coverScale(image: Size, window: Size): number {
  return Math.max(window.w / image.w, window.h / image.h);
}

/** The image's on-screen size at a given zoom. */
export function displaySize(image: Size, window: Size, zoom: number): Size {
  const s = coverScale(image, window) * zoom;
  return { w: image.w * s, h: image.h * s };
}

/**
 * Pull an offset back inside the range where the image still covers the window.
 *
 * The max() guards the degenerate case where rounding leaves the displayed size
 * a hair under the window: without it the range inverts and the image jumps.
 */
export function clampOffset(tx: number, ty: number, display: Size, window: Size): { tx: number; ty: number } {
  const minX = Math.min(0, window.w - display.w);
  const minY = Math.min(0, window.h - display.h);
  return {
    tx: Math.min(0, Math.max(minX, tx)),
    ty: Math.min(0, Math.max(minY, ty)),
  };
}

/** The offset that centres the image in the window. */
export function centeredOffset(display: Size, window: Size): { tx: number; ty: number } {
  return { tx: (window.w - display.w) / 2, ty: (window.h - display.h) / 2 };
}

/**
 * The rectangle of the ORIGINAL image that the window is showing.
 *
 * This is the only thing the export needs: drawImage takes it as the source
 * rectangle and the output size as the destination, so the whole crop is one
 * call and the canvas is never larger than the file being produced.
 */
export function sourceRect(
  view: CropView,
  image: Size,
  window: Size,
): { sx: number; sy: number; sw: number; sh: number } {
  const s = coverScale(image, window) * view.zoom;
  return {
    sx: -view.tx / s,
    sy: -view.ty / s,
    sw: window.w / s,
    sh: window.h / s,
  };
}

/**
 * Re-centre a zoom on the window's middle instead of the image's corner.
 *
 * Without this, zooming walks the subject toward a corner: the transform origin
 * is the top-left, so scaling up pushes everything down and to one side and the
 * person has to drag it back after every scroll.
 */
export function zoomAbout(
  view: CropView,
  image: Size,
  window: Size,
  nextZoom: number,
  focus: { x: number; y: number } = { x: window.w / 2, y: window.h / 2 },
): CropView {
  const before = coverScale(image, window) * view.zoom;
  const after = coverScale(image, window) * nextZoom;
  const ratio = after / before;
  const tx = focus.x - (focus.x - view.tx) * ratio;
  const ty = focus.y - (focus.y - view.ty) * ratio;
  const display = displaySize(image, window, nextZoom);
  return { zoom: nextZoom, ...clampOffset(tx, ty, display, window) };
}

/**
 * Offsets as 0-100, for the two range inputs.
 *
 * The sliders are not a convenience. Pointer dragging is the only way to
 * operate a crop surface otherwise, which fails WCAG 2.5.7 (all dragging must
 * have a single-pointer alternative) and leaves the control unusable from a
 * keyboard. 50 means centred; an axis with no slack reports 50 and does
 * nothing, which is honest — there is nothing to move.
 */
export function offsetToPercent(view: CropView, image: Size, window: Size): { x: number; y: number } {
  const display = displaySize(image, window, view.zoom);
  const slackX = display.w - window.w;
  const slackY = display.h - window.h;
  return {
    x: slackX <= 0 ? 50 : (-view.tx / slackX) * 100,
    y: slackY <= 0 ? 50 : (-view.ty / slackY) * 100,
  };
}

export function percentToOffset(
  percent: { x: number; y: number },
  image: Size,
  window: Size,
  zoom: number,
): { tx: number; ty: number } {
  const display = displaySize(image, window, zoom);
  const slackX = display.w - window.w;
  const slackY = display.h - window.h;
  return {
    tx: slackX <= 0 ? (window.w - display.w) / 2 : -(percent.x / 100) * slackX,
    ty: slackY <= 0 ? (window.h - display.h) / 2 : -(percent.y / 100) * slackY,
  };
}

/**
 * How far the crop can be zoomed before the export starts inventing pixels.
 *
 * At zoom 1 the window maps to some number of source pixels; the output is a
 * fixed size, so once the source rectangle is smaller than the output the
 * result is an upscale. Rather than refuse the photograph, the dialog allows a
 * little past that point and says so — a slightly soft crop of the right
 * subject beats a sharp crop of the wrong one.
 */
export function maxUsefulZoom(image: Size, window: Size, output: Size): number {
  const s = coverScale(image, window);
  const sourceAtZoom1 = window.w / s;
  return Math.max(1, sourceAtZoom1 / output.w);
}

/** Whether the current view is upscaling, i.e. the export will be soft. */
export function isUpscaling(view: CropView, image: Size, window: Size, output: Size): boolean {
  return sourceRect(view, image, window).sw < output.w;
}
