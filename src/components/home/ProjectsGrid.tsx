import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";

import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import { projects } from "@/data/projects";

const ProjectsGrid = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: "rtl",
    align: "start",
    loop: false,
    slidesToScroll: 1,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [selected, setSelected] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
      setSelected(emblaApi.selectedScrollSnap());
      setSnaps(emblaApi.scrollSnapList());
    };
    const onScroll = () => {
      const p = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
      setProgress(p);
    };
    update();
    onScroll();
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", onScroll);
  }, [emblaApi]);

  return (
    <section className="relative py-8 md:py-32 bg-background overflow-hidden">
      {/* Header, kept inside the constrained container */}
      <div className="container-luxury relative z-10">
        <div className="text-center mb-5 md:mb-14">
          <SectionLabel
            he="עבודות נבחרות"
            en="Selected Works"
            className="text-xs text-foreground justify-center"
          />
        </div>
      </div>

      {/* Full-bleed carousel */}
      <Reveal>
        <div className="relative">
          <div className="overflow-hidden px-6 md:px-10" ref={emblaRef}>
            <div className="flex -mr-5 lg:-mr-7">
              {projects.map((p, i) => (
                <div
                  key={p.slug}
                  className="pr-5 lg:pr-7 shrink-0 grow-0 basis-[68%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <Link
                    to={`/projects/${p.slug}`}
                    className="group block relative bg-card rounded-sm overflow-hidden border border-border/40 md:border-border/60 hover:border-primary/30 shadow-none md:shadow-soft hover:shadow-luxury transition-smooth hover:-translate-y-1"
                  >
                    <div className="aspect-[4/5] relative overflow-hidden">
                      <img
                        src={p.cover}
                        alt={p.name}
                        loading={i < 4 ? "eager" : "lazy"}
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/0 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                      <div className="absolute bottom-0 inset-x-0 p-6 translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-smooth text-primary-foreground">
                        <div className="text-[11px] tracking-[0.25em] uppercase opacity-90 mb-1">
                          {p.location}
                        </div>
                        <h3 className="font-display text-xl md:text-2xl font-light">{p.name}</h3>
                      </div>
                    </div>
                    <div className="p-4 md:p-6 group-hover:opacity-0 transition-smooth">
                      <div className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
                        {p.location}
                      </div>
                      <h3 className="font-display text-lg md:text-xl lg:text-2xl font-light text-foreground">
                        {p.name}
                      </h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Side arrows, floating on the edges (desktop) */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            aria-label="הקודם"
            className="hidden md:flex absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-10 h-12 w-12 lg:h-14 lg:w-14 rounded-sm bg-background/90 backdrop-blur border border-primary/30 items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-smooth shadow-soft"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            aria-label="הבא"
            className="hidden md:flex absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-10 h-12 w-12 lg:h-14 lg:w-14 rounded-sm bg-background/90 backdrop-blur border border-primary/30 items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-smooth shadow-soft"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </Reveal>

      {/* Position indicator + mobile arrows */}
      <div className="container-luxury mt-8 md:mt-10">
        <div className="flex items-center gap-4 md:gap-6 max-w-3xl mx-auto">
          {/* Mobile prev */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            aria-label="הקודם"
            className="md:hidden h-10 w-10 shrink-0 rounded-sm border border-primary/30 flex items-center justify-center text-primary disabled:opacity-30 transition-smooth"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Progress bar */}
          <div
            className="relative flex-1 h-[2px] bg-primary/15 rounded-sm overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label="מיקום בקרוסלה"
          >
            <div
              className="absolute top-0 right-0 h-full bg-primary rounded-sm transition-[width] duration-300"
              style={{ width: `${Math.max(8, progress * 100)}%` }}
            />
          </div>

          {/* Count */}
          <div
            className="text-xs tracking-[0.25em] text-foreground tabular-nums shrink-0"
            dir="ltr"
            aria-live="polite"
          >
            {String(selected + 1).padStart(2, "0")}
            <span className="text-muted-foreground"> / {String(snaps.length || projects.length).padStart(2, "0")}</span>
          </div>

          {/* Mobile next */}
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            aria-label="הבא"
            className="md:hidden h-10 w-10 shrink-0 rounded-sm border border-primary/30 flex items-center justify-center text-primary disabled:opacity-30 transition-smooth"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary/40 rounded-sm text-primary hover:bg-primary hover:text-primary-foreground transition-smooth font-medium tracking-wide shadow-soft"
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
