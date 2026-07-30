// Modular sofa units catalog.
// Real footprints per unit type (cm): corner 90×90, middle 80×90, ottoman 70×70.

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
    widthCm: 90,
    depthCm: 90,
    image: cornerImg,
  },
  {
    id: "corner-left",
    type: "corner-left",
    name: "Left Corner",
    nameHe: "פינה שמאל",
    widthCm: 90,
    depthCm: 90,
    image: cornerImg,
    mirrored: true,
  },
  {
    id: "middle",
    type: "middle",
    name: "Middle Unit",
    nameHe: "אמצע",
    widthCm: 80,
    depthCm: 90,
    image: middleImg,
  },
  {
    id: "ottoman",
    type: "ottoman",
    name: "Ottoman",
    nameHe: "הדום",
    widthCm: 70,
    depthCm: 70,
    image: ottomanImg,
  },
];

export const getUnit = (id: string) => SOFA_UNITS.find((u) => u.id === id);
