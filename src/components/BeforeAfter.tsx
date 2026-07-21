import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BeforeAfterProps {
  before: string;
  after: string;
  beforeAlt?: string;
  afterAlt?: string;
  /** initial position 0-100 */
  initial?: number;
  className?: string;
}

/**
 * Interactive before/after slider.
 * - Drag the handle (mouse/touch)
 * - Or click anywhere on the image to jump
 * - Keyboard: ArrowLeft / ArrowRight when handle is focused
 */
const BeforeAfter = ({
  before,
  after,
  beforeAlt = "לפני",
  afterAlt = "אחרי",
  initial = 50,
  className = "",
}: BeforeAfterProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(initial);
  const [dragging, setDragging] = useState(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setPos(pct);
  }, []);

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

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
    if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[4/3] overflow-hidden bg-secondary select-none rounded-sm shadow-luxury ${className}`}
      onClick={(e) => updateFromClientX(e.clientX)}
    >
      {/* After (base layer, full width) */}
      <img
        src={after}
        alt={afterAlt}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      {/* Before (clipped from the right in RTL feels natural; we clip from left for universality) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${pos}%` }}
      >
        <img
          src={before}
          alt={beforeAlt}
          className="absolute inset-0 h-full object-cover"
          style={{ width: `${(100 / pos) * 100}%`, maxWidth: "none" }}
          draggable={false}
        />
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 px-3 py-1 bg-background/85 backdrop-blur-sm rounded-full text-[11px] tracking-[0.2em] uppercase text-primary font-medium pointer-events-none">
        {beforeAlt}
      </div>
      <div className="absolute top-4 right-4 px-3 py-1 bg-primary/90 text-primary-foreground rounded-full text-[11px] tracking-[0.2em] uppercase font-medium pointer-events-none">
        {afterAlt}
      </div>

      {/* Divider line + handle */}
      <div
        className="absolute top-0 bottom-0 w-px bg-background shadow-[0_0_0_1px_hsl(var(--primary)/0.2)] pointer-events-none"
        style={{ left: `${pos}%`, transform: "translateX(-0.5px)" }}
      />
      <button
        type="button"
        role="slider"
        aria-label="גרור להחלקה בין לפני ואחרי"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        onKeyDown={onKey}
        onMouseDown={(e) => {
          e.stopPropagation();
          setDragging(true);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          setDragging(true);
        }}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-background shadow-luxury border border-primary/30 flex items-center justify-center cursor-ew-resize hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{ left: `${pos}%` }}
      >
        <ChevronLeft className="w-4 h-4 text-primary" />
        <ChevronRight className="w-4 h-4 text-primary -ml-1" />
      </button>
    </div>
  );
};

export default BeforeAfter;
