import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import ImageCropDialog from "@/components/admin/ImageCropDialog";
import { ImageLoadError, loadImageForCrop, type LoadedImage } from "@/lib/image-io";
import type { PhotoSpecKey } from "@/lib/photo-specs";

/**
 * One crop step, in front of every upload in the admin.
 *
 * All nine uploads already funnelled through a single `uploadFile(bucket, file)`
 * helper, which made this the natural seam: a screen changes from
 *
 *     const { url } = await uploadFile(bucket, file);
 *
 * to
 *
 *     const cropped = await requestCrop(file, "product");
 *     if (!cropped) return;                       // the owner cancelled
 *     const { url } = await uploadFile(bucket, cropped);
 *
 * and gains the whole dialog. A promise rather than a callback because every
 * one of those handlers is already an async function doing exactly this in
 * sequence, and a callback would have turned nine straight-line handlers into
 * nine state machines.
 *
 * Cancelling resolves null rather than rejecting. Backing out of a crop is a
 * normal thing to do, not an error, and a rejection would make every call site
 * need a try/catch to express "then nothing happens".
 */

/**
 * `null` means the owner cancelled. `undefined` means the file was unusable —
 * too large, or something the browser cannot decode.
 *
 * The distinction exists for the two multi-file gallery loops. They treated
 * every falsy result as "cancelled, stop here", so one 9MB photo in the middle
 * of a batch of five showed a single red toast and then silently skipped the
 * rest — no dialog ever opened for them, and nothing said why. A cancel should
 * still stop the batch; an unreadable file should only skip itself.
 */
type RequestCrop = (file: File, spec: PhotoSpecKey) => Promise<File | null | undefined>;

const CropContext = createContext<RequestCrop | null>(null);

export const useCrop = (): RequestCrop => {
  const ctx = useContext(CropContext);
  if (!ctx) throw new Error("useCrop must be used inside CropProvider");
  return ctx;
};

type Pending = {
  image: LoadedImage;
  spec: PhotoSpecKey;
  fileName: string;
};

export const CropProvider = ({ children }: { children: ReactNode }) => {
  const [pending, setPending] = useState<Pending | null>(null);
  const resolver = useRef<((file: File | null) => void) | null>(null);

  /** Resolve the outstanding promise and let go of the blob exactly once. */
  const settle = useCallback((file: File | null) => {
    setPending((p) => {
      // Released on a delay, and deliberately. Revoking the blob URL in the
      // same tick pulls the photograph out of a dialog that is still playing
      // its close animation, so every confirm and every cancel ended on a
      // quarter-second of empty box.
      if (p) window.setTimeout(() => p.image.release(), 400);
      return null;
    });
    const resolve = resolver.current;
    resolver.current = null;
    resolve?.(file);
  }, []);

  const requestCrop = useCallback<RequestCrop>(
    async (file, spec) => {
      // Decoding is where an unusable file is caught: a HEIC straight off an
      // iPhone used to upload successfully and then render as a broken image
      // everywhere except Safari, because nothing ever tried to open it.
      let image: LoadedImage;
      try {
        image = await loadImageForCrop(file);
      } catch (e) {
        toast.error(e instanceof ImageLoadError ? e.message : "לא הצלחנו לפתוח את התמונה");
        // undefined, not null: this file is unusable, but the batch it may be
        // part of should carry on to the next one.
        return undefined;
      }

      if (image.downscaled) {
        toast.message("התמונה הוקטנה מעט כדי שהדפדפן יוכל לעבד אותה.");
      }

      return new Promise<File | null>((resolve) => {
        resolver.current = resolve;
        setPending({ image, spec, fileName: file.name });
      });
    },
    [],
  );

  return (
    <CropContext.Provider value={requestCrop}>
      {children}
      <ImageCropDialog
        open={pending !== null}
        image={pending?.image ?? null}
        spec={pending?.spec ?? "product"}
        fileName={pending?.fileName ?? "image.jpg"}
        onCancel={() => settle(null)}
        onConfirm={(cropped) => settle(cropped)}
      />
    </CropContext.Provider>
  );
};

export default CropProvider;
