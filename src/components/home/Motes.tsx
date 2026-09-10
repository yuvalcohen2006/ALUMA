import type { CSSProperties } from "react";

/**
 * Dust in a shaft of light.
 *
 * The band is about light meeting matter and the photograph is a beam through
 * a prism, so the air around it is the one place on this site where a moving
 * decoration is saying something rather than filling space.
 *
 * The brief was "almost unfelt unless really looked at", which is a
 * specification, not a mood — so the numbers are the whole design:
 *
 *   OPACITY 0.05–0.14. At 3px on white that is a mote you notice only once
 *   your eye has stopped moving. Anything at 0.25 becomes a dotted background.
 *
 *   TRAVEL 8–22px over 17–31 SECONDS. Roughly a pixel a second. Slow enough
 *   that you cannot catch one moving; long enough that the field is never
 *   twice the same when you look back.
 *
 *   ALTERNATE, not loop. A looping translate snaps home at the end of every
 *   cycle, and a snap is exactly the thing that would draw the eye.
 *
 * Every value is fixed rather than random: a field that reshuffles on each
 * render is a field that flickers on every re-render of the page.
 *
 * Transform and opacity only, so this never leaves the compositor, and the
 * whole thing is inert under `prefers-reduced-motion` — the dots stay, they
 * simply stop. Positioned with `inset-inline-start`, so the field mirrors
 * along with the layout on /en instead of sitting on the wrong side.
 */
type Mote = {
  /** % from the reading start, and % from the top. */
  x: number;
  y: number;
  /** px */
  size: number;
  /** resting and drifted opacity */
  from: number;
  to: number;
  /** px of travel */
  dx: number;
  dy: number;
  /** seconds */
  duration: number;
  delay: number;
  warm?: boolean;
};

const MOTES: Mote[] = [
  { x: 4, y: 22, size: 3, from: 0.1, to: 0.05, dx: 12, dy: -14, duration: 23, delay: 0 },
  { x: 11, y: 64, size: 2, from: 0.07, to: 0.13, dx: -9, dy: -18, duration: 29, delay: 3 },
  { x: 17, y: 12, size: 4, from: 0.06, to: 0.11, dx: 16, dy: 9, duration: 26, delay: 7 },
  { x: 23, y: 82, size: 3, from: 0.11, to: 0.05, dx: -13, dy: -11, duration: 21, delay: 1 },
  { x: 31, y: 38, size: 2, from: 0.08, to: 0.14, dx: 10, dy: 16, duration: 31, delay: 5 },
  { x: 38, y: 71, size: 5, from: 0.05, to: 0.09, dx: -15, dy: -8, duration: 27, delay: 9 },
  { x: 44, y: 18, size: 3, from: 0.09, to: 0.05, dx: 8, dy: 20, duration: 19, delay: 2 },
  { x: 52, y: 55, size: 2, from: 0.06, to: 0.12, dx: -11, dy: 13, duration: 33, delay: 6 },
  { x: 59, y: 88, size: 3, from: 0.1, to: 0.06, dx: 14, dy: -16, duration: 24, delay: 11 },
  { x: 66, y: 29, size: 4, from: 0.07, to: 0.12, dx: -8, dy: 18, duration: 28, delay: 4 },
  { x: 74, y: 61, size: 2, from: 0.12, to: 0.06, dx: 17, dy: 10, duration: 22, delay: 8 },
  { x: 81, y: 15, size: 3, from: 0.05, to: 0.1, dx: -12, dy: 15, duration: 30, delay: 13 },
  { x: 88, y: 77, size: 3, from: 0.09, to: 0.05, dx: 9, dy: -19, duration: 17, delay: 10 },
  { x: 94, y: 43, size: 2, from: 0.07, to: 0.13, dx: -14, dy: 12, duration: 25, delay: 15 },
  // Two warm ones, picking up the spectrum in the photograph. Any more and it
  // stops being dust and starts being confetti.
  { x: 27, y: 50, size: 3, from: 0.09, to: 0.05, dx: 11, dy: -13, duration: 20, delay: 12, warm: true },
  { x: 69, y: 47, size: 2, from: 0.06, to: 0.12, dx: -10, dy: 14, duration: 32, delay: 6, warm: true },
];

const Motes = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    {MOTES.map((m, i) => (
      <span
        key={i}
        className="mote"
        style={
          {
            insetInlineStart: `${m.x}%`,
            top: `${m.y}%`,
            width: `${m.size}px`,
            height: `${m.size}px`,
            background: m.warm
              ? "hsl(var(--accent))"
              : "hsl(var(--foreground))",
            "--mote-from": m.from,
            "--mote-to": m.to,
            "--mote-dx": `${m.dx}px`,
            "--mote-dy": `${m.dy}px`,
            "--mote-duration": `${m.duration}s`,
            "--mote-delay": `${m.delay}s`,
          } as CSSProperties
        }
      />
    ))}
  </div>
);

export default Motes;
