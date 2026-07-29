import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ShineButton from "@/components/ui/shine-button";
import CarouselArrow from "@/components/ui/carousel-arrow";
import { projects } from "@/data/projects";

const SLIDE_MS = 20000;

// One project at a time: editorial split — image on the right (RTL start), text on the left.
const ProjectsGrid = () => {
  const count = projects.length;
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(0);
  // ms already elapsed on the current slide — survives a pause so hovering freezes
  // the strip instead of wiping it.
  const elapsedRef = useRef(0);

  const step = useCallback(
    (dir: number) => setActive((prev) => (prev + dir + count) % count),
    [count],
  );
  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  // Reset the timer only when the slide itself changes — NOT on pause.
  useEffect(() => {
    elapsedRef.current = 0;
    setProgress(0);
  }, [active]);

  // Advance while not paused. Hovering pauses and freezes progress (elapsedRef
  // holds it); leaving resumes from exactly where it stopped rather than from 0.
  useEffect(() => {
    if (paused) return;
    const now = () => (typeof performance !== "undefined" ? performance.now() : 0);
    const start = now() - elapsedRef.current;
    const id = window.setInterval(() => {
      const elapsed = now() - start;
      elapsedRef.current = elapsed;
      const pct = Math.min(100, (elapsed / SLIDE_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        window.clearInterval(id);
        next();
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [active, paused, next]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    // RTL: forward moves leftward, so a leftward swipe (diff > 0) advances —
    // matching the left-pointing "next" arrow and the RTL progress strip.
    if (Math.abs(diff) > 50) (diff > 0 ? next : prev)();
  };

  const p = projects[active];

  return (
    <section
      dir="rtl"
      className="py-24 md:py-32 bg-background overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="container-luxury">
        <Reveal className="mb-10 md:mb-16 flex flex-col items-center">
          <SectionHeading>עבודות נבחרות</SectionHeading>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start max-w-6xl mx-auto">
          {/* IMAGE — right column in RTL, with its controls directly beneath it */}
          <div className="order-1">
            <div className="w-full max-w-[384px] mx-auto">
              <Link
                to={`/projects/${p.slug}`}
                className="block relative aspect-[4/5] rounded-[14px] overflow-hidden border border-border shadow-luxury group"
              >
                <img
                  key={`i-${active}`}
                  src={p.cover}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover animate-rise-in transition-transform duration-700 group-hover:scale-105"
                />
                {/* Same 14px radius as the photo it sits on */}
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3.5 py-1.5 rounded-[14px] text-[16px] tracking-[0.12em] text-foreground">
                  {p.area}
                </div>
              </Link>

              {/* Controls sit under the photo: prev on the right, next on the left,
                  with the progress strip running RTL so "forward" reads leftward. */}
              <div className="mt-5 flex items-center gap-2">
                <CarouselArrow direction="prev" onClick={prev} />
                <div className="flex flex-1 items-center gap-2">
                  {projects.map((proj, i) => {
                    const isActive = i === active;
                    const isBefore = i < active;
                    return (
                      <button
                        key={proj.slug}
                        type="button"
                        onClick={() => setActive(i)}
                        aria-label={`מעבר לפרויקט ${i + 1}`}
                        aria-current={isActive ? "step" : undefined}
                        // Every bar the same width and height now — the active one
                        // is marked by colour alone, not by growing.
                        className="py-2 flex-1"
                      >
                        {/* Passed bars stay full, upcoming bars stay empty. On swap the
                            inactive bars ease their fill so the change reads as a clean
                            glide; the active bar has NO transition so its 50ms progress
                            ticks stay crisp instead of lagging behind. */}
                        {/* The active track is tinted terracotta from the outset,
                            so you can see which slide you're on before any colour
                            has accumulated in it. */}
                        <span
                          className={`block w-full h-[3px] overflow-hidden rounded-full transition-colors duration-300 ${
                            isActive ? "bg-primary/30" : "bg-foreground/15"
                          }`}
                        >
                          <span
                            className={`block h-full rounded-full ${
                              isActive
                                ? "bg-primary"
                                : "bg-foreground/35 transition-[width] duration-500 ease-out"
                            }`}
                            style={{ width: isActive ? `${progress}%` : isBefore ? "100%" : "0%" }}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
                <CarouselArrow direction="next" onClick={next} />
              </div>
            </div>
          </div>

          {/* TEXT — left column in RTL, top-aligned with the photo */}
          <div className="order-2 text-center md:text-right">
            {/* min-height matches the photo (384px × 4:5 = 480px) so mt-auto drops
                the CTA level with the bottom of the image on wide screens. */}
            <div key={`t-${active}`} className="animate-rise-in flex flex-col lg:min-h-[480px]">
              {/* Even rhythm: title → tags → paragraph all separated by the same gap. */}
              <h3 className="font-display font-normal text-[22px] text-foreground leading-snug mb-5">
                {p.name}
              </h3>

              <div className="flex items-center gap-3 justify-center md:justify-start text-[18px] text-muted-foreground tracking-wide mb-5">
                <span>{p.location}</span>
                <span className="w-px h-4 bg-primary/45" aria-hidden="true" />
                <span>{p.tag}</span>
                <span className="w-px h-4 bg-primary/45" aria-hidden="true" />
                <span>{p.year}</span>
              </div>

              <p className="text-[20px] text-foreground leading-relaxed max-w-xl mx-auto md:mx-0 mb-8 text-pretty">
                {p.intro}
              </p>

              <div className="flex justify-center md:justify-start lg:mt-auto">
                <ShineButton to={`/projects/${p.slug}`}>
                  צפו בפרויקט
                  <ArrowLeft className="w-4 h-4" />
                </ShineButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsGrid;
