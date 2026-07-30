import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";

interface BeforeAfterProps {
  before: string;
  after: string;
  /** Pill text, and the base of each alt. Kept short — it sits on the image. */
  beforeAlt?: string;
  afterAlt?: string;
  /** Appended to the alt text only, so screen readers get "לפני, וילה ב…" while
   *  the pill stays a single word. */
  context?: string;
  /** initial reveal, 0-100, measured from the inline start edge */
  initial?: number;
  className?: string;
}

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/**
 * Before/after reveal.
 *
 * `pos` is LOGICAL: the share of the frame showing "before", measured from the
 * inline start edge — the right edge in Hebrew, so the story reads before →
 * after in the direction the page is read. Everything that draws is derived
 * from it, which is what the old version got wrong: it clipped with
 * `inset-0` + `width` (over-constrained, so RTL pinned the box to the opposite
 * edge) while the handle rode `left`, and the two moved in opposite directions.
 *
 * The clip is now a `clip-path` on a full-size image, so both layers share
 * identical geometry and can't drift apart. The handle converts to a physical
 * percentage exactly once, on the way out.
 */
const BeforeAfter = ({
  before,
  after,
  beforeAlt = "לפני",
  afterAlt = "אחרי",
  context,
  initial = 50,
  className = "",
}: BeforeAfterProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const [rtl, setRtl] = useState(
    typeof document !== "undefined" && document.dir === "rtl",
  );

  // The document direction is the right first guess; the container's own
  // computed direction is the truth, in case this ever sits inside a dir flip.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el) setRtl(getComputedStyle(el).direction === "rtl");
  }, []);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const fromStart = rtl ? rect.right - clientX : clientX - rect.left;
      setPos(clamp((fromStart / rect.width) * 100));
    },
    [rtl],
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in e ? e.touches[0]?.clientX ?? 0 : (e as MouseEvent).clientX;
      updateFromClientX(clientX);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, updateFromClientX]);

  // Arrows are physical: ArrowRight moves the handle right on screen, which in
  // Hebrew means less "before" — the same way a native range slider behaves.
  const onKey = (e: React.KeyboardEvent) => {
    const step = (physical: number) =>
      setPos((p) => clamp(p + (rtl ? -physical : physical)));
    if (e.key === "ArrowRight") step(4);
    else if (e.key === "ArrowLeft") step(-4);
    else if (e.key === "Home") setPos(rtl ? 100 : 0);
    else if (e.key === "End") setPos(rtl ? 0 : 100);
    else return;
    e.preventDefault();
  };

  // The one conversion from logical to physical, for the two elements that
  // straddle the seam and therefore need a real left offset to sit on.
  const leftPct = rtl ? 100 - pos : pos;

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[4/3] overflow-hidden select-none rounded-[14px] border border-border bg-secondary shadow-soft ${className}`}
      onClick={(e) => updateFromClientX(e.clientX)}
    >
      <img
        src={after}
        alt={context ? `${afterAlt}, ${context}` : afterAlt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      {/* Same box, same object-fit — only the clip differs, so the two frames
          stay in register at every position. */}
      <img
        src={before}
        alt={context ? `${beforeAlt}, ${context}` : beforeAlt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{
          clipPath: rtl
            ? `inset(0 0 0 ${100 - pos}%)`
            : `inset(0 ${100 - pos}% 0 0)`,
        }}
        draggable={false}
      />

      <span className="absolute top-4 start-4 px-3 py-1 rounded-[10px] bg-background/90 backdrop-blur-sm text-meta text-foreground pointer-events-none">
        {beforeAlt}
      </span>
      <span className="absolute top-4 end-4 px-3 py-1 rounded-[10px] bg-foreground/90 backdrop-blur-sm text-meta text-background pointer-events-none">
        {afterAlt}
      </span>

      <div
        aria-hidden="true"
        className="absolute top-0 bottom-0 w-px bg-background/90 shadow-[0_0_0_1px_hsl(var(--foreground)/0.15)] pointer-events-none"
        style={{ left: `${leftPct}%`, transform: "translateX(-0.5px)" }}
      />
      <button
        type="button"
        role="slider"
        aria-label="החלקה בין לפני לאחרי"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={`${Math.round(pos)}% לפני`}
        onKeyDown={onKey}
        onMouseDown={(e) => {
          e.stopPropagation();
          setDragging(true);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          setDragging(true);
        }}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-[10px] bg-background border border-border shadow-luxury flex items-center justify-center text-foreground cursor-ew-resize touch-none transition-transform duration-300 ease-out hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        style={{ left: `${leftPct}%` }}
      >
        <MoveHorizontal className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
};

export default BeforeAfter;
