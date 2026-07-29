import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Material } from "@/data/materials";
import { lift } from "./accent";

interface MaterialBandProps {
  material: Material;
  /** Position in the list — decides which side the photograph sits on. */
  index: number;
}

/**
 * One material, one full-width band.
 *
 * Three things carry it. The photograph takes half the band and alternates
 * sides down the page. The band's own interior is that same photograph blurred
 * down to nothing but its colour, so each one is tinted by the material inside
 * it instead of every card sharing one flat grey. And behind the band sits a
 * wash of the material's colour bleeding past its edges — the charcoal page has
 * depth rather than four panels floating on an empty canvas.
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

  // Ink for the decorative pieces only — the rule, the check marks, the
  // underline. Not for text: lifted to 66% these accents still measure around
  // 3:1 against the band's interior, which clears the bar for graphics but not
  // for 18px copy, so every word on the band stays warm white.
  const ink = lift(material.accent, 66);
  const rule = lift(material.accent, 66, 0.85);

  // THE BACKLIGHT, half one. A halo in the material's colour that traces the
  // band's own outline and pools under it, as if the band were lit from behind.
  //
  // This is a box-shadow rather than another layer for two reasons. It follows
  // the rounded rectangle exactly, so it still reads on a phone, where the band
  // is 335px wide and over 1000px tall and any radial gradient large enough to
  // escape it would be a thin vertical ellipse hidden behind the card. And a
  // box-shadow is ink overflow: it can bleed as far sideways as it likes without
  // ever adding a pixel of scrollable width at 375px.
  //
  // It replaces the usual hover:shadow-luxury, which is a charcoal shadow — on a
  // charcoal page there is nothing there to see.
  const glow = (a: number, b: number) =>
    `0 34px 90px -26px ${lift(material.accent, 58, a)}, 0 0 70px -6px ${lift(
      material.accent,
      58,
      b
    )}`;

  const vars = {
    "--mat-edge": lift(material.accent, 66, 0.28),
    "--mat-edge-strong": lift(material.accent, 66, 0.62),
    // Pool first, halo second. Kept deliberately under the strength where the
    // pool starts reading as a light source of its own rather than as the band
    // sitting on something.
    "--mat-glow": glow(0.45, 0.18),
    "--mat-glow-strong": glow(0.58, 0.26),
  } as CSSProperties;

  // Half two: a wider, directional wash centred on the photo side, so the light
  // reads as coming off the material rather than from a lamp behind the card.
  // closest-side with the last stop at 100% means it is already fully
  // transparent by the edge of its own box — the layer can never end on a
  // visible line.
  const wash = `radial-gradient(closest-side at ${
    photoRight ? "68%" : "32%"
  } 50%, ${lift(material.accent, 56, 0.26)}, ${lift(
    material.accent,
    56,
    0.14
  )} 42%, transparent 100%)`;

  return (
    <div className="group relative isolate" style={vars}>
      {/* The wash. Its horizontal inset stays inside the container's own padding
          at every breakpoint (16px of 20px, 24px of 24px, 40px of 48px) so it
          cannot push the page sideways either; the vertical inset is where the
          spill really is, and it is sized to land inside the section's own
          bottom padding rather than washing into the footer. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-4 -inset-y-16 md:-inset-x-6 md:-inset-y-24 lg:-inset-x-10 opacity-90 transition-opacity duration-700 ease-out group-hover:opacity-100 group-focus-within:opacity-100"
        style={{ background: wash }}
      />

      <Link
        to={`/materials/${material.slug}`}
        // The global a:active press would shrink the whole band; at this size it
        // reads as a layout jolt rather than feedback. The lift carries it.
        className="relative block overflow-hidden rounded-[14px] border border-[color:var(--mat-edge)] shadow-[shadow:var(--mat-glow)] transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:border-[color:var(--mat-edge-strong)] group-hover:shadow-[shadow:var(--mat-glow-strong)] active:transform-none"
      >
        {/* THE BAND'S OWN GROUND — the material's photograph, blurred past
            recognition and knocked back hard.

            All four photographs are bright outdoor scenes — even the aluminium
            one is a sunlit terrace — so the dimming is set for the brightest of
            them, the Sunbrella weave: at 35% under a 70–80% charcoal scrim it
            composites to roughly 9% luminance, which leaves warm-white copy at
            about 6.8:1 and the softest tone on the band (the italic
            descriptions at 70%) at about 5:1. The other three land lower still,
            so no band is ever the bright one.

            scale-150 keeps the blur's own soft edge outside the card instead of
            drawing a grey vignette inside it, at 375px as well as at 1400. */}
        <div aria-hidden="true" className="absolute inset-0">
          <img
            src={material.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full scale-150 object-cover opacity-35 blur-[56px] saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/70 to-foreground/80" />
        </div>

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
                "absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-foreground/65",
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
            <p className="text-[18px] leading-snug text-background/65">
              {material.origin}
            </p>

            {/* font-normal is not decoration: the base stylesheet sets h2 to
                weight 300, and every other card title on the site (Projects,
                the home materials rail) opts back up to 400. Without it this
                one name would be the only light-weight title on the page. */}
            <h2 className="font-display font-normal text-[26px] leading-snug text-background mt-3">
              {material.name}
            </h2>

            {/* The section divider, in this material's own colour rather than
                the shared white — the one place the accent gets to speak. */}
            <div
              className="w-20 h-[2px] mt-4"
              style={{ backgroundColor: rule }}
              aria-hidden="true"
            />

            <p className="text-[20px] leading-relaxed text-background/80 text-pretty mt-5 max-w-xl">
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
                    <p className="text-[18px] font-normal leading-snug text-background">
                      {f.title}
                    </p>
                    <p className="text-[18px] italic leading-snug text-background/70 mt-1">
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
              <span className="inline-flex items-center gap-2 text-[18px] text-background/85">
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
