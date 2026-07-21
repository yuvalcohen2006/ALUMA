import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import { materials } from "@/data/materials";

const MaterialsBrief = () => {
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
    <section className="relative py-8 md:py-32 bg-background text-foreground overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 w-[28rem] h-[28rem] rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[28rem] h-[28rem] rounded-full bg-primary/5 blur-3xl" />

      <div className="container-luxury relative z-10">
        <div className="text-center mb-5 md:mb-14">
          <SectionLabel
            he="החומרים שלנו"
            en="Our Materials"
            className="text-xs text-primary justify-center mb-3 md:mb-4"
          />
          <h2 className="font-display text-xl sm:text-3xl md:text-5xl font-light sm:font-semibold leading-tight">
            רק החומרים
            <span className="italic"> הטובים בעולם</span>
          </h2>
        </div>
      </div>

      <Reveal>
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -mr-5 lg:-mr-7">
              {materials.map((m, i) => (
                <div
                  key={m.slug}
                  className="pr-5 lg:pr-7 shrink-0 grow-0 basis-[64%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <Link
                    to={`/materials/${m.slug}`}
                    className="group block relative bg-card rounded-sm overflow-hidden border border-border/60 hover:border-primary/30 shadow-soft hover:shadow-luxury transition-smooth hover:-translate-y-1"
                  >
                    <div className="aspect-[4/5] relative overflow-hidden">
                      <img
                        src={m.image}
                        alt={`${m.name} — ${m.tagline} | Aluma`}
                        loading={i < 4 ? "eager" : "lazy"}
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/0 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                      <div className="absolute bottom-0 inset-x-0 p-6 translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-smooth text-primary-foreground">
                        <h3 className="font-display text-xl md:text-2xl">{m.name}</h3>
                      </div>
                    </div>
                    <div className="p-6 group-hover:opacity-0 transition-smooth">
                      <h3 className="font-display text-lg md:text-2xl text-primary">
                        {m.name}
                      </h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Side arrows */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            aria-label="הקודם"
            className="hidden md:flex absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-10 h-12 w-12 lg:h-14 lg:w-14 rounded-full bg-background/90 backdrop-blur border border-primary/30 items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-smooth shadow-soft"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            aria-label="הבא"
            className="hidden md:flex absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-10 h-12 w-12 lg:h-14 lg:w-14 rounded-full bg-background/90 backdrop-blur border border-primary/30 items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-smooth shadow-soft"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </Reveal>

      <div className="container-luxury mt-10 md:mt-14">
        <div className="text-center">
          <Link
            to="/materials"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary/40 rounded-sm text-primary hover:bg-primary hover:text-primary-foreground transition-smooth font-medium tracking-wide shadow-soft"
          >
            לכל החומרים שלנו
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MaterialsBrief;
