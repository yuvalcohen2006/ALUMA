// Modular sofa units catalog.
// All modules are a fixed 1m × 1m footprint.

import cornerImg from "@/assets/sofa-corner.png";
import middleImg from "@/assets/sofa-middle.png";
import ottomanImg from "@/assets/sofa-ottoman.png";

export type SofaUnitType = "corner-right" | "corner-left" | "middle" | "ottoman";

export type SofaUnit = {
  id: string;
  type: SofaUnitType;
  name: string;
  nameHe: string;
  widthCm: number;
  depthCm: number;
  image?: string;
  mirrored?: boolean; // renders image with scaleX(-1) by default
};

export const SOFA_UNITS: SofaUnit[] = [
  {
    id: "corner-right",
    type: "corner-right",
    name: "Right Corner",
    nameHe: "פינה ימין",
    widthCm: 100,
    depthCm: 100,
    image: cornerImg,
  },
  {
    id: "corner-left",
    type: "corner-left",
    name: "Left Corner",
    nameHe: "פינה שמאל",
    widthCm: 100,
    depthCm: 100,
    image: cornerImg,
    mirrored: true,
  },
  {
    id: "middle",
    type: "middle",
    name: "Middle Unit",
    nameHe: "אמצע",
    widthCm: 100,
    depthCm: 100,
    image: middleImg,
  },
  {
    id: "ottoman",
    type: "ottoman",
    name: "Ottoman",
    nameHe: "הדום",
    widthCm: 100,
    depthCm: 100,
    image: ottomanImg,
  },
];

export const getUnit = (id: string) => SOFA_UNITS.find((u) => u.id === id);
