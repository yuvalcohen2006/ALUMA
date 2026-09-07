import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
 *   rule       scaleX 0 → 1          250ms   drawn from the reading start
 *   arrow      fade + 4px forward    250ms   75ms behind the rule
 *
 * plus the siblings settling back to 58% (see .tile-grid in index.css). The
 * stagger is the point: the small type-level moves resolve well before the
 * photograph stops, so it reads as one considered gesture instead of a block.
 *
 * Every moving property is transform or opacity — nothing here can cause a
 * reflow. Everything answers to focus-visible as well as hover, because with
 * hoverOnlyWhenSupported on, hover does not fire on a touch screen at all and
 * a keyboard user would otherwise get nothing.
 *
 * Direction: logical properties, or a custom property where CSS has no logical
 * keyword — transform has neither an origin nor a translation that knows about
 * the inline axis. Tailwind's rtl:/ltr: variants are deliberately NOT used; see
 * the note on --tile-line-origin in index.css for why they are unsafe here.
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
  meta?: string | null;
  aspect?: keyof typeof ASPECT;
  /** The first tile in the first grid on a page; everything else stays lazy. */
  eager?: boolean;
};

const TileCard = ({
  to,
  image,
  alt,
  title,
  meta,
  aspect = "3/4",
  eager = false,
}: Props) => (
  /*
   * The focus ring is never suppressed here. The base layer already rings a
   * focused <a>, and the whole lockup IS the link — a ring drawn tightly around
   * only the frame would understate a target that includes the title under it.
   * Only the offset is widened, so the ring clears the photograph instead of
   * sitting on its edge.
   */
  <Link to={to} className="group block text-start focus-visible:outline-offset-4">
    {/*
      `isolate` and a radius on the <img> as well as on this box: WebKit does
      not clip a transform-scaled child to a rounded overflow-hidden ancestor,
      so without both the corners leak during the zoom on iOS only.
    */}
    <div className={`relative isolate overflow-hidden rounded-sm bg-muted ${ASPECT[aspect]}`}>
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
      <div className="flex items-baseline gap-2">
        <h3 className="text-tile text-foreground">{title}</h3>
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

      {/*
        The rule draws itself from the reading start. --tile-line-origin is set
        on [dir] in index.css because transform-origin has no logical keyword.
      */}
      <span
        aria-hidden="true"
        className="absolute -bottom-3 inset-x-0 h-px scale-x-0 bg-foreground/70
                   origin-[var(--tile-line-origin)] transition-transform duration-250 ease-hover
                   group-hover:scale-x-100 group-focus-visible:scale-x-100
                   motion-reduce:transition-none"
      />
    </div>
  </Link>
);

export default TileCard;
