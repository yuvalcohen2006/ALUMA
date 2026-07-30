import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { Check, MessageCircle } from "lucide-react";
// Lives outside src/assets/collections/gen on purpose: everything in that
// folder is demo catalogue and must never reach production, and this photo is
// real production UI. Same picture, its own copy, so the demo gate can treat
// that whole folder as forbidden without an exception list.
import sofaPhoto from "@/assets/fabric/sofa-preview.webp";
import { SITE } from "@/config/site";
import {
  sunbrellaFabrics,
  families,
  type SunbrellaFabric,
} from "@/data/sunbrella";
import { trackPixel } from "@/lib/pixel";
import { cn } from "@/lib/utils";
import ConversionCTA from "@/components/ConversionCTA";

/** Segment labels. Hebrew-first so three of them fit one 375px row; the Latin
    family name still surfaces in the count line and in the preview caption. */
const familyLabelsHe: Record<(typeof families)[number], string> = {
  Canvas: "צבעי בסיס",
  Heritage: "מרקמים",
  Patterns: "דוגמאות ופסים",
};

/**
 * The preview photograph and the cushion geometry that belongs to it.
 *
 * The regions are hand-measured percentages that trace the cushions of THIS
 * photo — over any other image they are just rectangles floating on nothing.
 * Swapping the photo means re-measuring every region, which is why the two
 * travel as one record instead of the percentages sitting anonymously beside
 * the JSX.
 *
 * The previous photo was a Lovable CDN manifest whose URL had gone dead, so
 * this preview had been rendering a broken image with six coloured rectangles
 * floating over the gap.
 */
const sofaPreview = {
  photo: sofaPhoto,
  /* sofa-preview.webp (2400×1792, 4:3): an L-shaped sectional shot three-quarter
     from the left, in evening sun. Two masses carry cushions:
       - the FAR run, which enters at the left edge, turns at the corner block
         around the middle of the frame and carries on to the right;
       - the NEAR return arm in the lower right, whose back cushions sit lower
         and taller in frame because it is closer to the camera.
     Measured off the photograph at 2000px wide and expressed as percentages so
     the same map serves the 76px mobile thumbnail and the full desktop plate.
     The previous map stopped at 78% across and missed both the far run's last
     cushion and the right half of the near arm — on a wide plate the sofa
     recoloured on the left and stayed beige on the right. */
  regions: [
    // FAR RUN — back cushions, left of the corner
    { top: "50%", left: "14%", width: "13%", height: "9%", radius: "10px" },
    { top: "50%", left: "27%", width: "11.5%", height: "9%", radius: "10px" },
    { top: "49.5%", left: "38.5%", width: "8%", height: "9%", radius: "10px" },
    // the corner block itself
    { top: "49%", left: "46.5%", width: "8%", height: "9%", radius: "10px" },
    // FAR RUN — back cushions, right of the corner
    { top: "49.5%", left: "54.5%", width: "11.5%", height: "9.5%", radius: "10px" },
    { top: "50%", left: "66%", width: "11.5%", height: "9.5%", radius: "10px" },
    { top: "50.5%", left: "77.5%", width: "8.5%", height: "9%", radius: "10px" },
    // FAR RUN — seat cushions
    { top: "59%", left: "14%", width: "27%", height: "8.5%", radius: "10px" },
    { top: "58%", left: "41%", width: "18%", height: "8%", radius: "10px" },
    // NEAR RETURN ARM — back cushions, foreground right
    { top: "55.5%", left: "59%", width: "15%", height: "13%", radius: "10px" },
    { top: "54.5%", left: "74%", width: "11%", height: "12.5%", radius: "10px" },
    { top: "53.5%", left: "85%", width: "10%", height: "12.5%", radius: "10px" },
    // NEAR RETURN ARM — seat
    { top: "68.5%", left: "47%", width: "28%", height: "8%", radius: "10px" },
  ],
} as const;

/** The Sunbrella facts, spelled out instead of spec-sheet shorthand. */
const specFacts: { id: string; label: ReactNode }[] = [
  {
    id: "uv",
    label: (
      <>
        עמידות של יותר מ־<bdi dir="ltr">1,500</bdi> שעות{" "}
        <bdi dir="ltr">UV</bdi>
      </>
    ),
  },
  { id: "water", label: "דוחה מים וכתמים" },
  { id: "warranty", label: "חמש שנות אחריות" },
];

/**
 * The tinted sofa: photograph + the colour overlays multiplied over its
 * cushions. One construction serving both the desktop plate and the compact
 * mobile bar's thumbnail, so the two previews can never drift apart.
 */
const PreviewPhoto = ({
  fabric,
  alt = "",
  eager = false,
}: {
  fabric: SunbrellaFabric;
  alt?: string;
  eager?: boolean;
}) => (
  <div className="relative">
    <img
      src={sofaPreview.photo}
      alt={alt}
      width={1280}
      height={960}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className="block h-auto w-full"
    />
    {/* Colour overlays on the cushions */}
    {sofaPreview.regions.map((r) => (
      // Keyed on the geometry, not the index: the map is a fixed measurement of
      // one photograph, so each rectangle's own coordinates are its identity.
      <div
        key={`${r.left}-${r.top}`}
        aria-hidden
        className="absolute pointer-events-none transition-colors duration-500"
        style={{
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
          borderRadius: r.radius,
          background: fabric.background,
          mixBlendMode: "color",
          opacity: 0.88,
        }}
      />
    ))}
    {/* Subtle highlight to retain depth */}
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.18), transparent 60%)",
        mixBlendMode: "screen",
      }}
    />
  </div>
);

/**
 * The quote action, defined once so the desktop caption row and the mobile
 * flow fire the identical pixel event with the identical payload.
 */
const QuoteCta = ({
  fabric,
  href,
  className,
}: {
  fabric: SunbrellaFabric;
  href: string;
  className?: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={cn("btn-shine", className)}
    onClick={() =>
      trackPixel("InitiateCheckout", {
        content_name: `בד Sunbrella, ${fabric.nameHe}`,
        content_category: "Fabric Configurator",
        content_ids: [fabric.code],
      })
    }
  >
    הצעת מחיר בוואטסאפ
    <MessageCircle className="h-4 w-4" aria-hidden="true" />
  </a>
);

const FabricConfigurator = () => {
  const [family, setFamily] = useState<(typeof families)[number]>("Canvas");
  const [selected, setSelected] = useState<SunbrellaFabric>(
    sunbrellaFabrics[0]
  );

  const filtered = useMemo(
    () => sunbrellaFabrics.filter((f) => f.family === family),
    [family]
  );

  const waText = encodeURIComponent(
    `שלום Aluma, הייתי רוצה הצעת מחיר לספה עם בד Sunbrella: ${selected.nameHe} (${selected.code}).`
  );
  const whatsappUrl = `${SITE.whatsapp.href}?text=${waText}`;

  return (
    <Layout>
      <SEO
        title="בחרו את הבד, קונפיגורטור בדי Sunbrella לסלוני חוץ | Aluma"
        description="בחרו צבע ומרקם של בד Sunbrella וראו תצוגה מקדימה מיידית על ספת חוץ של Aluma. עשרות גוונים, עמיד UV, חיוני לריהוט גן ומרפסת."
        path="/fabric"
      />

      <PageHero
        title="בחרו את הבד"
        subtitle="לחצו על גוון מתוך מניפת Sunbrella המקורית — בד אקרילי שנצבע בצבע מלא, דוחה מים ועמיד בשמש כל השנה — וראו מיד איך הספה נראית איתו."
      />

      <section className="bg-background pt-6 pb-16 md:pt-10 md:pb-24">
        <div className="container-luxury">
          <Reveal>
            <div className="mx-auto max-w-6xl">
              {/* MOBILE — the live preview, compacted into a bar that rides
                  under the fixed header (z-40) while the swatches scroll, so
                  every tap answers on screen. The thumbnail is the same tinted
                  construction as the desktop plate, just 76px wide. */}
              <div className="sticky top-24 z-30 mb-8 lg:hidden">
                <div className="flex items-center gap-3 rounded-[14px] border border-border bg-background/95 p-2.5 shadow-soft backdrop-blur-sm">
                  <div
                    aria-hidden="true"
                    className="w-[76px] shrink-0 overflow-hidden rounded-[10px] border border-border"
                  >
                    <PreviewPhoto fabric={selected} />
                  </div>
                  <span
                    aria-hidden="true"
                    className="h-10 w-10 shrink-0 rounded-[10px] border border-border"
                    style={{ background: selected.background }}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-display text-card leading-tight text-foreground">
                      {selected.nameHe}
                    </p>
                    <p className="truncate text-meta text-muted-foreground">
                      <bdi dir="ltr">
                        {selected.name} · {selected.code}
                      </bdi>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-10 lg:grid-cols-5 xl:gap-14">
                {/* PREVIEW — first grid child, so the RIGHT column in RTL.
                    Sticky on desktop; below lg the compact bar above replaces
                    it entirely. */}
                <div className="hidden lg:block lg:col-span-3">
                  <div className="lg:sticky lg:top-28">
                    <div className="overflow-hidden rounded-[14px] border border-border bg-secondary shadow-soft">
                      <PreviewPhoto
                        fabric={selected}
                        alt="ספה מודולרית, תצוגה מקדימה לבחירת בד"
                        eager
                      />
                    </div>

                    {/* Caption row under the plate, like every framed
                        photograph on the site: Hebrew name, then the Latin
                        record in one LTR run. */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
                      <div className="min-w-0">
                        <p className="font-display text-card text-foreground">
                          {selected.nameHe}
                        </p>
                        <p className="mt-1 text-meta text-muted-foreground">
                          <bdi dir="ltr">
                            Sunbrella {selected.name} · {selected.code}
                          </bdi>
                        </p>
                      </div>
                      <QuoteCta
                        fabric={selected}
                        href={whatsappUrl}
                        className="shrink-0"
                      />
                    </div>
                  </div>
                </div>

                {/* SWATCHES — second child, the LEFT column in RTL */}
                <div className="lg:col-span-2 text-right">
                  {/* Family segmented control */}
                  {/* overflow-x-auto, not overflow-hidden: the three labels
                      measure ~291px in Assistant and a 375px phone gives the
                      column ~327px, but the stylesheet loads with
                      font-display:swap and the system fallback runs wider — for
                      that first paint, and on any device that never gets the
                      webfont, hidden would cut the third segment off with no
                      way to reach it. Auto keeps the page from scrolling and
                      still lets the control reach its own end. */}
                  <div
                    role="group"
                    aria-label="משפחות הבד"
                    className="inline-flex max-w-full overflow-x-auto overflow-y-hidden rounded-[10px] border border-border"
                  >
                    {families.map((fam) => {
                      const active = family === fam;
                      return (
                        <button
                          key={fam}
                          type="button"
                          onClick={() => setFamily(fam)}
                          aria-pressed={active}
                          className={`whitespace-nowrap border-s border-border px-3 py-2.5 text-meta transition-smooth first:border-s-0 sm:px-5 ${
                            active
                              ? "bg-foreground text-background"
                              : "text-foreground hover:bg-secondary"
                          }`}
                        >
                          {familyLabelsHe[fam]}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-4 text-meta text-muted-foreground">
                    {filtered.length} גוונים במשפחת{" "}
                    <bdi dir="ltr">{family}</bdi>
                  </p>

                  {/* Swatch grid — chip, name underneath, never a caption
                      painted over the colour itself. */}
                  <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((f) => {
                      const isActive = selected.code === f.code;
                      return (
                        <button
                          key={f.code}
                          type="button"
                          onClick={() => setSelected(f)}
                          aria-pressed={isActive}
                          aria-label={`${f.nameHe} ${f.code}`}
                          className="group text-right"
                        >
                          <span
                            className={`relative block h-12 w-full rounded-[10px] border transition-all duration-300 ${
                              isActive
                                ? "border-transparent ring-2 ring-accent"
                                : "border-border group-hover:-translate-y-0.5 group-hover:border-primary/50"
                            }`}
                            style={{ background: f.background }}
                          >
                            {/* The white halo keeps the badge legible even on
                                the terracotta chip, where an accent-on-accent
                                mark would sink. */}
                            {isActive && (
                              <span className="absolute top-1 end-1 grid h-5 w-5 place-items-center rounded-full bg-accent text-background ring-2 ring-background">
                                <Check
                                  className="h-3 w-3"
                                  strokeWidth={3}
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                          </span>
                          <span
                            className={`mt-1.5 block text-meta leading-snug ${
                              isActive
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {f.nameHe}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Hairline facts instead of three little spec boxes */}
                  <ul className="mt-9 space-y-3 border-t border-border pt-7">
                    {specFacts.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center gap-3 text-meta text-foreground"
                      >
                        <span
                          className="h-px w-6 shrink-0 bg-primary/60"
                          aria-hidden="true"
                        />
                        <span>{s.label}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-6 text-meta text-muted-foreground">
                    הצבעים על המסך הם קירוב חזותי; הגוון, המרקם והמשקל הסופיים
                    נקבעים מול המניפה הפיזית — נשמח להביא אותה אליכם לפגישה.
                  </p>

                  {/* Below lg the caption row above is gone, and with it the
                      quote action — it returns here so a phone can still ask
                      for a price without scrolling to the closing band. */}
                  <QuoteCta
                    fabric={selected}
                    href={whatsappUrl}
                    className="mt-8 lg:hidden"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <ConversionCTA
        title="מצאתם את הבד. עכשיו נביא לכם את המניפה."
        subtitle="נשלח אליכם דגימות פיזיות ונרכיב הצעה סגורה, כדי שתראו ותרגישו לפני שמחליטים."
        whatsappMessage={`היי, בחרתי את הבד ${selected.nameHe} (${selected.code}) באתר ואשמח לקבל דגימות והצעת מחיר.`}
      />
    </Layout>
  );
};

export default FabricConfigurator;
