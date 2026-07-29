import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  RotateCcw,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
} from "lucide-react";
import Layout from "@/components/Layout";
import { SITE } from "@/config/site";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { SOFA_UNITS, getUnit, type SofaUnit } from "@/data/sofaUnits";
import { trackPixel } from "@/lib/pixel";
import ConversionCTA from "@/components/ConversionCTA";

type Placed = {
  key: string;    // unique instance id
  unitId: string; // catalog id
};

const newKey = () => Math.random().toString(36).slice(2, 9);

// Visual scale: 1 cm = this many px in the canvas preview.
const PX_PER_CM = 2.4;

const UnitTile = ({ unit }: { unit: SofaUnit }) => {
  const w = unit.widthCm * PX_PER_CM;
  const h = unit.depthCm * PX_PER_CM;

  return (
    <div
      className="relative shrink-0 select-none"
      style={{ width: w, height: h, transform: unit.mirrored ? "scaleX(-1)" : undefined }}
    >
      {unit.image ? (
        <img
          src={unit.image}
          alt={unit.nameHe}
          draggable={false}
          className="w-full h-full object-contain block pointer-events-none"
        />
      ) : (
        <div className="absolute inset-0 rounded-md border border-primary/20 bg-secondary" />
      )}
    </div>
  );
};

const SofaDesigner = () => {
  const [placed, setPlaced] = useState<Placed[]>([
    { key: newKey(), unitId: "corner-left" },
    { key: newKey(), unitId: "middle" },
    { key: newKey(), unitId: "middle" },
    { key: newKey(), unitId: "corner-right" },
    { key: newKey(), unitId: "ottoman" },
  ]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  useEffect(() => {
    // Re-check after layout when units change; auto-scroll to end when adding.
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      updateScrollState();
    });
  }, [placed]);

  const scrollByAmount = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.6), behavior: "smooth" });
  };

  const add = (unitId: string) => {
    setPlaced((p) => [...p, { key: newKey(), unitId }]);
    // Scroll to newly added item after render
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    });
  };

  const remove = (key: string) =>
    setPlaced((p) => p.filter((x) => x.key !== key));

  const reset = () => setPlaced([]);

  const moveTo = (from: number, to: number) => {
    if (from === to) return;
    setPlaced((p) => {
      const next = [...p];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const shift = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= placed.length) return;
    moveTo(index, target);
  };

  const summary = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalCm = 0;
    placed.forEach((p) => {
      const u = getUnit(p.unitId);
      if (!u) return;
      counts[u.id] = (counts[u.id] || 0) + 1;
      totalCm += u.widthCm;
    });
    return { counts, totalCm };
  }, [placed]);

  const waMessage = useMemo(() => {
    const lines = ["שלום, עיצבתי קומפוזיציה מודולרית:"];
    SOFA_UNITS.forEach((u) => {
      const c = summary.counts[u.id] || 0;
      if (c) lines.push(`• ${u.nameHe} ×${c}`);
    });
    lines.push(`אורך כולל: ${summary.totalCm} ס״מ`);
    lines.push("אשמח להצעת מחיר.");
    return encodeURIComponent(lines.join("\n"));
  }, [summary]);

  return (
    <Layout>
      <SEO
        title="עצבו סלון מודולרי לחוץ, יחידות אמצע, פינה והדום | Aluma"
        description="הרכיבו סלון חוץ מודולרי לפי המידות שלכם, חברו יחידות אמצע, פינה והדום, וקבלו הצעת מחיר מותאמת אישית מ-Aluma."
        path="/designer"
      />

      <div className="pt-32 pb-20">
        <section className="container mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <span className="text-xs tracking-[0.3em] uppercase text-accent font-medium">
              Modular sofa designer
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-primary mt-3 mb-4">
              עצבו את הסלון שלכם
            </h1>
            <p className="text-foreground text-lg leading-relaxed">
              כל הסלונים שלנו מודולריים. חברו פינה, יחידות אמצע והדומים, ובנו את הקומפוזיציה
              שמתאימה בדיוק למרפסת או לגינה שלכם. האורך והתצורה מתעדכנים בזמן אמת.
            </p>
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Palette */}
            <aside className="space-y-4">
              <h2 className="text-sm tracking-[0.2em] uppercase text-muted-foreground font-medium">
                יחידות זמינות
              </h2>
              <div className="space-y-3">
                {SOFA_UNITS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => add(u.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-md border border-border bg-card hover:border-accent hover:shadow-soft transition-smooth text-right group"
                  >
                    <div className="shrink-0 w-16 h-16 rounded bg-secondary/60 border border-primary/15 flex items-center justify-center overflow-hidden">
                      {u.image ? (
                        <img
                          src={u.image}
                          alt={u.nameHe}
                          className="w-full h-full object-contain"
                          style={{ transform: u.mirrored ? "scaleX(-1)" : undefined }}
                        />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          {u.widthCm}×{u.depthCm}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{u.nameHe}</div>
                      <div className="text-xs text-muted-foreground">1×1 מ׳</div>
                    </div>
                    <Plus className="h-5 w-5 text-primary/40 group-hover:text-accent transition-smooth" />
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">סה״כ יחידות</span>
                  <span className="font-semibold text-foreground">{placed.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">אורך כולל</span>
                  <span className="font-semibold text-foreground">
                    {summary.totalCm} ס״מ
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  className="flex-1"
                  disabled={!placed.length}
                >
                  <RotateCcw className="h-4 w-4 ml-2" />
                  אפס
                </Button>
                <Button asChild size="sm" className="flex-1" disabled={!placed.length}>
                  <a
                    href={`${SITE.whatsapp.href}?text=${waMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackPixel("InitiateCheckout", {
                        content_name: "סלון מודולרי מותאם אישית",
                        content_category: "Sofa Designer",
                      })
                    }
                  >
                    <MessageCircle className="h-4 w-4 ml-2" />
                    הצעת מחיר
                  </a>
                </Button>
              </div>
            </aside>

            {/* Canvas */}
            <div className="relative rounded-lg border border-border bg-card p-6 min-h-[480px] min-w-0 overflow-hidden">
              {/* Scroll arrows, always visible, disabled when nothing to scroll */}
              {placed.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => scrollByAmount(-1)}
                    disabled={!canScrollLeft}
                    aria-label="גלול שמאלה"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-sm bg-primary text-primary-foreground shadow-soft flex items-center justify-center transition-smooth hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollByAmount(1)}
                    disabled={!canScrollRight}
                    aria-label="גלול ימינה"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-sm bg-primary text-primary-foreground shadow-soft flex items-center justify-center transition-smooth hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* dir="ltr" must sit on the SCROLL CONTAINER, not just the inner
                  track: with the container inheriting rtl, scrollLeft ran
                  0 → negative, so canScrollLeft was never true (left arrow
                  permanently dead), canScrollRight never false, and
                  scrollTo({left: scrollWidth}) clamped to 0 — the tool was
                  unusable past the first viewport of units. With the container
                  itself ltr, all the existing math is simply correct. */}
              <div
                ref={scrollRef}
                dir="ltr"
                className="overflow-x-auto overflow-y-hidden scroll-smooth"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {placed.length === 0 ? (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground text-sm">
                    הוסיפו יחידות מהצד כדי להתחיל
                  </div>
                ) : (
                  <div className="flex items-end min-h-[320px] py-4 w-max" dir="ltr">
                    {placed.map((p, i) => {
                      const u = getUnit(p.unitId);
                      if (!u) return null;
                      const isDragging = dragIndex === i;
                      const isOver = overIndex === i && dragIndex !== null && dragIndex !== i;
                      return (
                        <div
                          key={p.key}
                          draggable
                          onDragStart={(e) => {
                            setDragIndex(i);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                            if (overIndex !== i) setOverIndex(i);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (dragIndex !== null) moveTo(dragIndex, i);
                            setDragIndex(null);
                            setOverIndex(null);
                          }}
                          onDragEnd={() => {
                            setDragIndex(null);
                            setOverIndex(null);
                          }}
                          className={`relative group cursor-grab active:cursor-grabbing transition-all ${
                            isDragging ? "opacity-40" : ""
                          } ${isOver ? "ring-2 ring-accent rounded-md" : ""}`}
                        >
                          <UnitTile unit={u} />

                          {/* Reorder controls (always visible on touch, hover on desktop) */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-smooth z-10">
                            <button
                              onClick={() => shift(i, -1)}
                              disabled={i === 0}
                              className="w-8 h-8 rounded-sm bg-primary/90 text-primary-foreground flex items-center justify-center shadow-soft hover:bg-accent transition-smooth disabled:opacity-30"
                              aria-label="הזז שמאלה"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => shift(i, 1)}
                              disabled={i === placed.length - 1}
                              className="w-8 h-8 rounded-sm bg-primary/90 text-primary-foreground flex items-center justify-center shadow-soft hover:bg-accent transition-smooth disabled:opacity-30"
                              aria-label="הזז ימינה"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="absolute -top-2 -right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-smooth z-10">
                            <button
                              onClick={() => remove(p.key)}
                              className="w-7 h-7 rounded-sm bg-destructive text-destructive-foreground flex items-center justify-center shadow-soft hover:opacity-90 transition-smooth"
                              aria-label="הסר יחידה"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center flex items-center justify-center gap-2 flex-wrap">
                <MoveHorizontal className="h-3.5 w-3.5" />
                <span>
                  החליקו את התצוגה עם האצבע או השתמשו בחיצים לגלילה. סדרו את היחידות עם כפתורי{" "}
                  <ChevronLeft className="h-3 w-3 inline" />
                  <ChevronRight className="h-3 w-3 inline" /> שעל כל יחידה.
                </span>
              </p>
            </div>
          </div>
        </section>
      </div>

      <ConversionCTA
        title="הרכבתם את הספה. עכשיו נהפוך אותה למציאות."
        subtitle="נבנה יחד את הצעת המחיר המדויקת, כולל בדים, גוונים ומידות אמת. תשובה תוך יום עסקים."
        whatsappMessage="היי, הרכבתי ספה בסטודיו של אלומה ואשמח לתמחור."
      />
    </Layout>
  );
};

export default SofaDesigner;
