/**
 * The flame beside "קולקציות חמות".
 *
 * Drawn here rather than pulled from an icon set, because every icon set's
 * flame is the same rounded cartoon and this one has to sit next to a 30px
 * display heading on a luxury catalogue without looking like a sale sticker.
 *
 * Two shapes, both symmetric about the centre line: an outer teardrop struck
 * with a single quadratic on each side into a half-circle base, and an inner
 * core built the same way at 40% scale. Symmetry is what keeps a hand-drawn
 * flame from listing to one side.
 *
 * The gradient runs between two neighbours of the brand terracotta
 * (hsl(14 47% 46%)) rather than to yellow or orange: #C96A3F is the same hue a
 * little lighter, #8E3C20 the same hue deeper. A flame that leaves the family
 * would be the loudest thing on the page.
 *
 * The id is derived from a prop so two of these on one page cannot collide on
 * the same gradient id — an SVG defs id is global to the document.
 */
const FlameMark = ({
  className,
  id = "flame",
}: {
  className?: string;
  id?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    focusable="false"
    role="presentation"
  >
    <defs>
      <linearGradient id={`${id}-body`} x1="12" y1="2" x2="12" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#C96A3F" />
        <stop offset="1" stopColor="#8E3C20" />
      </linearGradient>
      <linearGradient id={`${id}-core`} x1="12" y1="9" x2="12" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#E9A472" />
        <stop offset="1" stopColor="#C96A3F" />
      </linearGradient>
    </defs>

    {/* Outer flame: tip at 12,2 — one quadratic down each flank into a
        half-circle base of radius 6 centred at 12,15. */}
    <path
      d="M12 2 Q18 8.5 18 15 A6 6 0 0 1 6 15 Q6 8.5 12 2 Z"
      fill={`url(#${id}-body)`}
    />
    {/* Inner core, the same construction at 40%, sitting on the same base line
        so the two silhouettes stay concentric. */}
    <path
      d="M12 9.5 Q14.6 12.6 14.6 15.4 A2.6 2.6 0 0 1 9.4 15.4 Q9.4 12.6 12 9.5 Z"
      fill={`url(#${id}-core)`}
    />
  </svg>
);

export default FlameMark;
