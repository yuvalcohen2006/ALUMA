import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Material } from "@/data/materials";

interface MaterialBandProps {
  material: Material;
  /** Position in the list — decides which side the photograph sits on. */
  index: number;
}

/**
 * One material, one full-width band.
 *
 * Same band as before, on a light page. What the dark version needed to stop
 * four panels floating on a black canvas — a coloured glow behind each card, a
 * radial wash bleeding past its edges, and the photograph blurred into a tinted
 * interior — all existed to give charcoal some depth. On warm white they are
 * worse than unnecessary: a coloured glow on a light background reads as a
 * printing fault. A hairline border and the photograph carry it instead.
 *
 * The material's own accent survives, and now it can be used at full strength:
 * on a light ground it no longer has to be lifted to stay visible.
 *
 * The whole band is one link and one tab stop, and deliberately carries no
 * aria-label: an aria-label on a container link replaces the name computed from
 * its contents, which would hide the description and the four qualities from
 * screen readers — the only part of this page worth reading aloud.
 */
const MaterialBand = ({ material, index }: MaterialBandProps) => {
  // RTL: the first DOM child of a grid lands at the RIGHT edge. The first band
  // therefore puts the photo first (right), the next one orders it second
  // (left), and so on. Below lg the grid collapses and DOM order takes over, so
  // every band on a phone opens with its photograph.
  const photoRight = index % 2 === 0;

  // Decoration only — the rule, the check marks, the underline. Never text:
  // these accents are sampled off the photographs and several sit near 3:1 on
  // warm white, which clears the bar for graphics and not for 18px copy.
  const ink = material.accent;
  const rule = material.accent;

  return (
    <div className="group relative">
      <Link
        to={`/materials/${material.slug}`}
        // The global a:active press would shrink the whole band; at this size it
        // reads as a layout jolt rather than feedback. The lift carries it.
        className="relative block overflow-hidden rounded-[14px] border border-border bg-background transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:border-primary/60 group-hover:shadow-luxury active:transform-none"
      >
        {/* `relative` so the content paints over the absolutely-positioned
            ground above rather than under it.

            The copy side is the wider of the two: it carries the four qualities
            in two columns, and an even split left those columns around 190px
            each at 1024, where the descriptions started stacking four and five
            lines deep.

            The track sizes have to follow the photo, not the position: `order`
            moves the children between the tracks but the tracks stay put, so a
            single fixed 0.9fr/1.3fr handed the wide half to the photograph on
            every band that flips. Both literals are spelled out in full so
            Tailwind can see them. */}
        <div
          className={cn(
            "relative grid items-stretch",
            photoRight
              ? "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]"
              : "lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]"
          )}
        >
          {/* PHOTOGRAPH */}
          <div
            className={cn(
              "relative min-h-[220px] sm:min-h-[280px] lg:min-h-[400px] overflow-hidden",
              photoRight ? "lg:order-1" : "lg:order-2"
            )}
          >
            <img
              src={material.image}
              // Just the name. The whole band is one link, so this alt is read
              // as part of the link's own name — a " | Aluma" suffix there is
              // noise announced before the heading that says the same thing.
              alt={material.name}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              // 600ms is set as an arbitrary property rather than as an
              // arbitrary `duration` value: tailwindcss-animate claims that
              // same prefix for animation-duration, so an arbitrary value is
              // ambiguous and Tailwind drops the class without failing.
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.06]"
            />
            {/* Charcoal fade on the edge the copy sits against, so the photo
                dissolves into the band instead of butting up to the text on a
                hard line. Bottom edge on a phone (copy below), inner edge from
                lg up (copy beside) — same stops, only the direction changes. */}
            <div
              aria-hidden="true"
              className={cn(
                "absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90",
                photoRight ? "lg:bg-gradient-to-l" : "lg:bg-gradient-to-r"
              )}
            />
          </div>

          {/* COPY */}
          <div
            className={cn(
              "relative flex flex-col justify-center p-7 sm:p-9 lg:p-11 xl:p-14 text-right",
              photoRight ? "lg:order-2" : "lg:order-1"
            )}
          >
            <p className="text-[18px] leading-snug text-muted-foreground">
              {material.origin}
            </p>

            {/* font-normal is not decoration: the base stylesheet sets h2 to
                weight 300, and every other card title on the site (Projects,
                the home materials rail) opts back up to 400. Without it this
                one name would be the only light-weight title on the page. */}
            <h2 className="font-display font-normal text-[26px] leading-snug text-primary mt-3">
              {material.name}
            </h2>

            {/* The section divider, in this material's own colour rather than
                the shared white — the one place the accent gets to speak. */}
            <div
              className="w-20 h-[2px] mt-4"
              style={{ backgroundColor: rule }}
              aria-hidden="true"
            />

            <p className="text-[20px] leading-relaxed text-foreground-soft text-pretty mt-5 max-w-xl">
              {material.shortDesc}
            </p>

            {/* Two columns from sm up. In one column the four qualities ran the
                band to nearly 750px tall and left the photograph beside a
                column of air. */}
            <ul className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {material.features.map((f) => (
                <li key={f.title} className="flex flex-row items-start gap-3">
                  <Check
                    className="w-4 h-4 mt-1.5 shrink-0"
                    style={{ color: ink }}
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-[18px] font-normal leading-snug text-foreground">
                      {f.title}
                    </p>
                    <p className="text-[18px] italic leading-snug text-muted-foreground mt-1">
                      {f.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* self-start pins this to the inline start — the RIGHT edge in RTL
                — and keeps the rule as wide as the words rather than as wide as
                the column. The rule grows from the right, the way every link
                underline on the site does. */}
            <span className="mt-9 self-start">
              <span className="inline-flex items-center gap-2 text-[18px] text-foreground">
                לצפייה בחומר
                <ArrowLeft
                  className="w-[18px] h-[18px] transition-transform duration-300 ease-out group-hover:-translate-x-1"
                  aria-hidden="true"
                />
              </span>
              <span
                aria-hidden="true"
                className="block h-px w-0 transition-[width] duration-500 ease-out group-hover:w-full"
                style={{ backgroundColor: rule }}
              />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MaterialBand;
