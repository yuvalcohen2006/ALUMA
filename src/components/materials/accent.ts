/**
 * Every material carries an `accent` sampled off the material itself in its own
 * photo (see src/data/materials.ts) — the sand of the weave, the graphite of
 * the frame, the grey of the stone.
 *
 * Two of those four are dark by nature: the aluminium accent sits at 34%
 * lightness, the granite at 47%. On the charcoal materials page they simply
 * disappear — a 2px rule at 34% lightness on an 18% background is invisible.
 * So nothing on that page uses the raw value. Rules, check marks and the
 * backlight all run through `lift`, which keeps the hue and the saturation
 * (aluminium stays cool, Sunbrella stays warm) and only raises the lightness to
 * a floor that actually reads on dark.
 */

interface Hsl {
  h: number;
  s: number;
  l: number;
}

/**
 * Pulls the three numbers out of the string and rebuilds it, so both the modern
 * `hsl(38 44% 64%)` and the legacy `hsl(38, 44%, 64%)` forms keep working — and
 * so the alpha we append is always valid space-separated syntax, which mixing
 * an alpha into a comma-form string would not be.
 */
const parse = (color: string): Hsl | null => {
  const nums = color.match(/-?\d*\.?\d+/g);
  if (!nums || nums.length < 3) return null;
  const [h, s, l] = nums.map(Number);
  if ([h, s, l].some(Number.isNaN)) return null;
  return { h, s, l };
};

/**
 * `lift(accent, 66)` → the same colour, never darker than 66% lightness.
 * `lift(accent, 66, 0.3)` → the same, at 30% alpha.
 * Anything unparseable falls through untouched rather than throwing.
 */
export const lift = (color: string, minL: number, alpha = 1): string => {
  const hsl = parse(color);
  if (!hsl) return color;
  const l = Math.min(Math.max(hsl.l, minL), 100);
  return alpha >= 1
    ? `hsl(${hsl.h} ${hsl.s}% ${l}%)`
    : `hsl(${hsl.h} ${hsl.s}% ${l}% / ${alpha})`;
};
