import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { Redo2, RotateCcw, Trash2, Undo2 } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import ConversionCTA from "@/components/ConversionCTA";
import { Button } from "@/components/ui/button";
import { backdrops } from "@/data/sceneBackdrops";
import { getSceneItem, sceneItems } from "@/data/sceneItems";
import { snapRotation } from "@/lib/sceneGeometry";
import type { PlacedItem } from "@/components/scene/SceneCanvas";

// Konva is ~150KB. It must never reach a visitor who only looked at the home
// page, so the canvas loads on demand rather than with the route chunk.
const SceneCanvas = lazy(() => import("@/components/scene/SceneCanvas"));

const STORAGE_KEY = "aluma_scene_v1";
const HISTORY_LIMIT = 50;

type SceneState = {
  backdropId: string;
  items: PlacedItem[];
};

const emptyScene = (): SceneState => ({ backdropId: backdrops[0].id, items: [] });

const SceneBuilder = () => {
  const [scene, setScene] = useState<SceneState>(emptyScene);
  const [selected, setSelected] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  // History lives in refs, not state: pushing a snapshot must not itself cause
  // a render, or every undo entry triggers the work that creates the next one.
  const history = useRef<SceneState[]>([]);
  const historyStep = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncHistoryFlags = () => {
    setCanUndo(historyStep.current > 0);
    setCanRedo(historyStep.current < history.current.length - 1);
  };

  /**
   * Snapshots, not a command stack. The document is a few KB, so the memory
   * argument for commands doesn't apply, and every command needing a correct
   * inverse is a real bug surface. Konva's own docs advise against
   * serialisation-based undo for the same reason.
   */
  const commit = useCallback((next: SceneState) => {
    history.current = history.current.slice(0, historyStep.current + 1);
    history.current.push(structuredClone(next));
    if (history.current.length > HISTORY_LIMIT) history.current.shift();
    historyStep.current = history.current.length - 1;
    setScene(next);
    syncHistoryFlags();
  }, []);

  // Restore an autosaved layout, and seed history with whatever we start from.
  useEffect(() => {
    let start = emptyScene();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.backdropId && Array.isArray(parsed.items)) {
          start = { backdropId: parsed.backdropId, items: parsed.items };
        }
      }
    } catch {
      // Corrupt or unreadable storage is not worth surfacing — start clean.
    }
    setScene(start);
    history.current = [structuredClone(start)];
    historyStep.current = 0;
    syncHistoryFlags();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...scene }));
    } catch {
      // Private mode / quota — autosave is a convenience, not a requirement.
    }
  }, [scene]);

  // Stage size follows the container in CSS pixels; Konva applies the device
  // pixel ratio itself, so nothing here should multiply by devicePixelRatio.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const backdrop =
    backdrops.find((b) => b.id === scene.backdropId) ?? backdrops[0];

  const addItem = (itemId: string) => {
    const item = getSceneItem(itemId);
    if (!item) return;
    const placed: PlacedItem = {
      uid: `${itemId}-${scene.items.length}-${scene.items.reduce((n, i) => n + i.x, 0) | 0}`,
      itemId,
      variantId: item.variants[0]?.id ?? "",
      // Drop into the middle of the usable floor, not the exact centre of the
      // plate — the centre is often above the floor band.
      x: backdrop.width / 2,
      y: (backdrop.floor.top + backdrop.floor.bottom) / 2,
      rotation: 0,
    };
    commit({ ...scene, items: [...scene.items, placed] });
    setSelected(placed.uid);
  };

  const patchItem = (uid: string, patch: Partial<PlacedItem>) =>
    commit({
      ...scene,
      items: scene.items.map((i) => (i.uid === uid ? { ...i, ...patch } : i)),
    });

  const removeSelected = () => {
    if (!selected) return;
    commit({ ...scene, items: scene.items.filter((i) => i.uid !== selected) });
    setSelected(null);
  };

  const undo = useCallback(() => {
    if (historyStep.current <= 0) return;
    historyStep.current -= 1;
    setScene(structuredClone(history.current[historyStep.current]));
    setSelected(null);
    syncHistoryFlags();
  }, []);

  const redo = useCallback(() => {
    if (historyStep.current >= history.current.length - 1) return;
    historyStep.current += 1;
    setScene(structuredClone(history.current[historyStep.current]));
    setSelected(null);
    syncHistoryFlags();
  }, []);

  // Keyboard control. Canvas content isn't in the accessibility tree at all, so
  // without this the whole feature is mouse-only.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (!selected) return;

      const current = scene.items.find((i) => i.uid === selected);
      if (!current) return;
      const step = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          patchItem(selected, { x: current.x - step });
          break;
        case "ArrowRight":
          e.preventDefault();
          patchItem(selected, { x: current.x + step });
          break;
        case "ArrowUp":
          e.preventDefault();
          patchItem(selected, { y: current.y - step });
          break;
        case "ArrowDown":
          e.preventDefault();
          patchItem(selected, { y: current.y + step });
          break;
        case "[":
          patchItem(selected, { rotation: snapRotation(current.rotation - 15, true) });
          break;
        case "]":
          patchItem(selected, { rotation: snapRotation(current.rotation + 15, true) });
          break;
        case "Delete":
        case "Backspace":
          e.preventDefault();
          removeSelected();
          break;
        case "Escape":
          setSelected(null);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // No dependency array on purpose: the handler closes over `scene` and
    // `selected`, so it has to be rebound each render or an arrow key would
    // move whatever was selected when the page loaded.
  });

  const selectedItem = scene.items.find((i) => i.uid === selected);
  const selectedDef = selectedItem ? getSceneItem(selectedItem.itemId) : undefined;

  const summary = scene.items
    .map((i) => {
      const def = getSceneItem(i.itemId);
      const variant = def?.variants.find((v) => v.id === i.variantId);
      return def ? `${def.name}${variant ? ` (${variant.label})` : ""}` : null;
    })
    .filter(Boolean)
    .join(", ");

  return (
    <Layout>
      <SEO
        title="עצבו את המרחב שלכם | Aluma"
        description="הרכיבו את סידור הריהוט שלכם על רקע אמיתי: הוסיפו יחידות, סובבו, החליפו גוונים, ושלחו לנו את התוצאה."
        path="/diy/scene"
      />

      <PageHero
        title="עצבו את המרחב"
        subtitle="בחרו רקע, הוסיפו פריטים וגררו אותם למקום. פריט שמוזז אחורה בתמונה מתכווץ בדיוק כמו במציאות, כך שהיחסים נשארים נכונים."
      />

      <section className="pb-16 md:pb-24 bg-background">
        <div className="container-luxury">
          {/* Backdrops */}
          <div className="flex flex-wrap gap-2 mb-5">
            {backdrops.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => commit({ ...scene, backdropId: b.id })}
                aria-pressed={b.id === scene.backdropId}
                className={`h-9 px-4 rounded-full border text-[14px] transition-colors ${
                  b.id === scene.backdropId
                    ? "bg-foreground text-background border-foreground"
                    : "border-foreground/15 text-foreground/70 hover:border-foreground/40"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>

          {/* Canvas. touch-action:none or the browser pans the page instead of
              letting the canvas handle the gesture. */}
          <div
            ref={wrapRef}
            className="relative w-full overflow-hidden rounded-[14px] border border-border bg-secondary"
            style={{ touchAction: "none" }}
          >
            <Suspense
              fallback={
                <div className="aspect-[8/5] flex items-center justify-center text-muted-foreground">
                  טוען את המעצב…
                </div>
              }
            >
              {width > 0 && (
                <SceneCanvas
                  backdrop={backdrop}
                  items={scene.items}
                  selectedUid={selected}
                  onSelect={setSelected}
                  onChange={patchItem}
                  containerWidth={width}
                  stageRef={stageRef}
                />
              )}
            </Suspense>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo}>
              <Undo2 className="w-4 h-4 ms-1" /> בטלו
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={!canRedo}>
              <Redo2 className="w-4 h-4 ms-1" /> בצעו שוב
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={removeSelected}
              disabled={!selected}
            >
              <Trash2 className="w-4 h-4 ms-1" /> הסירו
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => commit({ ...scene, items: [] })}
              disabled={scene.items.length === 0}
            >
              <RotateCcw className="w-4 h-4 ms-1" /> התחילו מחדש
            </Button>
            <span className="text-[14px] text-muted-foreground ms-auto">
              {scene.items.length === 0
                ? "הוסיפו פריט כדי להתחיל"
                : `${scene.items.length} פריטים בסצנה`}
            </span>
          </div>

          {/* Catalogue */}
          <div className="mt-10">
            <h2 className="font-display font-bold text-[22px] text-foreground text-right mb-4">
              הוסיפו פריט
            </h2>
            <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {sceneItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => addItem(item.id)}
                    className="group w-full text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  >
                    <div className="aspect-square rounded-[14px] border border-border bg-secondary/50 overflow-hidden flex items-center justify-center p-2 transition-colors group-hover:border-primary/60">
                      <img
                        src={item.variants[0]?.src}
                        alt=""
                        loading="lazy"
                        className="max-h-full w-auto object-contain"
                      />
                    </div>
                    <span className="mt-2 block text-[15px] text-foreground">
                      {item.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Variants for the selection */}
          {selectedItem && selectedDef && selectedDef.variants.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display font-bold text-[22px] text-foreground text-right mb-4">
                גוון ל{selectedDef.name}
              </h2>
              <div className="flex flex-wrap gap-3">
                {selectedDef.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => patchItem(selectedItem.uid, { variantId: v.id })}
                    aria-pressed={v.id === selectedItem.variantId}
                    className={`inline-flex items-center gap-2 h-10 px-4 rounded-full border text-[14px] transition-colors ${
                      v.id === selectedItem.variantId
                        ? "border-foreground"
                        : "border-foreground/15 hover:border-foreground/40"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="w-4 h-4 rounded-full border border-black/10"
                      style={{ background: v.swatch ?? "#ccc" }}
                    />
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Screen-reader mirror of the canvas. Canvas content is invisible to
              assistive tech, so without this list the scene simply doesn't
              exist for a keyboard or screen-reader user. */}
          <ul className="sr-only">
            {scene.items.map((i) => {
              const def = getSceneItem(i.itemId);
              return (
                <li key={i.uid}>
                  <button type="button" onClick={() => setSelected(i.uid)}>
                    {def?.name ?? i.itemId}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 text-[14px] leading-relaxed text-muted-foreground">
            קיצורי מקלדת: חיצים להזזה · Shift+חיצים להזזה מהירה · [ ו-] לסיבוב ·
            Delete להסרה · Ctrl+Z לביטול.
          </p>

          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
            הרקעים והפריטים כאן הם דוגמאות להמחשה. עם צילומי המוצרים שלנו הסצנה
            תציג את הריהוט האמיתי, בגוונים האמיתיים.
          </p>
        </div>
      </section>

      <ConversionCTA
        title="אהבתם את מה שיצא?"
        subtitle="שלחו לנו את הסידור ונחזור אליכם עם הצעת מחיר מותאמת."
        whatsappMessage={
          summary
            ? `היי, עיצבתי סצנה באתר של אלומה: ${summary}. אשמח להצעת מחיר.`
            : "היי, אשמח להצעת מחיר לריהוט חוץ."
        }
        primaryHref="/consult"
      />
    </Layout>
  );
};

export default SceneBuilder;
