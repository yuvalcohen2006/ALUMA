/**
 * The flame beside "קולקציות חמות".
 *
 * Drawn here, not lifted. The client supplied a watermarked Adobe Stock
 * reference; the two-tongue flame with an inner flame cut out of it is a
 * generic icon archetype that ships in every icon set going, so this is an
 * original path in that style rather than a trace of a licensed file. Nothing
 * follows it onto a commercial site.
 *
 * PROPORTIONS ARE MEASURED, NOT EYEBALLED. Normalising the reference into this
 * 64x100 box puts the main tip at (30, 1), the notch between the tongues at
 * (48, 49), the second tongue's tip at (57, 32) and the widest point of the
 * bowl at y≈70. Earlier drafts had the second tongue too high and too far
 * left, and — the real fault — joined it with control points meeting at too
 * wide an angle to read as a point at all.
 *
 * THE INNER FLAME IS A MINIATURE OF THE OUTER. That is the thing that took
 * five drafts to see. Treated as a teardrop with a curl at its foot it reads
 * as a comma at any size; given the same structure as its parent — tall
 * tongue, notch, shorter second tongue, mirrored so the small one falls left —
 * it reads as a flame, and it still reads at 36px, which a spiral never did.
 *
 * `fill-rule="evenodd"` makes the inner flame a hole rather than a second
 * shape, so the page shows through it and the mark works on any ground.
 *
 * The gradient runs between two neighbours of the brand terracotta
 * (hsl(14 47% 46%)): #7E3319 deeper and #B85A31 lighter, climbing bottom-left
 * to top-right so the bowl reads grounded and the tips read lit. Both are
 * pitched for the #EDEDED band behind them — 7.56:1 and 3.94:1 — because an
 * earlier pair chosen against white washed out on the grey.
 *
 * The gradient id comes from a prop: an SVG defs id is global to the document,
 * so two of these on one page would otherwise collide.
 */
const OUTER_FLAME = [
  "M30 1",
  "C33 14 38 23 43 31", // right edge of the main tongue
  "C46 37 49 43 48 49", // down into the notch
  "C50 43 53 37 57 32", // back up to the second tongue, meeting at a corner
  "C60 39 63 48 63 58", // right flank
  "C63 80 49 97 32 97", // bowl, right half
  "C15 97 1 80 1 58", // bowl, left half
  "C1 45 8 33 16 24", // left flank
  "C22 17 27 9 30 1",
  "Z",
].join(" ");

const INNER_FLAME = [
  "M31 33",
  "C34 45 39 55 42 65", // right edge, widening as it falls
  "C45 77 39 89 29 89", // foot, right half
  "C20 89 14 82 14 74", // foot, left half
  "C14 68 16 62 19 57", // left flank rising into the small tongue
  "C19 62 20 66 22 69", // its notch
  "C25 60 28 45 31 33", // back up to the tip
  "Z",
].join(" ");

const FlameMark = ({
  className,
  id = "flame",
}: {
  className?: string;
  id?: string;
}) => (
  <svg
    viewBox="0 0 64 100"
    className={className}
    aria-hidden="true"
    focusable="false"
    role="presentation"
  >
    <defs>
      <linearGradient
        id={`${id}-body`}
        x1="8"
        y1="94"
        x2="58"
        y2="10"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#7E3319" />
        <stop offset="1" stopColor="#B85A31" />
      </linearGradient>
    </defs>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      fill={`url(#${id}-body)`}
      d={`${OUTER_FLAME} ${INNER_FLAME}`}
    />
  </svg>
);

export default FlameMark;
