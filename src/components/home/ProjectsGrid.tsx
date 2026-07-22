import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import { projects } from "@/data/projects";

const SLIDE_MS = 6000;

// One project at a time: editorial split — text on the right (RTL), image on the left.
const ProjectsGrid = () => {
  const count = projects.length;
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(0);

  const step = useCallback(
    (dir: number) => setActive((prev) => (prev + dir + count) % count),
    [count],
  );
  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  // Auto-advance + progress, restarts whenever the slide changes; pauses on hover.
  useEffect(() => {
    setProgress(0);
    if (paused) return;
    const start =
      typeof performance !== "undefined" ? performance.now() : 0;
    const id = window.setInterval(() => {
      const elapsed =
        (typeof performance !== "undefined" ? performance.now() : start) - start;
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
    // RTL: swipe left (diff > 0) → previous, swipe right → next
    if (Math.abs(diff) > 50) (diff > 0 ? prev : next)();
  };

  const p = projects[active];

  return (
    <section
      className="py-16 md:py-28 bg-background overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="container-luxury">
        <Reveal className="text-center mb-10 md:mb-16">
          <SectionLabel he="עבודות נבחרות" className="text-xs md:text-sm justify-center" />
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center max-w-6xl mx-auto">
          {/* TEXT — right column in RTL */}
          <div className="order-2 md:order-1 text-center md:text-right">
            <div key={`t-${active}`} className="animate-rise-in">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-5 text-primary">
                <span className="h-px w-8 bg-primary/60" />
                <span className="text-sm tracking-[0.3em] tabular-nums" dir="ltr">
                  {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </span>
              </div>

              <h3 className="font-display text-3xl md:text-5xl font-light text-primary leading-tight mb-3">
                {p.name}
              </h3>

              <div className="text-xs md:text-sm tracking-[0.28em] uppercase text-muted-foreground mb-6">
                {p.location} · {p.tag} · {p.year}
              </div>

              <p className="text-foreground leading-relaxed max-w-md mx-auto md:mx-0 mb-8">
                {p.intro}
              </p>

              <div className="flex items-center gap-3 justify-center md:justify-start">
                <Link
                  to={`/projects/${p.slug}`}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm font-medium tracking-wide hover:bg-accent transition-smooth"
                >
                  צפו בפרויקט
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="הקודם"
                  className="h-11 w-11 rounded-sm border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-smooth"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="הבא"
                  className="h-11 w-11 rounded-sm border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-smooth"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* IMAGE — left column in RTL */}
          <div className="order-1 md:order-2">
            <Link
              to={`/projects/${p.slug}`}
              className="block relative aspect-[4/5] rounded-sm overflow-hidden border border-border shadow-luxury group"
            >
              <img
                key={`i-${active}`}
                src={p.cover}
                alt={p.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover animate-rise-in transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-sm text-[11px] tracking-[0.2em] uppercase text-foreground">
                {p.area}
              </div>
            </Link>
          </div>
        </div>

        {/* Progress segments — one per project */}
        <div className="flex items-center gap-2 justify-center mt-10 max-w-md mx-auto" dir="ltr">
          {projects.map((proj, i) => (
            <button
              key={proj.slug}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`מעבר לפרויקט ${i + 1}`}
              className="group flex-1 py-2"
            >
              <span className="block h-[3px] w-full bg-primary/20 overflow-hidden rounded-sm">
                <span
                  className="block h-full bg-primary transition-[width] duration-100 ease-linear"
                  style={{ width: i === active ? `${progress}%` : i < active ? "100%" : "0%" }}
                />
              </span>
            </button>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 border border-primary/50 rounded-sm text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-smooth font-medium tracking-wide"
          >
            לכל הפרויקטים
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProjectsGrid;
