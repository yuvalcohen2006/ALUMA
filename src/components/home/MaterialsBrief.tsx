import * as React from "react";
import { motion, AnimatePresence, useReducedMotion, type PanInfo } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { materials } from "@/data/materials";
import SectionHeading from "@/components/SectionHeading";
import ShineButton from "@/components/ui/shine-button";
import CarouselArrow from "@/components/ui/carousel-arrow";

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

// Horizontal travel per card. Kept in step with the md card width so neighbours
// sit edge-to-edge rather than drifting apart.
const CARD_OFFSET = 280;

// A 3D "focus rail": the center material is in focus, its neighbours recede.
const MaterialsBrief = () => {
  const [active, setActive] = React.useState(0);
  const [hovering, setHovering] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const reduceMotion = useReducedMotion();

  const count = items.length;
  const activeItem = items[wrap(0, count, active)];

  const prev = React.useCallback(() => setActive((p) => p - 1), []);
  const next = React.useCallback(() => setActive((p) => p + 1), []);

  // Auto-advance, pauses on hover and while focus is inside the section, and is
  // skipped entirely under prefers-reduced-motion (manual arrows/keys still work).
  // Deliberately no wheel handler: hijacking the wheel made the rail spin while
  // you were only trying to scroll past it.
  React.useEffect(() => {
    if (reduceMotion || hovering || focused) return;
    const t = window.setInterval(next, 5000);
    return () => window.clearInterval(t);
  }, [reduceMotion, hovering, focused, next]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") prev(); // RTL: right = previous
    if (e.key === "ArrowLeft") next();
  };

  const onDragEnd = (_e: unknown, { offset, velocity }: PanInfo) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    // Next now sits to the left, so dragging rightward is what pulls it in.
    if (swipe > 8000) next();
    else if (swipe < -8000) prev();
  };

  const visible = [-1, 0, 1];

  return (
    <section
      dir="rtl"
      className="relative flex w-full flex-col overflow-hidden bg-foreground text-background select-none py-20 md:py-28"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      // Focus/blur bubble in React (focusin/focusout), so this pauses the
      // autoplay while focus is anywhere inside the section — the relatedTarget
      // check keeps focus moves between inner controls from un-pausing it.
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      tabIndex={0}
      onKeyDown={onKeyDown}
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

      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 md:px-8">
        <div className="mb-14 md:mb-16 flex flex-col items-center">
          <SectionHeading light>רק החומרים הטובים בעולם</SectionHeading>
        </div>

        {/* 3D rail */}
        <motion.div
          className="relative mx-auto flex h-[300px] md:h-[380px] w-full max-w-5xl items-center justify-center [perspective:1200px] cursor-grab active:cursor-grabbing"
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
                  "absolute aspect-[4/5] w-[210px] md:w-[280px] rounded-[14px] border-t border-background/15 bg-black/30 shadow-2xl overflow-hidden",
                  isCenter ? "z-20" : "z-10",
                )}
                initial={false}
                animate={{
                  // Negated for RTL. CSS transforms don't flip with direction,
                  // so without this the *next* material sat to the right — the
                  // side a Hebrew reader expects the *previous* one on, making
                  // the arrows feel backwards.
                  x: -offset * CARD_OFFSET,
                  z: -dist * 180,
                  scale: isCenter ? 1 : 0.85,
                  rotateY: offset * 22,
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
                  draggable={false}
                  className="h-full w-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Info + controls */}
        <div className="mx-auto mt-10 md:mt-12 flex w-full max-w-4xl flex-col items-center justify-between gap-6 md:flex-row-reverse pointer-events-auto">
          <div className="flex flex-1 flex-col items-center text-center md:items-end md:text-right min-h-[11rem] justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <span className="block text-[18px] font-medium tracking-[0.15em] text-secondary">
                  {activeItem.meta}
                </span>
                <h3 className="font-display font-normal text-[22px] text-background leading-snug">
                  {activeItem.title}
                </h3>
                <p className="max-w-md text-[20px] text-background/75 leading-relaxed text-pretty">
                  {activeItem.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-2">
              <CarouselArrow direction="prev" onClick={prev} invert />
              <CarouselArrow direction="next" onClick={next} invert />
            </div>

            <ShineButton to={activeItem.href} invert>
              לצפייה בחומר
              <ArrowLeft className="h-4 w-4" />
            </ShineButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MaterialsBrief;
