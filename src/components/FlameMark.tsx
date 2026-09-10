/**
 * The flame beside "קולקציות חמות".
 *
 * The silhouette is loading.io's `fire` icon (slug 5xrfpc). Its own metadata
 * declares `<d:license>free</d:license>`, which is Loading.io's LD-FREE tier:
 * "dedicated to the public domain by waiving all our right worldwide under
 * copyright law … No attribution is required." So it carries no obligation
 * onto a commercial site — worth recording, because the same library also
 * ships BY-licensed icons that would.
 *
 * What is ours is the colour. The original is flat #e15b64, a pink-leaning
 * red that fights the brand; this runs a gradient between two neighbours of
 * Aluma's terracotta (hsl(14 47% 46%)) — #C96A3F, the same hue lighter, and
 * #8E3C20, the same hue deeper. It climbs from bottom-left to top-right so the
 * mass reads grounded and the curl reads lit, and the two stops stay close
 * enough that at 24px it is one warm mark with depth rather than two colours.
 *
 * The gradient id comes from a prop: an SVG defs id is global to the document,
 * so two of these on one page would otherwise collide.
 */
const FlameMark = ({
  className,
  id = "flame",
}: {
  className?: string;
  id?: string;
}) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    aria-hidden="true"
    focusable="false"
    role="presentation"
  >
    <defs>
      <linearGradient
        id={`${id}-body`}
        x1="28"
        y1="92"
        x2="78"
        y2="12"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#8E3C20" />
        <stop offset="1" stopColor="#C96A3F" />
      </linearGradient>
    </defs>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      fill={`url(#${id}-body)`}
      d="M24.6 79.4C21.4 74 20 67.2 21.8 61.1c1.7-5.6 5.5-10.4 9.3-14.7 4.2-4.9 8.9-9.6 11.5-15.6 3.2-7.4 2.7-16.3-1.3-23.3 2.2 2.1 5.2 3 7.9 4.3 5.7 2.7 10.5 7.5 12.8 13.4 2.3 5.9 2 12.8-1.2 18.3-3.6 6.3-11.1 10.2-12.3 17.8-.4 2.9.6 6.2 3.3 7.5.9.4 1.9.6 2.9.6 3.8-.1 7.3-2.6 9.5-5.8 3.8-5.3 3.8-10.9 2.9-17.1 1.7.4 3.6 2.8 4.7 4.1 5.2 5.9 8.9 15.4 6.5 23.2-1.6 5-5.1 9.3-9.3 12.4-8.5 6.3-20.1 8-30 4.4-6-2-11.2-5.9-14.4-11.2z"
    />
  </svg>
);

export default FlameMark;
