import { ImageIcon } from "lucide-react";
import { MAX_UPLOAD_MB, PHOTO_SPECS, type PhotoSpecKey } from "@/lib/photo-specs";

/**
 * The size to make this photo, stated once, above the upload box.
 *
 * One number, not a range: a range is a decision, and the person uploading
 * should not have to make one. Everything else that could be said about
 * photographs lives in the guide — here there is room for the size and the one
 * mistake this particular photo invites.
 */
const PhotoSpec = ({ spec }: { spec: PhotoSpecKey }) => {
  const s = PHOTO_SPECS[spec];

  return (
    <div
      dir="rtl"
      className="mb-6 flex gap-3 rounded-sm border border-border bg-secondary/50 p-4"
    >
      <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1.5 text-sm leading-relaxed">
        <p className="text-foreground">
          <span className="font-medium">{s.size}</span> פיקסלים, {s.shape}. עד{" "}
          {MAX_UPLOAD_MB}MB, JPG או PNG.
        </p>
        <p className="text-muted-foreground">{s.watchOut}</p>
      </div>
    </div>
  );
};

export default PhotoSpec;
