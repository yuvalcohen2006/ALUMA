import { useRef, useState } from "react";
import { Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAdjustPhoto, useCrop } from "@/components/admin/CropProvider";
import { uploadFile } from "@/lib/admin-storage";
import {
  ACCEPT_ATTRIBUTE,
  PHOTO_SPECS,
  type PhotoSpecKey,
} from "@/lib/photo-specs";
import Ltr from "@/components/Ltr";

/**
 * Every photograph in the admin, handled the same way.
 *
 * The panel had three different ways to put a picture somewhere: a button
 * marked החלפה that silently replaced whatever was there, a separate dashed
 * square for galleries, and a little × that only some of them had. None of
 * them let you adjust a photo after it was uploaded — the only way to move a
 * chair three centimetres left was to find the original file and upload it
 * again.
 *
 * One strip now, everywhere:
 *
 *   click a photo      reopens it in the crop window, already positioned
 *   the − on a photo   removes it, after saying what that means
 *   the dashed square  adds another, by click or by dropping a file on it
 *
 * The tiles are the shape the site will actually use, so a strip of them reads
 * as the row of pictures it will become.
 */
type Props = {
  /** The addresses, in order. The first is the main photograph. */
  photos: string[];
  onChange: (next: string[]) => void;
  spec: PhotoSpecKey;
  /** Storage bucket for new uploads. */
  bucket?: string;
  /** One photograph only — a collection image, a material, a colour. */
  single?: boolean;
  /** Marks the first tile, where a strip has a main photograph. */
  firstLabel?: string;
  /** Tile width. The height follows the shape the site uses. */
  size?: "normal" | "small";
  /**
   * Off where the photograph is not the owner's to delete — the four
   * materials the site ships with draw theirs from the code, so a − on them
   * would look broken by doing nothing. Clicking still opens it, and saving
   * an adjustment uploads a copy that IS theirs.
   */
  removable?: boolean;
  onBusyChange?: (busy: boolean) => void;
};

const PhotoTiles = ({
  photos,
  onChange,
  spec,
  bucket = "site-collections",
  single = false,
  firstLabel,
  size = "normal",
  removable = true,
  onBusyChange,
}: Props) => {
  const requestCrop = useCrop();
  const adjustPhoto = useAdjustPhoto();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dropping, setDropping] = useState(false);

  const shape = PHOTO_SPECS[spec].out;
  const width = size === "small" ? 120 : 176;
  const height = Math.round((width * shape.h) / shape.w);

  const working = (on: boolean) => {
    setBusy(on);
    onBusyChange?.(on);
  };

  const put = async (files: File[]) => {
    working(true);
    try {
      const added: string[] = [];
      for (const file of files) {
        const cropped = await requestCrop(file, spec);
        // undefined: that file could not be opened, so skip it and carry on.
        // null: the owner pressed cancel, which stops the rest of the batch.
        if (cropped === undefined) continue;
        if (cropped === null) break;
        const { url } = await uploadFile(bucket, cropped);
        added.push(url);
        if (single) break;
      }
      if (added.length)
        onChange(single ? added.slice(0, 1) : [...photos, ...added]);
    } catch {
      toast.error("העלאת התמונה נכשלה");
    } finally {
      working(false);
    }
  };

  const adjust = async (index: number) => {
    working(true);
    try {
      const cropped = await adjustPhoto(photos[index], spec);
      if (!cropped) return;
      const { url } = await uploadFile(bucket, cropped);
      onChange(photos.map((p, i) => (i === index ? url : p)));
    } catch {
      toast.error("לא הצלחנו לשמור את השינוי");
    } finally {
      working(false);
    }
  };

  const remove = (index: number) => {
    if (!confirm("למחוק את התמונה הזו?")) return;
    onChange(photos.filter((_, i) => i !== index));
  };

  const showAdd = !single || photos.length === 0;

  return (
    <div className="flex flex-wrap items-start gap-3">
      {photos.map((url, i) => (
        <div key={`${url}-${i}`} style={{ width }}>
          <div className="relative">
            <button
              type="button"
              onClick={() => adjust(i)}
              disabled={busy}
              className="block w-full overflow-hidden rounded-sm border border-border bg-secondary transition-colors hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              style={{ height }}
              aria-label="לפתוח את התמונה ולהזיז אותה"
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
            {/* Top right of the tile, in both directions: this is a position on
                a picture, not a position in a sentence. */}
            {removable && (
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={busy}
                aria-label="מחיקת התמונה"
                className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border border-border bg-background text-foreground shadow-soft transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          {i === 0 && firstLabel && (
            <p className="mt-1.5 text-center text-base text-muted-foreground">
              {firstLabel}
            </p>
          )}
        </div>
      ))}

      {showAdd && (
        <div style={{ width }}>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
            onDragOver={(e) => {
              e.preventDefault();
              setDropping(true);
            }}
            onDragLeave={() => setDropping(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDropping(false);
              const files = [...e.dataTransfer.files].filter((f) =>
                f.type.startsWith("image/"),
              );
              if (files.length) put(single ? files.slice(0, 1) : files);
            }}
            className={`grid w-full place-items-center gap-1 rounded-sm border-2 border-dashed transition-colors ${
              dropping
                ? "border-foreground bg-secondary"
                : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground"
            }`}
            style={{ height }}
            aria-label="הוספת תמונה"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <>
                <Plus className="h-6 w-6" aria-hidden="true" />
                <Ltr className="text-base">{PHOTO_SPECS[spec].size}</Ltr>
              </>
            )}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPT_ATTRIBUTE}
            multiple={!single}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) put([...e.target.files]);
              // Cleared, or picking the same file twice in a row does nothing.
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PhotoTiles;
