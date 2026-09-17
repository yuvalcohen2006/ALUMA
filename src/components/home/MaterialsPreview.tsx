import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import Reveal from "@/components/Reveal";
import { useMaterials, materialName, materialTagline } from "@/hooks/useMaterials";
import { useLocalizedPath } from "@/lib/useLocalizedPath";

/**
 * The materials, small, as a strip you slide.
 *
 * Deliberately the quietest section on the page. Everything above it is a
 * grid of large photographs, and the club below is a full photograph of its
 * own — a fifth band of big tiles here would make the bottom of the page a
 * wall. So each material is a swatch and two lines, laid in a row that runs
 * off the edge: the part-card at the end is what says "there is more", and
 * it is a thing a thumb already knows how to do.
 *
 * The arrows exist for a mouse, which cannot swipe, and they disappear when
 * the row fits — four swatches on a wide screen need no controls, and a
 * control that does nothing is worse than none.
 *
 * Scrolling is the browser's own, with scroll-snap, rather than a carousel
 * library transforming a track: keyboard, trackpad, touch and screen readers
 * all simply work, and RTL is the browser's problem rather than ours.
 */
const MaterialsPreview = () => {
  const { to, lang } = useLocalizedPath();
  const { t } = useTranslation("home");
  const { materials } = useMaterials();
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    // scrollLeft runs 0 → negative in a right-to-left row, so compare sizes.
    const travelled = Math.abs(el.scrollLeft);
    const room = el.scrollWidth - el.clientWidth;
    setEdges({ start: travelled <= 2, end: travelled >= room - 2 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  /** One card forward (1) or back (-1), in reading order. */
  const step = (direction: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const rtl = getComputedStyle(el).direction === "rtl";
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap) * (rtl ? -1 : 1),
      behavior: still ? "auto" : "smooth",
    });
  };

  const fits = edges.start && edges.end;
  // In Hebrew "forward" is leftward, so the chevrons swap with the language.
  const BackIcon = lang === "he" ? ChevronRight : ChevronLeft;
  const ForwardIcon = lang === "he" ? ChevronLeft : ChevronRight;
  const arrow =
    "grid h-12 w-12 place-items-center rounded-full border border-foreground/30 text-foreground transition-colors duration-200 hover:border-foreground hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30";

  return (
    <section className="bg-background" aria-labelledby="materials-preview-title">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-20 lg:px-16">
        <div className="flex items-end justify-between gap-6">
          <Reveal>
            <h2
              id="materials-preview-title"
              className="text-start text-heading font-normal tracking-normal text-foreground"
            >
              {t("materials.title")}
            </h2>
          </Reveal>

          <div className="flex shrink-0 items-center gap-5">
            <Link
              to={to("/materials")}
              className="text-small text-foreground underline decoration-1 underline-offset-[6px] transition-colors hover:text-accent"
            >
              {t("materials.all")}
            </Link>
            {!fits && (
              <div className="hidden gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  disabled={edges.start}
                  aria-label={t("materials.prev")}
                  className={arrow}
                >
                  <BackIcon aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  disabled={edges.end}
                  aria-label={t("materials.next")}
                  className={arrow}
                >
                  <ForwardIcon aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/*
          Bleeds to the screen edge below md, so a card slides out from under
          the edge of the phone rather than being clipped at the gutter; the
          scroll padding puts the first card back on the gutter when snapped.
          The scrollbar is hidden because the cut card and the arrows already
          say this moves, and a bar under four swatches is visual noise.
        */}
        <ul
          ref={track}
          role="list"
          className="-mx-5 mt-8 flex snap-x snap-mandatory scroll-px-5 gap-6 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:mt-10 md:scroll-px-0 md:gap-8 md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {materials.map((m, i) => {
            const name = materialName(m, lang);
            const tagline = materialTagline(m, lang);
            return (
              <li key={m.slug} className="w-[78%] shrink-0 snap-start sm:w-[360px]">
                <Reveal delay={i * 60}>
                  <Link
                    to={to(`/materials#${m.slug}`)}
                    className="group flex items-center gap-5"
                  >
                    <div className="relative isolate h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-muted sm:h-32 sm:w-32">
                      <img
                        src={m.thumb}
                        alt=""
                        width={320}
                        height={320}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-600 ease-hover group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-start">
                      {/* The arrow rides inside the name, as on the tiles, so it
                          costs the name no width. */}
                      <h3 dir="auto" className="text-tile leading-tight text-foreground">
                        {name}
                        <ArrowLeft
                          aria-hidden="true"
                          strokeWidth={1.5}
                          className="ms-2 inline-block h-4 w-4 align-middle text-foreground opacity-0 rotate-[var(--tile-arrow-flip)] transition-[opacity,transform] duration-250 ease-hover group-hover:translate-x-[var(--tile-arrow-travel)] group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                        />
                      </h3>
                      <p dir="auto" className="mt-1.5 line-clamp-2 text-small text-foreground-soft">
                        {tagline}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default MaterialsPreview;
