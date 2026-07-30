import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ShineButton from "@/components/ui/shine-button";
import lightMorning from "@/assets/home/light/light-morning.webp";
import lightGolden from "@/assets/home/light/light-golden.webp";
import lightNight from "@/assets/home/light/light-night.webp";

/**
 * THE LIGHT BAND — the site's signature moment.
 *
 * One terrace, photographed three times: morning, golden hour, evening. A sun
 * you drag along a shallow arc over the sky crossfades between them, so the
 * page argues the brand's own point — the name comes from light, and light is
 * what an outdoor space is actually made of — by demonstration rather than copy.
 *
 * ── Why the control is a real <input type="range"> ──
 * Keyboard (arrows / Home / End), touch, pointer capture during a drag and the
 * whole slider role in the accessibility tree all come free from the platform.
 * Nothing here re-implements any of it.
 *
 * ── Why the sun is a sibling and not ::-webkit-slider-thumb ──
 * A native thumb can only ever travel a straight line, and the sun has to ride
 * an arc. The alternative — moving the input itself up and down per value — puts
 * the hit target in motion under the user's finger mid-drag. So the input is a
 * transparent full-box hit target and the disc is painted next to it: the user
 * still grabs a sun and drags it, and the semantics are untouched.
 *
 * ── Direction ──
 * The input is forced to dir="ltr" so the value→x mapping is identical in every
 * browser instead of depending on each engine's RTL slider handling. The DAY
 * then runs right→left, the way Hebrew reads, by inverting the value: the
 * rightmost position is morning, the leftmost is evening.
 */

/** Time of day, 0 = morning · 0.5 = golden hour · 1 = evening. */
const timeOf = (value: number) => (100 - value) / 100;

/**
 * The arc, as a share of the control box height: 100% at both feet, 50% at the
 * apex. This is the exact parabola of the quadratic path drawn underneath
 * (M0,100 Q50,0 100,100 has x linear in its parameter), so the disc sits on the
 * line at every single position rather than near it.
 */
const arcTop = (value: number) => {
  const p = value / 100;
  return 100 * (1 - 2 * p * (1 - p));
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Nearest of the three stills — what the slider announces and what is lit below. */
const zoneOf = (t: number) => (t < 0.25 ? 0 : t < 0.75 ? 1 : 2);

const ZONES = ["בוקר", "שעת זהב", "ערב"];

const LightBand = () => {
  // Opens on the golden hour: the best frame of the three, and it puts the sun
  // at the top of the arc where there is somewhere to go in both directions.
  const [value, setValue] = useState(50);
  const [reducedMotion, setReducedMotion] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const t = timeOf(value);
  const zone = zoneOf(t);

  /* The three stills are stacked and REVEALED rather than cross-dissolved: the
     morning frame stays fully opaque underneath, golden fades in over the first
     half of the day and evening over the second. Two overlapping layers whose
     opacities both sit at 0.5 would let the frame behind them show through and
     dip the whole picture; this way the stack is always fully covered. */
  const goldenOpacity = clamp01(t * 2);
  const nightOpacity = clamp01((t - 0.5) * 2);

  // User-driven, not autoplay — so reduced motion only drops the easing. The
  // picture still changes, it just arrives at once.
  const fade = reducedMotion ? "" : "transition-opacity duration-300 ease-out";

  const frame = "absolute inset-0 h-full w-full object-cover";

  // Full section padding on top, where sand meets warm white, and a shorter
  // skirt underneath: the category rail below is the same sand, so a second
  // full gap there would just be a field of empty beige.
  return (
    <section className="pt-24 md:pt-32 pb-16 md:pb-20 bg-secondary">
      <div className="container-luxury">
        <Reveal className="mb-14 md:mb-16 flex flex-col items-center">
          {/* Charcoal, not terracotta: this heading sits on sand beige. */}
          <SectionHeading
            tone="charcoal"
            subtitle="השם שלנו מגיע מהאור, והאור הוא החומר האמיתי שממנו עשוי כל מרחב חוץ."
          >
            אלומה. על שם האור.
          </SectionHeading>
        </Reveal>

        <Reveal>
          <div className="mx-auto max-w-4xl">
            <div className="relative">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[14px] border border-foreground/10 bg-foreground/5 shadow-luxury">
                {/* One scene, three times of day. The stack is announced once,
                    as a single picture; the frames themselves are silent. */}
                <div
                  className="absolute inset-0"
                  role="img"
                  aria-label="מרפסת אלומה עם סלון חוץ ושולחן אש מול הים, מאור הבוקר דרך שעת הזהב ועד הערב"
                >
                  <img
                    src={lightMorning}
                    alt=""
                    aria-hidden="true"
                    width={1600}
                    height={893}
                    loading="lazy"
                    decoding="async"
                    className={frame}
                  />
                  <img
                    src={lightGolden}
                    alt=""
                    aria-hidden="true"
                    width={1600}
                    height={893}
                    loading="lazy"
                    decoding="async"
                    className={`${frame} ${fade}`}
                    style={{ opacity: goldenOpacity }}
                  />
                  <img
                    src={lightNight}
                    alt=""
                    aria-hidden="true"
                    width={1600}
                    height={893}
                    loading="lazy"
                    decoding="async"
                    className={`${frame} ${fade}`}
                    style={{ opacity: nightOpacity }}
                  />
                </div>
              </div>

              {/* The sky. Deliberately a sibling of the frame rather than a child
                  of it, so the disc and its focus ring are never clipped by the
                  frame's rounded overflow at the two ends of the arc. */}
              <div className="absolute inset-x-[7%] top-[8%] h-[26%]">
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full text-background/55"
                  style={{ filter: "drop-shadow(0 1px 2px hsl(0 0% 0% / 0.35))" }}
                >
                  {/* non-scaling-stroke: the viewBox is stretched to the box, and
                      without this the hairline would stretch with it. */}
                  <path
                    d="M0 100 Q50 0 100 100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* Deliberately NOT appearance-none: WebKit drops the thumb
                    entirely the moment a range input loses its native
                    appearance without a styled ::-webkit-slider-thumb to
                    replace it. The element is invisible because it is
                    transparent, not because it has been un-styled — so drag,
                    click-to-position and keyboard all stay exactly as the
                    platform ships them. */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  dir="ltr"
                  aria-label="שעת היום"
                  aria-valuetext={ZONES[zone]}
                  // pan-y keeps a vertical swipe scrolling the page: this strip
                  // lies across the top of a full-width photo on a phone.
                  style={{ touchAction: "pan-y" }}
                  className="peer absolute inset-0 m-0 h-full w-full cursor-grab opacity-0 active:cursor-grabbing"
                />

                {/* Two elements on purpose: the focus ring is a Tailwind ring
                    (a box-shadow) and the sun's glow is an inline box-shadow,
                    and inline styles win — on one element the ring would never
                    render. Outer carries the ring, inner carries the sun. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute rounded-full ring-background/90 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-transparent"
                  style={{
                    left: `${value}%`,
                    top: `${arcTop(value)}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span
                    className="block h-7 w-7 rounded-full md:h-8 md:w-8"
                    style={{
                      background:
                        "radial-gradient(circle at 34% 30%, hsl(44 96% 84%), hsl(32 88% 64%) 58%, hsl(20 68% 48%))",
                      boxShadow:
                        "0 0 0 5px hsl(38 92% 66% / 0.20), 0 0 22px 7px hsl(34 90% 62% / 0.38)",
                    }}
                  />
                </span>
              </div>
            </div>

            {/* Morning on the right, evening on the left — the day runs the way
                the page reads. Inset by the same 7% as the arc, so each mark
                sits under the slider position it names. */}
            <div className="mt-4 flex items-baseline justify-between px-[7%] text-meta">
              {ZONES.map((label, i) => (
                <span
                  key={label}
                  // Colour only, and never below --muted-foreground: an opacity
                  // step would look right and read at about 3.4:1 on sand, which
                  // is under the floor for 18px text.
                  className={i === zone ? "text-foreground" : "text-muted-foreground"}
                >
                  {label}
                </span>
              ))}
            </div>

            <p className="mt-5 text-center text-meta text-muted-foreground">
              גררו את השמש לאורך הקשת, מהבוקר ועד הערב.
            </p>

            <div className="mt-9 flex justify-center">
              <ShineButton to="/story">
                הסיפור מאחורי השם
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </ShineButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default LightBand;
