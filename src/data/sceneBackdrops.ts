import type { Backdrop } from "./sceneItems";
import terrace from "@/assets/collections/salon-marina.jpg";
import deck from "@/assets/collections/salon-eucalyptus.jpg";
import poolside from "@/assets/collections/salon-sahara.jpg";

/**
 * The scenes furniture can be placed into.
 *
 * ⚠️ PLACEHOLDERS. These are product photographs, not purpose-shot empty
 * plates — they already contain furniture, which is exactly what a real
 * backdrop must not. They are here so the builder can be developed and tested;
 * the calibration numbers are eyeballed.
 *
 * Real backdrops (GUIDE.md Part 3.3): camera at 135cm, perfectly level, the
 * centre of the floor completely empty, floor filling the bottom 55–65% of the
 * frame — plus one extra frame per scene with a 1-metre rod standing at three
 * marked spots, which is what turns `yHorizon` / `pxPerMetreAtRef` from
 * estimates into measurements.
 */
export const backdrops: Backdrop[] = [
  {
    id: "terrace",
    name: "מרפסת אבן",
    src: terrace,
    width: 1600,
    height: 1000,
    yHorizon: 380,
    yRef: 900,
    pxPerMetreAtRef: 250,
    floor: { top: 560, bottom: 980 },
    glaze: "#c9b79a",
  },
  {
    id: "deck",
    name: "דק עץ",
    src: deck,
    width: 1600,
    height: 1000,
    yHorizon: 360,
    yRef: 900,
    pxPerMetreAtRef: 260,
    floor: { top: 540, bottom: 980 },
    glaze: "#b9a184",
  },
  {
    id: "poolside",
    name: "לצד הבריכה",
    src: poolside,
    width: 1600,
    height: 1000,
    yHorizon: 400,
    yRef: 900,
    pxPerMetreAtRef: 245,
    floor: { top: 580, bottom: 980 },
    glaze: "#a8bcc4",
  },
];

export const getBackdrop = (id: string) => backdrops.find((b) => b.id === id);
