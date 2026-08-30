import { ImageIcon } from "lucide-react";
import { MAX_UPLOAD_MB, PHOTO_SPECS, type PhotoSpecKey } from "@/lib/photo-specs";
import Ltr from "@/components/Ltr";

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
          {/* Isolated, or the paragraph reorders "2400 × 1350" into
              "1350 × 2400" and the owner shoots the wrong size. */}
          <Ltr className="font-medium">{s.size}</Ltr> פיקסלים, {s.shape}. עד{" "}
          <Ltr>{MAX_UPLOAD_MB}MB</Ltr>, <Ltr>JPG</Ltr> או <Ltr>PNG</Ltr>.
        </p>
        <p className="text-muted-foreground">{s.watchOut}</p>
      </div>
    </div>
  );
};

export default PhotoSpec;
