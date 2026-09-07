import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { emblemLabel, type Emblem } from "@/lib/emblems";
import { useLocalizedPath } from "@/lib/useLocalizedPath";

/**
 * One tile: a photograph, a name under it, and a hover that is choreographed
 * rather than announced.
 *
 * The old hover was `group-hover:opacity-90` on the image — fading a photograph
 * toward whatever happened to be behind it, which is both the cheapest gesture
 * available and, on a page whose background had just changed, a different
 * colour on every section. Four things move here instead, on a stagger:
 *
 *   image      scale 1.03            600ms   the slowest, so it settles last
 *   grade      opacity 0 → 1         400ms   gives the zoom something to move against
 *   arrow      fade + 4px forward    250ms
 *
 * plus the siblings settling back to 58% (see .tile-grid in index.css). The
 * stagger is the point: the small moves resolve well before the photograph
 * stops, so it reads as one considered gesture instead of a block.
 *
 * A rule used to draw itself under the title as well, and it came out: with the
 * siblings already dimming and an arrow already arriving, a fourth signal on the
 * same gesture was one too many. Three things saying "this one" is emphasis.
 *
 * Every moving property is transform or opacity — nothing here can cause a
 * reflow. Everything answers to focus-visible as well as hover, because with
 * hoverOnlyWhenSupported on, hover does not fire on a touch screen at all and
 * a keyboard user would otherwise get nothing.
 *
 * Direction: logical properties, or a custom property where CSS has no logical
 * keyword — transform has neither an origin nor a translation that knows about
 * the inline axis. Tailwind's rtl:/ltr: variants are deliberately NOT used; see
 * the note on --tile-arrow-travel in index.css for why they are unsafe here.
 */

const ASPECT = {
  "3/4": "aspect-[3/4]",
  "4/5": "aspect-[4/5]",
  "3/2": "aspect-[3/2]",
  square: "aspect-square",
} as const;

type Props = {
  to: string;
  image?: string | null;
  /** Empty string for a photograph that adds nothing the title has not said. */
  alt: string;
  title: string;
  meta?: ReactNode;
  aspect?: keyof typeof ASPECT;
  /** The first tile in the first grid on a page; everything else stays lazy. */
  eager?: boolean;
  /**
   * Product tiles carry a price and a size under the name. Anything passed
   * here sits below `meta` and above the rule, and is not part of the link's
   * accessible name — it is detail, not identity.
   */
  extra?: ReactNode;
  /** What fills the frame when there is no photograph yet. */
  fallback?: ReactNode;
  /**
   * Catalogue tiles centre their type over a square photograph; editorial
   * tiles start-align it. The rule and arrow follow whichever is chosen.
   */
  align?: "start" | "center";
  /** `h2` where the tile is the page's primary list of things. */
  as?: "h2" | "h3";
  /**
   * One word under the name. Bare text, not a pill over the photograph — see
   * lib/emblems.ts for why, and cap it with capEmblems() before you get here.
   */
  emblem?: Emblem | null;
  /**
   * Dissolves the photograph toward the end of the row, for the last tile in a
   * preview strip. Lands on the image frame only: a mask clips its element's
   * focus ring, so it must never reach the <a>.
   */
  fade?: boolean;
};

const TileCard = ({
  to,
  image,
  alt,
  title,
  meta,
  aspect = "3/4",
  eager = false,
  extra,
  fallback,
  align = "start",
  as: Heading = "h3",
  emblem = null,
  fade = false,
}: Props) => {
  const { lang } = useLocalizedPath();
  return (
  /*
   * The focus ring is never suppressed here. The base layer already rings a
   * focused <a>, and the whole lockup IS the link — a ring drawn tightly around
   * only the frame would understate a target that includes the title under it.
   * Only the offset is widened, so the ring clears the photograph instead of
   * sitting on its edge.
   */
  <Link
    to={to}
    className={`group block focus-visible:outline-offset-4 ${
      align === "center" ? "text-center" : "text-start"
    }`}
  >
    {/*
      `isolate` and a radius on the <img> as well as on this box: WebKit does
      not clip a transform-scaled child to a rounded overflow-hidden ancestor,
      so without both the corners leak during the zoom on iOS only.
    */}
    <div
      className={`relative isolate overflow-hidden rounded-sm bg-muted ${ASPECT[aspect]} ${
        fade ? "tile-fade" : ""
      }`}
    >
      {!image && fallback}
      {image && (
        <img
          src={image}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full rounded-sm object-cover transition-transform duration-600 ease-hover
                     group-hover:scale-[1.03] group-focus-visible:scale-[1.03]
                     motion-reduce:transition-none motion-reduce:group-hover:scale-100
                     motion-reduce:group-focus-visible:scale-100"
        />
      )}

      {/*
        A grade, not an overlay. It weights the bottom of the frame so the zoom
        has something to move against; at 20% black over the lowest third it is
        below the threshold of looking like a scrim.
      */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 ease-hover
                   group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        style={{
          background:
            "linear-gradient(to top, rgb(0 0 0 / 0.20) 0%, rgb(0 0 0 / 0.06) 32%, transparent 62%)",
        }}
      />
    </div>

    <div className="relative mt-5">
      <div
        className={`flex items-baseline gap-2 ${align === "center" ? "justify-center" : ""}`}
      >
        <Heading className="text-tile text-foreground">{title}</Heading>
        <ArrowLeft
          aria-hidden="true"
          strokeWidth={1.5}
          className="h-4 w-4 shrink-0 self-center text-foreground opacity-0
                     rotate-[var(--tile-arrow-flip)]
                     transition-[opacity,transform] delay-75 duration-250 ease-hover
                     group-hover:translate-x-[var(--tile-arrow-travel)] group-hover:opacity-100
                     group-focus-visible:translate-x-[var(--tile-arrow-travel)]
                     group-focus-visible:opacity-100
                     motion-reduce:transition-none"
        />
      </div>

      {meta && <p className="mt-1 line-clamp-1 text-label text-muted-foreground">{meta}</p>}
      {extra}

      {/*
        Last inside the link, which is where Net-a-Porter puts it and why it
        needs no scrim: nothing sits over the photograph, so nothing has to win
        a contrast fight with it. Charcoal at normal weight against the muted
        metadata above — differentiated by colour and position, not by a box.
        Never terracotta: it measures 3.3:1 on white and fails AA in every
        direction.
      */}
      {emblem && (
        <p className="mt-1.5 text-label text-foreground">{emblemLabel(emblem, lang)}</p>
      )}
    </div>
  </Link>
  );
};

export default TileCard;
