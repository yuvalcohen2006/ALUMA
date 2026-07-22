import * as React from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { materials } from "@/data/materials";

const items = materials.map((m) => ({
  id: m.slug,
  title: m.name,
  description: m.shortDesc,
  imageSrc: m.image,
  meta: m.origin,
  href: `/materials/${m.slug}`,
}));

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

const BASE_SPRING = { type: "spring", stiffness: 300, damping: 30, mass: 1 } as const;
const TAP_SPRING = { type: "spring", stiffness: 450, damping: 18, mass: 1 } as const;

// A 3D "focus rail": the center material is in focus, its neighbours recede.
const MaterialsBrief = () => {
  const [active, setActive] = React.useState(0);
  const [hovering, setHovering] = React.useState(false);
  const lastWheel = React.useRef(0);

  const count = items.length;
  const activeItem = items[wrap(0, count, active)];

  const prev = React.useCallback(() => setActive((p) => p - 1), []);
  const next = React.useCallback(() => setActive((p) => p + 1), []);

  const onWheel = React.useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - lastWheel.current < 400) return;
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = horizontal ? e.deltaX : e.deltaY;
      if (Math.abs(delta) > 20) {
        delta > 0 ? next() : prev();
        lastWheel.current = now;
      }
    },
    [next, prev],
  );

  // Auto-advance, pauses on hover
  React.useEffect(() => {
    if (hovering) return;
    const t = window.setInterval(next, 5000);
    return () => window.clearInterval(t);
  }, [hovering, next]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") prev(); // RTL: right = previous
    if (e.key === "ArrowLeft") next();
  };

  const onDragEnd = (_e: unknown, { offset, velocity }: PanInfo) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -8000) next();
    else if (swipe > 8000) prev();
  };

  const visible = [-1, 0, 1];

  return (
    <section
      dir="rtl"
      className="relative flex h-[540px] md:h-[620px] w-full flex-col overflow-hidden bg-foreground text-background outline-none select-none"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onWheel={onWheel}
      aria-label="החומרים שלנו"
    >
      {/* Ambient blurred backdrop of the active material */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`bg-${activeItem.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img src={activeItem.imageSrc} alt="" className="h-full w-full object-cover blur-3xl saturate-150" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/60 to-foreground/30" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 md:px-8 pt-10">
        <div className="text-center mb-4">
          <p className="text-[11px] md:text-xs tracking-[0.4em] uppercase text-secondary mb-2">
            החומרים שלנו
          </p>
          <h2 className="font-display text-2xl md:text-4xl font-light text-background">
            רק החומרים הטובים בעולם
          </h2>
        </div>

        {/* 3D rail */}
        <motion.div
          className="relative mx-auto flex h-[240px] md:h-[320px] w-full max-w-5xl items-center justify-center [perspective:1200px] cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={onDragEnd}
        >
          {visible.map((offset) => {
            const absIndex = active + offset;
            const item = items[wrap(0, count, absIndex)];
            const isCenter = offset === 0;
            const dist = Math.abs(offset);

            return (
              <motion.div
                key={absIndex}
                className={cn(
                  "absolute aspect-[4/5] w-[190px] md:w-[250px] rounded-sm border-t border-background/15 bg-black/30 shadow-2xl overflow-hidden",
                  isCenter ? "z-20" : "z-10",
                )}
                initial={false}
                animate={{
                  x: offset * 250,
                  z: -dist * 180,
                  scale: isCenter ? 1 : 0.85,
                  rotateY: offset * -22,
                  opacity: isCenter ? 1 : 0.35,
                  filter: `blur(${isCenter ? 0 : dist * 4}px) brightness(${isCenter ? 1 : 0.5})`,
                }}
                transition={{ default: BASE_SPRING, scale: TAP_SPRING }}
                style={{ transformStyle: "preserve-3d" }}
                onClick={() => offset !== 0 && setActive((p) => p + offset)}
              >
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Info + controls */}
        <div className="mx-auto mt-8 md:mt-12 flex w-full max-w-4xl flex-col items-center justify-between gap-5 md:flex-row-reverse pointer-events-auto">
          <div className="flex flex-1 flex-col items-center text-center md:items-end md:text-right h-28 justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <span className="block text-[11px] font-medium uppercase tracking-[0.25em] text-secondary">
                  {activeItem.meta}
                </span>
                <h3 className="font-display text-2xl md:text-3xl font-light text-background">
                  {activeItem.title}
                </h3>
                <p className="max-w-md text-sm text-background/70 leading-relaxed">
                  {activeItem.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-sm bg-background/10 p-1 ring-1 ring-background/15 backdrop-blur-md">
              <button
                onClick={prev}
                className="rounded-sm p-2.5 text-background/60 transition hover:bg-background/10 hover:text-background active:scale-95"
                aria-label="הקודם"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="min-w-[42px] text-center text-xs tabular-nums text-background/50" dir="ltr">
                {wrap(0, count, active) + 1} / {count}
              </span>
              <button
                onClick={next}
                className="rounded-sm p-2.5 text-background/60 transition hover:bg-background/10 hover:text-background active:scale-95"
                aria-label="הבא"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>

            <Link
              to={activeItem.href}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent active:scale-95"
            >
              לצפייה בחומר
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MaterialsBrief;
