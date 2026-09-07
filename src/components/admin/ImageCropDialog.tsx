import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Loader2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Ltr from "@/components/Ltr";
import {
  centeredOffset,
  clampOffset,
  displaySize,
  isUpscaling,
  maxUsefulZoom,
  offsetToPercent,
  percentToOffset,
  sourceRect,
  zoomAbout,
  type CropView,
} from "@/lib/crop-geometry";
import { exportCrop, type LoadedImage } from "@/lib/image-io";
import { PHOTO_SPECS, type PhotoSpecKey } from "@/lib/photo-specs";

/**
 * Put the photograph where it should be, before it goes to the site.
 *
 * The problem this solves is not that photographs are the wrong size — the
 * upload boxes have stated the right size for months. It is that the site crops
 * every image again at display time, often at more than one shape, and until
 * now nobody uploading could see that happen. A chair with its legs near the
 * frame looked fine in the file and lost its feet on the home page.
 *
 * So the dialog shows two things at once: the crop being chosen, and every
 * shape the site will really show it in. The previews are the honest part —
 * one crop cannot satisfy three aspect ratios, and rather than pretend it can,
 * this shows what each one will take and lets the owner zoom out until the
 * furniture survives all of them.
 *
 * Interaction: a FIXED window, and the photograph moves under it. That is the
 * model every CMS aimed at shop staff rather than retouchers has settled on —
 * dragging a rectangle over a fixed image asks a person to hold two objects in
 * mind at once.
 *
 * Everything is reachable without dragging. The three sliders are not a
 * convenience: a drag-only crop surface fails WCAG 2.5.7, which requires a
 * single-pointer alternative to every dragging movement, and is unusable from a
 * keyboard entirely.
 */

/** Padding between the crop window and the edge of the stage, so the greyed
 *  surroundings are actually visible. */
const STAGE_PAD = 36;

type Props = {
  open: boolean;
  image: LoadedImage | null;
  spec: PhotoSpecKey;
  fileName: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};

const ImageCropDialog = ({
  open,
  image,
  spec,
  fileName,
  busy = false,
  onCancel,
  onConfirm,
}: Props) => {
  const s = PHOTO_SPECS[spec];
  const output = s.out;
  const aspect = output.w / output.h;

  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<CropView>({ zoom: 1, tx: 0, ty: 0 });
  const [saving, setSaving] = useState(false);

  // The crop window: the largest box of the output's aspect that fits the stage
  // with room left over to show what is being cut away.
  const maxW = Math.max(1, stage.w - STAGE_PAD * 2);
  const maxH = Math.max(1, stage.h - STAGE_PAD * 2);
  const winW = Math.min(maxW, maxH * aspect);
  const winH = winW / aspect;
  const win = { w: winW, h: winH };
  const winX = (stage.w - winW) / 2;
  const winY = (stage.h - winH) / 2;

  const img = image ? { w: image.width, h: image.height } : { w: 1, h: 1 };
  const display = displaySize(img, win, view.zoom);
  const maxZoom = Math.max(1.6, maxUsefulZoom(img, win, output));
  const soft = image ? isUpscaling(view, img, win, output) : false;

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  // Centre a newly loaded photograph, and re-centre if the stage resizes before
  // anything has been dragged.
  useEffect(() => {
    if (!image || !winW || !winH) return;
    const d = displaySize({ w: image.width, h: image.height }, { w: winW, h: winH }, 1);
    setView({ zoom: 1, ...centeredOffset(d, { w: winW, h: winH }) });
  }, [image, winW, winH]);

  const pan = useCallback(
    (dx: number, dy: number) => {
      setView((v) => {
        const d = displaySize(img, win, v.zoom);
        return { zoom: v.zoom, ...clampOffset(v.tx + dx, v.ty + dy, d, win) };
      });
    },
    [img.w, img.h, winW, winH], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const setZoom = useCallback(
    (next: number, focus?: { x: number; y: number }) => {
      setView((v) => zoomAbout(v, img, win, Math.min(maxZoom, Math.max(1, next)), focus));
    },
    [img.w, img.h, winW, winH, maxZoom], // eslint-disable-line react-hooks/exhaustive-deps
  );

  /**
   * The wheel listener is attached by hand rather than with onWheel.
   *
   * React registers wheel, touchstart and touchmove as PASSIVE at its root, so
   * preventDefault inside an onWheel handler is silently ignored and the page
   * scrolls behind the dialog while the photograph zooms. This is the single
   * most common defect in a hand-built zoom control.
   */
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !image) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const focus = {
        x: e.clientX - rect.left - winX,
        y: e.clientY - rect.top - winY,
      };
      setZoom(view.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12), focus);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [image, view.zoom, setZoom, winX, winY]);

  const drag = useRef<{ id: number; x: number; y: number } | null>(null);

  const confirm = async () => {
    if (!image) return;
    setSaving(true);
    try {
      const rect = sourceRect(view, img, win);
      onConfirm(await exportCrop(image.url, rect, output, fileName));
    } finally {
      setSaving(false);
    }
  };

  const pct = image ? offsetToPercent(view, img, win) : { x: 50, y: 50 };
  const slackX = display.w - winW > 0.5;
  const slackY = display.h - winH > 0.5;
  const working = saving || busy;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !working && onCancel()}>
      <DialogContent dir="rtl" className="admin-theme max-w-4xl">
        <DialogHeader>
          <DialogTitle>מיקום התמונה</DialogTitle>
        </DialogHeader>

        <p className="-mt-1 text-sm text-muted-foreground">
          גררו את התמונה כדי לבחור מה ייכנס למסגרת. מתחת רואים איך היא תיראה בכל
          מקום באתר שבו היא מופיעה.
        </p>

        <div className="grid gap-5 lg:grid-cols-[1fr_200px]">
          {/* ── The stage ─────────────────────────────────────────────── */}
          <div
            ref={stageRef}
            role="group"
            aria-label="מיקום התמונה במסגרת"
            className="relative h-[340px] w-full cursor-grab touch-none overflow-hidden rounded-sm bg-neutral-900 active:cursor-grabbing sm:h-[400px]"
            onPointerDown={(e) => {
              if (!image) return;
              (e.target as Element).setPointerCapture?.(e.pointerId);
              drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d || d.id !== e.pointerId) return;
              pan(e.clientX - d.x, e.clientY - d.y);
              drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          >
            {image && stage.w > 0 && (
              <>
                {/* What is being cut away: the same photograph, grey and dimmed.
                    Two copies rather than a backdrop-filter, because they share
                    one transform and so cannot drift out of alignment. */}
                <img
                  src={image.url}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="pointer-events-none absolute left-0 top-0 origin-top-left grayscale brightness-[.42]"
                  style={{
                    width: display.w,
                    height: display.h,
                    transform: `translate3d(${view.tx + winX}px, ${view.ty + winY}px, 0)`,
                  }}
                />

                {/* What will be kept. */}
                <div
                  className="pointer-events-none absolute overflow-hidden"
                  style={{ left: winX, top: winY, width: winW, height: winH }}
                >
                  <img
                    src={image.url}
                    alt=""
                    draggable={false}
                    className="absolute left-0 top-0 origin-top-left"
                    style={{
                      width: display.w,
                      height: display.h,
                      transform: `translate3d(${view.tx}px, ${view.ty}px, 0)`,
                    }}
                  />
                </div>

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute ring-1 ring-white/70"
                  style={{ left: winX, top: winY, width: winW, height: winH }}
                />
              </>
            )}
          </div>

          {/* ── What the site will actually show ──────────────────────── */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">איך זה ייראה באתר</p>
            {s.shownAt.map((place) => (
              <div key={place.label}>
                <div
                  className="overflow-hidden rounded-sm border border-border bg-secondary"
                  style={{ aspectRatio: String(place.ratio) }}
                >
                  {image && winW > 0 && (
                    <CropPreview
                      url={image.url}
                      display={display}
                      view={view}
                      win={win}
                      ratio={place.ratio}
                    />
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{place.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── The controls ───────────────────────────────────────────── */}
        <div className="space-y-3 rounded-sm border border-border p-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="הקטנה"
              onClick={() => setZoom(view.zoom / 1.15)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <input
              type="range"
              min={1}
              max={maxZoom}
              step={0.02}
              value={view.zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="תקריב"
              aria-valuetext={`תקריב ${view.zoom.toFixed(1)} מתוך ${maxZoom.toFixed(1)}`}
              className="h-2 flex-1 cursor-pointer accent-foreground"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="הגדלה"
              onClick={() => setZoom(view.zoom * 1.15)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="w-12 shrink-0">אופקי</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(pct.x)}
                disabled={!slackX}
                onChange={(e) =>
                  setView((v) => ({
                    zoom: v.zoom,
                    ...percentToOffset({ x: Number(e.target.value), y: pct.y }, img, win, v.zoom),
                  }))
                }
                aria-label="מיקום אופקי"
                aria-valuetext={`מיקום אופקי ${Math.round(pct.x)}%`}
                className="h-2 flex-1 cursor-pointer accent-foreground disabled:opacity-40"
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="w-12 shrink-0">אנכי</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(pct.y)}
                disabled={!slackY}
                onChange={(e) =>
                  setView((v) => ({
                    zoom: v.zoom,
                    ...percentToOffset({ x: pct.x, y: Number(e.target.value) }, img, win, v.zoom),
                  }))
                }
                aria-label="מיקום אנכי"
                aria-valuetext={`מיקום אנכי ${Math.round(pct.y)}%`}
                className="h-2 flex-1 cursor-pointer accent-foreground disabled:opacity-40"
              />
            </label>
          </div>
        </div>

        <p className="text-sm text-muted-foreground" role="status">
          {soft ? (
            <span className="text-foreground">
              התמונה מוגדלת מעבר לרזולוציה שלה והתוצאה תהיה מעט מטושטשת. הקטינו את
              התקריב, או העלו תמונה גדולה יותר.
            </span>
          ) : (
            <>
              נשמר בגודל <Ltr>{s.size}</Ltr> פיקסלים.
            </>
          )}
        </p>

        <div className="flex justify-start gap-2">
          <Button onClick={confirm} disabled={!image || working}>
            {working && <Loader2 className="ms-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            שמירת החיתוך
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={working}>
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * One shape the site will show this photograph in.
 *
 * The crop window is scaled to COVER the preview box — exactly what
 * object-cover will do to the exported file on the real page — so what is
 * missing here is what will be missing there.
 */
const CropPreview = ({
  url,
  display,
  view,
  win,
  ratio,
}: {
  url: string;
  display: { w: number; h: number };
  view: CropView;
  win: { w: number; h: number };
  ratio: number;
}) => {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ratio]);

  const k = box.w > 0 ? Math.max(box.w / win.w, box.h / win.h) : 0;

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      {k > 0 && (
        <img
          src={url}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: display.w * k,
            height: display.h * k,
            transform: `translate3d(${view.tx * k + (box.w - win.w * k) / 2}px, ${
              view.ty * k + (box.h - win.h * k) / 2
            }px, 0)`,
          }}
        />
      )}
    </div>
  );
};

export default ImageCropDialog;
