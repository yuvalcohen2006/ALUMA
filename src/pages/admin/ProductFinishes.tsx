import { useState } from "react";
import { Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/admin-storage";
import { useCrop } from "@/components/admin/CropProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhotoSpec from "@/components/admin/PhotoSpec";
import { contentDirection } from "@/lib/field-direction";
import type { DraftVariant } from "@/lib/variant-sync";
import { ACCEPT_ATTRIBUTE } from "@/lib/photo-specs";

/** What a new piece of furniture starts with, so the list is never empty. */
export const DEFAULT_VARIANT: DraftVariant = {
  name: "לבן",
  swatch: "#FFFFFF",
  image_url: null,
};

/**
 * The colours of one piece of furniture.
 *
 * Controlled: it holds nothing of its own and writes nothing on its own. The
 * product form owns the list and saves it alongside everything else.
 *
 * That is the whole point. These rows used to write themselves to the database
 * as you clicked, which meant a product had to exist before it could have any
 * colours — so adding furniture was two jobs with a "save this first" message
 * between them. Now it is one form: name it, photograph it, give it its
 * colours, save once.
 */
const ProductFinishes = ({
  value,
  onChange,
  onBusyChange,
}: {
  value: DraftVariant[];
  onChange: (next: DraftVariant[]) => void;
  /**
   * Raised while a colour photo is uploading, so the form above can hold its
   * Save button. Without it the save ran with image_url still null, succeeded,
   * navigated away, and the finished upload wrote into an unmounted tree —
   * React discards that silently, so the photo was gone and the file was left
   * sitting in the bucket with nothing pointing at it.
   */
  onBusyChange?: (busy: boolean) => void;
}) => {
  const requestCrop = useCrop();
  const [uploading, setUploading] = useState<number | null>(null);

  const patch = (i: number, changes: Partial<DraftVariant>) =>
    onChange(value.map((v, n) => (n === i ? { ...v, ...changes } : v)));

  const add = () => onChange([...value, { name: "", swatch: "#cbbba4", image_url: null }]);

  const remove = (i: number) => onChange(value.filter((_, n) => n !== i));

  const upload = async (i: number, file: File) => {
    const cropped = await requestCrop(file, "finish");
    if (!cropped) return;
    setUploading(i);
    onBusyChange?.(true);
    try {
      const { url } = await uploadFile("site-collections", cropped);
      patch(i, { image_url: url });
    } catch {
      toast.error("העלאת התמונה נכשלה");
    } finally {
      setUploading(null);
      onBusyChange?.(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Label>צבעים</Label>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="w-4 h-4 ms-1" /> צבע נוסף
        </Button>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        כל צבע הוא עיגול בעמוד המוצר. לוחצים עליו — התמונה מתחלפת לצבע הזה.
      </p>

      <div className="mt-3">
        <PhotoSpec spec="finish" />
      </div>

      {value.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          אין צבעים למוצר הזה. אפשר להשאיר ככה — אז פשוט לא יופיעו עיגולי צבע.
        </p>
      ) : (
        <ul className="space-y-3">
          {value.map((v, i) => (
            <li
              key={i}
              className="flex flex-wrap items-center gap-3 rounded-sm border border-border p-3"
            >
              <input
                type="color"
                value={v.swatch}
                onChange={(e) => patch(i, { swatch: e.target.value })}
                aria-label={`הגוון של ${v.name || "הצבע"}`}
                className="h-10 w-10 shrink-0 cursor-pointer rounded-sm border border-border bg-transparent p-1"
              />

              <Input
                value={v.name}
                dir={contentDirection(v.name)}
                onChange={(e) => patch(i, { name: e.target.value })}
                placeholder="שם הצבע, למשל: חול"
                aria-label="שם הצבע"
                className="h-10 min-w-[9rem] flex-1"
              />

              {v.image_url && (
                <img
                  src={v.image_url}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-sm object-cover"
                />
              )}

              <label className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-sm border border-border px-3 text-sm hover:bg-secondary">
                <Upload className="h-4 w-4" />
                {uploading === i ? "מעלה…" : v.image_url ? "החלפת תמונה" : "תמונה בצבע הזה"}
                <input
                  type="file"
                  accept={ACCEPT_ATTRIBUTE}
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && upload(i, e.target.files[0])}
                />
              </label>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => remove(i)}
                aria-label={`מחיקת ${v.name || "הצבע"}`}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductFinishes;
