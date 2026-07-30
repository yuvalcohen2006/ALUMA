import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductGalleryProps {
  /** Cover first, then the other angles. May be empty. */
  images: string[];
  /** Product name, used for alt text and the lightbox's accessible name. */
  name: string;
  /**
   * view-transition-name for the main image, paired with the same name on the
   * catalogue cell this page was opened from.
   */
  transitionName: string;
}

const prefersReduced = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The media half of the product page.
 *
 * Desktop is a single large plate with the other angles stacked beside it;
 * phones get a snap carousel with position dots, because a 375px column cannot
 * carry a plate and a thumbnail rail at once. Both open the same lightbox.
 *
 * RTL: the main plate is the FIRST flex child, so it sits hard against the
 * container's right edge, in line with the breadcrumb above it. The thumbnail
 * column follows it inward, between the plate and the product panel.
 */
const ProductGallery = ({ images, name, transitionName }: ProductGalleryProps) => {
  const [active, setActive] = useState(0);
  const [slide, setSlide] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const count = images.length;

  const openAt = useCallback((i: number) => {
    setZoomed(i);
    setOpen(true);
  }, []);

  const step = useCallback(
    (delta: number) => setZoomed((i) => (i + delta + count) % count),
    [count]
  );

  /**
   * Which slide is under the phone carousel's centre. Measured in viewport
   * coordinates rather than from scrollLeft: in RTL the scroll offset runs
   * negative, and the sign of it differs between engines and versions.
   */
  const readSlide = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const centre = box.left + box.width / 2;
    let best = 0;
    let bestDistance = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const r = (child as HTMLElement).getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - centre);
      if (d < bestDistance) {
        bestDistance = d;
        best = i;
      }
    });
    setSlide(best);
  }, []);

  const goToSlide = (i: number) => {
    const child = trackRef.current?.children[i] as HTMLElement | undefined;
    child?.scrollIntoView({
      behavior: prefersReduced() ? "instant" : "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  // Arrow keys walk the lightbox. RTL: forward is leftward, so ArrowLeft
  // advances and ArrowRight goes back — the same direction the on-screen
  // arrows point. Escape is Radix's own.
  useEffect(() => {
    if (!open || count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, count, step]);

  if (count === 0) {
    return (
      // Named too: a product with no photograph still has a sand 4:3 frame in
      // the catalogue, and this is the same frame — the pair holds, it just
      // morphs an empty plate into an empty plate instead of dropping the
      // transition on exactly the products that look worst without one.
      <div
        className="grid aspect-[4/3] place-items-center rounded-[14px] border border-border bg-secondary text-meta text-muted-foreground"
        style={{ viewTransitionName: transitionName }}
      >
        התמונות של {name} בדרך
      </div>
    );
  }

  return (
    <>
      {/* ===== PHONE: snap carousel =====
          The bleed matches container-luxury's own padding (px-5 → sm:px-6)
          exactly, or the scroller overhangs the viewport at 375px. */}
      <div className="lg:hidden">
        <div
          ref={trackRef}
          onScroll={readSlide}
          className="rail-scroll -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-6 sm:px-6"
        >
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => openAt(i)}
              aria-label={`הגדלת תמונה ${i + 1}`}
              className="w-[86%] shrink-0 snap-center sm:w-[62%]"
            >
              {/* THE SHARED ELEMENT (phones). The name goes on the FRAME, never
                  on the <img> inside it: a view-transition snapshot ignores its
                  ancestors' clipping, so naming the image captures a square,
                  borderless photo that pops into a rounded plate on the last
                  frame. Same construction as ProductCell's cell. */}
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-[14px] border border-border bg-secondary"
                style={i === 0 ? { viewTransitionName: transitionName } : undefined}
              >
                <img
                  src={img}
                  alt={`${name}, תמונה ${i + 1}`}
                  width={1600}
                  height={1200}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </button>
          ))}
        </div>

        {count > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2.5">
            {images.map((img, i) => (
              <button
                key={`dot-${img}-${i}`}
                type="button"
                onClick={() => goToSlide(i)}
                aria-label={`מעבר לתמונה ${i + 1}`}
                aria-current={slide === i ? "true" : undefined}
                // 32px tap target around a 8px dot: the dot itself is the
                // painted child, the button is the reach.
                className="grid h-8 w-8 place-items-center rounded-[10px]"
              >
                <span
                  aria-hidden="true"
                  className={`block h-2 rounded-full transition-all duration-300 ease-out ${
                    slide === i ? "w-6 bg-primary" : "w-2 bg-foreground/25"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== DESKTOP: plate + thumbnail column ===== */}
      <div className="hidden gap-4 lg:flex">
        <button
          type="button"
          onClick={() => openAt(active)}
          aria-label={`הגדלת התמונה של ${name}`}
          className="group relative block min-w-0 flex-1 cursor-zoom-in rounded-[14px] transition-shadow duration-500 ease-out hover:shadow-luxury"
        >
          {/* THE SHARED ELEMENT (desktop). It is the FRAME that carries the
              name — the element that owns the radius, the border and the
              overflow clip — never the zoom layer or the <img> inside it: a
              snapshot ignores clipping from its ancestors, so naming anything
              deeper captures a square, borderless photo already scaled to 1.06
              (you are hovering when you click), bursting out of the plate on the
              first frame. Mirrors ProductCell exactly, which is the other half
              of this pair. */}
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-[14px] border border-border bg-secondary transition-colors duration-500 ease-out group-hover:border-primary/60"
            style={{ viewTransitionName: transitionName }}
          >
            {/* Zoom on the wrapper, never the <img> — scaling the image drags
                the border and the radius with it in some engines. */}
            <div className="absolute inset-0 transition-transform duration-600 ease-out group-hover:scale-[1.06]">
              <img
                src={images[active]}
                alt={`${name}, תמונה ${active + 1}`}
                width={1600}
                height={1200}
                loading="eager"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Physical `left-4` on purpose: this is a positioned overlay, not
              flow content, so it must not become a logical property. */}
          <span className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-[10px] bg-background/90 px-3.5 py-2 text-meta text-foreground opacity-0 shadow-soft backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
            <Expand className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
            להגדלה
          </span>
        </button>

        {count > 1 && (
          <div className="flex w-[88px] shrink-0 flex-col gap-3 xl:w-[104px]">
            {images.map((img, i) => (
              <button
                key={`thumb-${img}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`מעבר לתמונה ${i + 1}`}
                aria-current={active === i ? "true" : undefined}
                className={`relative aspect-square shrink-0 overflow-hidden rounded-[10px] border transition-all duration-300 ease-out ${
                  active === i
                    ? "border-primary opacity-100"
                    : "border-border opacity-70 hover:-translate-y-0.5 hover:border-primary/60 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt=""
                  width={400}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== LIGHTBOX ===== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          dir="rtl"
          className="flex w-full max-w-[min(96vw,1180px)] flex-col gap-0 rounded-[14px] border-border bg-background p-3 shadow-luxury sm:rounded-[14px] sm:p-4"
        >
          <DialogTitle className="sr-only">{name}, גלריית תמונות</DialogTitle>
          <DialogDescription className="sr-only">
            {count > 1
              ? "מעבר בין התמונות בחיצים שעל המסך או במקשי החיצים במקלדת."
              : "תמונת המוצר בהגדלה."}
          </DialogDescription>

          {/* The dialog's own close button sits at the top-right (the RTL
              start), so this row is pushed to the opposite edge and nothing
              overlaps it. */}
          <div className="mb-3 flex h-8 items-center justify-end">
            {count > 1 && (
              <span className="text-meta tabular-nums text-muted-foreground">
                <bdi dir="ltr">
                  {zoomed + 1} / {count}
                </bdi>
              </span>
            )}
          </div>

          {/* No fixed box around the photograph: `w-auto` + the two max
              constraints let the replaced element shrink to fit on its own
              ratio, so a portrait or a panorama is framed by nothing rather
              than parked in the middle of a 4:3 sand rectangle. The arrows stay
              pinned to the dialog's edges, where the thumbs are. */}
          <div className="relative">
            <img
              src={images[zoomed]}
              alt={`${name}, תמונה ${zoomed + 1}`}
              width={1600}
              height={1200}
              loading="eager"
              decoding="async"
              className="mx-auto block max-h-[74vh] w-auto max-w-full rounded-[10px] object-contain"
            />

            {count > 1 && (
              <>
                {/* RTL: back points right, forward points left. */}
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="התמונה הקודמת"
                  className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[10px] border border-border bg-background/90 shadow-soft backdrop-blur-sm transition-colors duration-300 hover:border-primary/60"
                >
                  <ArrowRight className="h-5 w-5 text-foreground" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="התמונה הבאה"
                  className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[10px] border border-border bg-background/90 shadow-soft backdrop-blur-sm transition-colors duration-300 hover:border-primary/60"
                >
                  <ArrowLeft className="h-5 w-5 text-foreground" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          {count > 1 && (
            <div className="rail-scroll mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={`lb-${img}-${i}`}
                  type="button"
                  onClick={() => setZoomed(i)}
                  aria-label={`מעבר לתמונה ${i + 1}`}
                  aria-current={zoomed === i ? "true" : undefined}
                  className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-[10px] border transition-all duration-300 ${
                    zoomed === i
                      ? "border-primary opacity-100"
                      : "border-border opacity-65 hover:border-primary/60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    width={400}
                    height={320}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductGallery;
