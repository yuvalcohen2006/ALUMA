import sofaCorner from "@/assets/sofa-corner.png";
import sofaMiddle from "@/assets/sofa-middle.png";
import sofaOttoman from "@/assets/sofa-ottoman.png";

/**
 * The scene builder's catalogue.
 *
 * ⚠️ PLACEHOLDER GEOMETRY. These three PNGs are the old sofa-designer's module
 * artwork, reused so the builder is testable before the real product cut-outs
 * exist. Everything below is authored to be replaced wholesale — see
 * docs/GUIDE.md Part 3 for the shot list and the cut-out spec the real assets
 * must meet.
 */

export type SceneVariant = {
  id: string;
  /** Shown on the swatch — the fabric or finish name. */
  label: string;
  src: string;
  /**
   * Optional aligned contact-shadow PNG. Hero products get a photographed one;
   * everything else falls back to the canvas-drawn ellipse, which cannot
   * reproduce the dappled shadow a rope or slatted piece actually casts.
   */
  shadowSrc?: string;
  /** Swatch colour, for the picker chip when no thumbnail exists. */
  swatch?: string;
};

export type SceneItem = {
  id: string;
  name: string;
  category: "seating" | "table" | "lounger" | "accessory";
  /** Real-world size. This is what makes the placed item the right size. */
  realWidthCm: number;
  realDepthCm: number;
  realHeightCm: number;
  /**
   * Where the sprite touches the floor, as a fraction of the image box:
   * x across, y down. This is the single most important number per sprite —
   * it becomes the Konva offset, so the node's position IS its ground contact
   * point and rotation pivots there rather than around the image centre.
   *
   * 0.5 / 1.0 means "bottom centre", correct for a straight-on elevation.
   * A three-quarter view needs it measured, which is what the Sprite
   * Calibrator (roadmap Phase 11) is for.
   */
  anchor: { x: number; y: number };
  /**
   * Every colour, fabric and finish this piece comes in. Deliberately an open
   * list — the UI reads its length, so a product with twenty fabrics needs no
   * code change, only data.
   */
  variants: SceneVariant[];
};

export const sceneItems: SceneItem[] = [
  {
    id: "corner",
    name: "יחידת פינה",
    category: "seating",
    realWidthCm: 100,
    realDepthCm: 100,
    realHeightCm: 70,
    anchor: { x: 0.5, y: 1 },
    variants: [
      { id: "charcoal", label: "פחם", src: sofaCorner, swatch: "#4a4a48" },
      { id: "sand", label: "חול", src: sofaCorner, swatch: "#cbbba4" },
      { id: "olive", label: "זית", src: sofaCorner, swatch: "#6f7355" },
    ],
  },
  {
    id: "middle",
    name: "יחידת אמצע",
    category: "seating",
    realWidthCm: 100,
    realDepthCm: 100,
    realHeightCm: 70,
    anchor: { x: 0.5, y: 1 },
    variants: [
      { id: "charcoal", label: "פחם", src: sofaMiddle, swatch: "#4a4a48" },
      { id: "sand", label: "חול", src: sofaMiddle, swatch: "#cbbba4" },
      { id: "olive", label: "זית", src: sofaMiddle, swatch: "#6f7355" },
    ],
  },
  {
    id: "ottoman",
    name: "הדום",
    category: "seating",
    realWidthCm: 100,
    realDepthCm: 100,
    realHeightCm: 40,
    anchor: { x: 0.5, y: 1 },
    variants: [
      { id: "charcoal", label: "פחם", src: sofaOttoman, swatch: "#4a4a48" },
      { id: "sand", label: "חול", src: sofaOttoman, swatch: "#cbbba4" },
      { id: "olive", label: "זית", src: sofaOttoman, swatch: "#6f7355" },
    ],
  },
];

export const getSceneItem = (id: string) => sceneItems.find((i) => i.id === id);

/**
 * A backdrop the furniture stands in.
 *
 * The four calibration numbers are what make a placed item the right size, and
 * they are real camera geometry rather than a fudge: for a level camera, an
 * object's on-screen height is proportional to how far its base sits below the
 * horizon. So
 *
 *   pixelHeight = realHeightM × pxPerMetreAtRef × (y − yHorizon)/(yRef − yHorizon)
 *
 * Move a sofa up the image and it shrinks correctly, because moving it up the
 * image IS moving it away from the camera.
 *
 * ⚠️ Both backdrops here are the site's own photography standing in for
 * purpose-shot plates, so their numbers are estimated by eye. Real backdrops
 * come with a 1-metre rod photographed at three marked spots (GUIDE.md Part
 * 3.3), which turns these four numbers from estimates into measurements.
 */
export type Backdrop = {
  id: string;
  name: string;
  src: string;
  /** Natural size of the image, in the world units the stage works in. */
  width: number;
  height: number;
  /** Y of the horizon line, in the same units. */
  yHorizon: number;
  /** A reference baseline, and the scale in effect there. */
  yRef: number;
  pxPerMetreAtRef: number;
  /** Floor region items may be dropped in: [yTop, yBottom] in world units. */
  floor: { top: number; bottom: number };
  /** Ambient colour for the scene glaze that ties sprites to the plate. */
  glaze: string;
};
