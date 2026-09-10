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
   * here renders below `meta` and OUTSIDE the link, so it is not part of the
   * link's accessible name — it is detail, not identity. It was inside for a
   * while, which made every tile announce itself as "new, Aero armchair, teak,
   * from ₪12,400, 2400 × 1350".
   */
  extra?: ReactNode;
  /** What fills the frame when there is no photograph yet. */
  fallback?: ReactNode;
  /**
   * Catalogue tiles centre their type over a square photograph; editorial
   * tiles start-align it. The arrow follows whichever is chosen.
   */
  align?: "start" | "center";
  /**
   * Put the name on a white plate across the foot of the photograph instead
   * of under it.
   *
   * The plate is the page's own white (#FFFFFF) sitting on the section's
   * #F7F7F7, so it reads as a label laid on the picture rather than a caption
   * beneath it. Used by the home page's collections; everything else keeps the
   * name under the frame, where a grid of twelve needs the alignment.
   */
  nameplate?: boolean;
  /** `h2` where the tile is the page's primary list of things. */
  as?: "h2" | "h3";
  /**
   * One word under the name. Bare text, not a pill over the photograph — see
   * lib/emblems.ts for why, and cap it with capEmblems() before you get here.
   */
  emblem?: Emblem | null;
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
  nameplate = false,
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
  /*
   * The price and dimensions sit OUTSIDE the link, which is what the `extra`
   * prop's own documentation says and what the markup used to contradict.
   * Everything inside an <a> becomes part of its accessible name, so every
   * tile in the grid was announced as "new, Aero armchair, teak, from ₪12,400,
   * 2400 × 1350" — the identity buried in the middle of the detail. They are
   * still read, as ordinary text right after the link; they are just no longer
   * the link's name.
   */
  <div className={align === "center" ? "text-center" : "text-start"}>
  <Link
    to={to}
    className="group block focus-visible:outline-offset-4"
  >
    {/*
      `isolate` and a radius on the <img> as well as on this box: WebKit does
      not clip a transform-scaled child to a rounded overflow-hidden ancestor,
      so without both the corners leak during the zoom on iOS only.
    */}
    <div className={`relative isolate overflow-hidden rounded-sm bg-muted ${ASPECT[aspect]}`}>
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
        The label, on the photograph.
        A SOLID fill, not a translucent one. Over a photograph the only way to
        guarantee contrast is to stop the photograph showing through — a tinted
        pill reads differently on a pale stone terrace than on a dusk sky, and
        somewhere in the catalogue there is always a picture that beats it.
        Charcoal with white type is 13.6:1 on every photograph there will ever
        be. Never terracotta: 3.3:1, which fails in both directions.

        `start-4` and not `left-4`, so it sits at the reading start — top-right
        in Hebrew, top-left on /en — and pointer-events-none so it can never
        swallow a click meant for the tile.
      */}
      {emblem && (
        <span
          className={`pointer-events-none absolute start-4 top-4 z-10 overflow-hidden rounded-[2px] px-2.5 py-1 text-label leading-none tracking-[0.04em] ${
            emblem === "new"
              ? "bg-accent font-medium text-background"
              : "bg-foreground text-background"
          }`}
        >
          {/*
            Squared, not a pill. Every button on the site is now a full pill,
            so a pill-shaped badge reads as something you can press — and this
            one deliberately cannot be pressed. A 2px radius with a little
            tracking is the editorial flash: Farfetch, Matches and Ssense all
            square their labels for the same reason.

            "new" is the one that has to feel like something. Terracotta rather
            than charcoal — white on it measures 4.98:1, so it clears AA where
            the same fill fails under dark type — with a slow sheen crossing it
            every few seconds. The sheen is the whole trick: at 3.2 seconds and
            low contrast it is a sweep of light on a lacquered chip, and at
            anything faster it is a discount sticker. The drop shadow that used
            to sit under it is gone; a glow on a flat page is the tell.
          */}
          {emblem === "new" && (
            <span
              aria-hidden="true"
              className="emblem-sheen pointer-events-none absolute inset-0"
            />
          )}
          <span className="relative">{emblemLabel(emblem, lang)}</span>
        </span>
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

      {/*
        The plate. `z-20` puts it over the grade above, and it is deliberately
        outside the element that scales — a label that zooms with the picture
        stops reading as a label.
      */}
      {nameplate && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-background px-5 py-4">
          <Heading
            dir="auto"
            className="flex items-center gap-2 text-tile leading-none text-foreground"
          >
            {title}
            <ArrowLeft
              aria-hidden="true"
              strokeWidth={1.5}
              className="h-4 w-4 shrink-0 text-foreground opacity-0
                         rotate-[var(--tile-arrow-flip)]
                         transition-[opacity,transform] delay-75 duration-250 ease-hover
                         group-hover:translate-x-[var(--tile-arrow-travel)] group-hover:opacity-100
                         group-focus-visible:translate-x-[var(--tile-arrow-travel)]
                         group-focus-visible:opacity-100
                         motion-reduce:transition-none"
            />
          </Heading>
        </div>
      )}
    </div>

    {!nameplate && (
    <div className="relative mt-5">
      {/*
        dir="auto" with text-start, so a label lands on the side its own
        language starts from: a Latin product name ("aero", "milo") to the
        left of the line, a Hebrew collection name to the right. Without it
        every name inherited the page direction, and half the catalogue —
        which is named in Latin — sat against the wrong edge.

        The arrow lives INSIDE the heading rather than beside it. As a sibling
        flex item it was pushed to the tile's far edge the moment the name
        wrapped — which any two-word Hebrew name does in a four-column grid —
        so the cue that belongs to the last word ended up on its own out at the
        margin. Inline, it always follows the last word, wherever that lands.
      */}
      <Heading
        dir="auto"
        className={`text-tile text-foreground ${align === "center" ? "text-center" : "text-start"}`}
      >
        {title}
        <ArrowLeft
          aria-hidden="true"
          strokeWidth={1.5}
          className="ms-2 inline-block h-4 w-4 shrink-0 align-middle text-foreground opacity-0
                     rotate-[var(--tile-arrow-flip)]
                     transition-[opacity,transform] delay-75 duration-250 ease-hover
                     group-hover:translate-x-[var(--tile-arrow-travel)] group-hover:opacity-100
                     group-focus-visible:translate-x-[var(--tile-arrow-travel)]
                     group-focus-visible:opacity-100
                     motion-reduce:transition-none"
        />
      </Heading>

      {meta && (
        <p dir="auto" className="mt-1 line-clamp-1 text-start text-label text-muted-foreground">
          {meta}
        </p>
      )}
    </div>
    )}
  </Link>
  {extra}
  </div>
  );
};

export default TileCard;
