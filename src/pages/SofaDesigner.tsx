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
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import ShineAction from "@/components/ui/shine-action";
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
        <div className="absolute inset-0 rounded-[10px] border border-border bg-secondary" />
      )}
    </div>
  );
};

/**
 * The drawn floor the composition stands on: a perspective grid in border
 * tones rising from the bottom edge of the canvas, so the sofa sits in a room
 * rather than on white void. Purely decorative — the scroll strip paints above
 * it (the strip is positioned, the floor comes first in the DOM).
 */
const CanvasFloor = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-0 bottom-0 h-48 overflow-hidden [perspective:520px]"
  >
    <span
      className="absolute inset-x-[-25%] bottom-[-1px] block h-72 origin-bottom opacity-80 [transform:rotateX(58deg)]"
      style={{
        backgroundImage:
          "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
        backgroundSize: "36px 36px",
        maskImage: "linear-gradient(to top, #000 20%, transparent 90%)",
        WebkitMaskImage: "linear-gradient(to top, #000 20%, transparent 90%)",
      }}
    />
  </div>
);

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
  // Read aloud by the sr-only live region after every reorder.
  const [liveNote, setLiveNote] = useState("");

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
    // A move never changes the count, so reading the closure's length is safe.
    setLiveNote(`הוזז למקום ${to + 1} מתוך ${placed.length}`);
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

  const quoteHref = `${SITE.whatsapp.href}?text=${waMessage}`;
  const onQuoteClick = () =>
    trackPixel("InitiateCheckout", {
      content_name: "סלון מודולרי מותאם אישית",
      content_category: "Sofa Designer",
    });

  const unitsLabel =
    placed.length === 1 ? "יחידה אחת" : `${placed.length} יחידות`;

  return (
    <Layout>
      <SEO
        title="עצבו סלון מודולרי לחוץ, יחידות אמצע, פינה והדום | Aluma"
        description="הרכיבו סלון חוץ מודולרי לפי המידות שלכם, חברו יחידות אמצע, פינה והדום, וקבלו הצעת מחיר מותאמת אישית מ-Aluma."
        path="/designer"
      />

      <PageHero
        title="עצבו סלון"
        subtitle="כל הסלונים שלנו מודולריים. חברו פינה, יחידות אמצע והדומים, ובנו את הקומפוזיציה שמתאימה בדיוק למרפסת או לגינה שלכם. האורך והתצורה מתעדכנים בזמן אמת."
      />

      <section className="pt-8 md:pt-12 pb-20 bg-background">
        <div className="container-luxury">
          <Reveal>
            <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-8 items-start">
              {/* Palette + summary — first child, so it sits on the RIGHT in RTL */}
              <aside className="space-y-5 lg:sticky lg:top-28">
                <h2 className="font-display text-card-title text-foreground">
                  יחידות זמינות
                </h2>

                <ul role="list" className="space-y-3">
                  {SOFA_UNITS.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => add(u.id)}
                        aria-label={`הוספת ${u.nameHe}`}
                        className="group w-full rounded-[10px] border border-border bg-card p-3 text-right transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-luxury"
                      >
                        <span className="flex items-center gap-4">
                          {/* Specimen plate — DIY-station grammar */}
                          <span className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border bg-secondary/50 p-1.5 transition-colors duration-300 group-hover:border-primary/40">
                            {u.image && (
                              <img
                                src={u.image}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                draggable={false}
                                className="h-full w-full object-contain"
                                style={{ transform: u.mirrored ? "scaleX(-1)" : undefined }}
                              />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-meta font-medium text-foreground">
                              {u.nameHe}
                            </span>
                            <span className="block text-meta text-muted-foreground">
                              <bdi dir="ltr">{u.widthCm}×{u.depthCm}</bdi> ס״מ
                            </span>
                          </span>
                          <Plus
                            className="h-5 w-5 shrink-0 text-foreground/40 transition-smooth group-hover:text-primary"
                            aria-hidden="true"
                          />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Summary — desktop sidebar block; the mobile twin is the
                    sticky bar at the bottom of the page. */}
                <div className="rounded-[14px] border border-border bg-card p-5">
                  <dl className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-meta text-muted-foreground">סה״כ יחידות</dt>
                      <dd className="text-meta font-medium tabular-nums text-foreground">
                        {placed.length}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-meta text-muted-foreground">אורך כולל</dt>
                      <dd className="text-meta font-medium text-foreground">
                        <span className="tabular-nums">{summary.totalCm}</span> ס״מ
                      </dd>
                    </div>
                  </dl>

                  {placed.length > 0 && (
                    <div className="mt-5 flex items-stretch gap-2 border-t border-border pt-5">
                      <a
                        href={quoteHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onQuoteClick}
                        className="btn-shine flex-1"
                      >
                        הצעת מחיר
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      </a>
                      <button
                        type="button"
                        onClick={reset}
                        aria-label="איפוס הקומפוזיציה"
                        title="איפוס הקומפוזיציה"
                        className="flex w-12 shrink-0 items-center justify-center rounded-[10px] border border-border text-foreground transition-smooth hover:border-foreground/50 hover:bg-secondary"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              </aside>

              {/* Canvas */}
              <div className="relative min-h-[480px] min-w-0 overflow-hidden rounded-[14px] border border-border bg-card p-6">
                <CanvasFloor />

                {/* Scroll arrows, always visible, disabled when nothing to scroll */}
                {placed.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => scrollByAmount(-1)}
                      disabled={!canScrollLeft}
                      aria-label="גלול שמאלה"
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-[10px] border border-border bg-background/95 text-foreground shadow-soft transition-smooth hover:border-foreground/50 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollByAmount(1)}
                      disabled={!canScrollRight}
                      aria-label="גלול ימינה"
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-[10px] border border-border bg-background/95 text-foreground shadow-soft transition-smooth hover:border-foreground/50 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
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
                  className="relative overflow-x-auto overflow-y-hidden scroll-smooth"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {placed.length === 0 ? (
                    /* Empty state: soft silhouettes of a composition-to-be, and
                       a seed action that opens with a corner unit. */
                    <div
                      dir="rtl"
                      className="flex h-[400px] flex-col items-center justify-center gap-6 px-4 text-center"
                    >
                      {/* 0.7 px per cm, not 0.85: at 0.85 the four silhouettes
                          measured ~307px and a 375px phone gives the strip
                          ~279px, so the empty state opened already scrolled. */}
                      <div className="flex items-end gap-1.5" aria-hidden="true" dir="ltr">
                        {["corner-left", "middle", "middle", "corner-right"].map((id, i) => {
                          const u = getUnit(id);
                          if (!u) return null;
                          return (
                            <span
                              key={`${id}-${i}`}
                              className="rounded-[10px] border border-dashed border-foreground/25 bg-secondary/60"
                              style={{
                                width: u.widthCm * 0.7,
                                height: u.type === "middle" ? 44 : 58,
                              }}
                            />
                          );
                        })}
                      </div>
                      <p className="max-w-sm text-meta text-muted-foreground">
                        הקומפוזיציה שלכם תיבנה כאן. הוסיפו יחידות מהרשימה, או פתחו עם פינה.
                      </p>
                      <ShineAction onClick={() => add("corner-right")}>
                        התחילו עם יחידת פינה
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </ShineAction>
                    </div>
                  ) : (
                    <div className="mx-auto w-max" dir="ltr">
                      <div className="flex items-end min-h-[320px] py-4">
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
                              } ${isOver ? "ring-2 ring-primary/60 rounded-[10px]" : ""}`}
                            >
                              <UnitTile unit={u} />

                              {/* Reorder controls (always visible on touch, hover on desktop) */}
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-smooth z-10">
                                <button
                                  type="button"
                                  onClick={() => shift(i, -1)}
                                  disabled={i === 0}
                                  className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-border bg-background/95 text-foreground shadow-soft transition-smooth hover:border-foreground/50 hover:bg-secondary disabled:opacity-30"
                                  aria-label="הזז שמאלה"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => shift(i, 1)}
                                  disabled={i === placed.length - 1}
                                  className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-border bg-background/95 text-foreground shadow-soft transition-smooth hover:border-foreground/50 hover:bg-secondary disabled:opacity-30"
                                  aria-label="הזז ימינה"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="absolute -top-2 -right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-smooth z-10">
                                <button
                                  type="button"
                                  onClick={() => remove(p.key)}
                                  className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-border bg-background/95 text-foreground shadow-soft transition-smooth hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                                  aria-label="הסר יחידה"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* The payoff: a measured dimension line drawn under the
                          composition itself. It lives inside the w-max wrapper,
                          so it is exactly as wide as the sofa and scrolls with
                          it — a real measurement, not decoration. */}
                      <div className="flex items-center gap-3 pb-2 pt-1">
                        <span aria-hidden="true" className="h-3.5 w-px bg-foreground/60" />
                        <span aria-hidden="true" className="h-px min-w-6 flex-1 bg-foreground/30" />
                        <p dir="rtl" className="shrink-0 whitespace-nowrap text-meta font-medium text-foreground">
                          <span className="tabular-nums">{summary.totalCm}</span> ס״מ
                        </p>
                        <span aria-hidden="true" className="h-px min-w-6 flex-1 bg-foreground/30" />
                        <span aria-hidden="true" className="h-3.5 w-px bg-foreground/60" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Announces reorders to screen readers ("הוזז למקום 2 מתוך 4") */}
                <div role="status" aria-live="polite" className="sr-only">
                  {liveNote}
                </div>

                <p className="relative mt-4 flex flex-wrap items-center justify-center gap-2 text-center text-meta text-muted-foreground">
                  <MoveHorizontal className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    החליקו את התצוגה עם האצבע או השתמשו בחיצים לגלילה. סדרו את היחידות עם כפתורי{" "}
                    {/* Two icons quoted inside an RTL sentence are bidi
                        neutrals: without an LTR run of their own they resolve
                        to the paragraph direction and render ► ◄ — the mirror
                        image of the buttons they are naming. */}
                    <span dir="ltr" className="inline-flex items-center align-[-4px]">
                      <ChevronLeft className="h-[18px] w-[18px]" aria-hidden="true" />
                      <ChevronRight className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>{" "}
                    שעל כל יחידה.
                  </span>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mobile summary — sticky above the MobileActionBar (its 4rem plus the
          device safe-area), so count, length and the quote action ride along
          while scrolling. */}
      {placed.length > 0 && (
        <div
          className="md:hidden fixed inset-x-0 z-30 border-t border-border bg-background/95 shadow-luxury backdrop-blur-md"
          style={{ bottom: "calc(4rem + env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <p className="min-w-0 text-meta text-foreground">
              {unitsLabel}
              <span className="text-muted-foreground"> · </span>
              <span className="tabular-nums">{summary.totalCm}</span> ס״מ
            </p>
            <a
              href={quoteHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onQuoteClick}
              className="btn-shine shrink-0"
            >
              הצעת מחיר
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      )}

      <ConversionCTA
        title="הרכבתם את הספה. עכשיו נהפוך אותה למציאות."
        subtitle="נבנה יחד את הצעת המחיר המדויקת, כולל בדים, גוונים ומידות אמת. תשובה תוך יום עסקים."
        whatsappMessage="היי, הרכבתי ספה בסטודיו של אלומה ואשמח לתמחור."
      />
    </Layout>
  );
};

export default SofaDesigner;
