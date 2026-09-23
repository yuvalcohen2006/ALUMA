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

/**
 * Re-open a photograph that is already on the site and move it.
 *
 * The owner asked to be able to click a photo and adjust it, rather than
 * having to find the original file again to change how it sits. It is fetched
 * back out of storage and goes through exactly the same dialog; what comes
 * back is a new file, so the old one stays where it is until the screen
 * replaces the address it points at.
 */
type AdjustPhoto = (url: string, spec: PhotoSpecKey) => Promise<File | null | undefined>;

const CropContext = createContext<{ requestCrop: RequestCrop; adjustPhoto: AdjustPhoto } | null>(
  null,
);

const useCropContext = () => {
  const ctx = useContext(CropContext);
  if (!ctx) throw new Error("useCrop must be used inside CropProvider");
  return ctx;
};

export const useCrop = (): RequestCrop => useCropContext().requestCrop;
export const useAdjustPhoto = (): AdjustPhoto => useCropContext().adjustPhoto;

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

  const adjustPhoto = useCallback<AdjustPhoto>(
    async (url, spec) => {
      let file: File;
      try {
        // Public bucket, so this is a plain cross-origin GET; the blob is then
        // handled exactly like a file the owner had just picked.
        const response = await fetch(url, { mode: "cors" });
        if (!response.ok) throw new Error(String(response.status));
        const blob = await response.blob();
        file = new File([blob], url.split("/").pop() || "photo.jpg", {
          type: blob.type || "image/jpeg",
        });
      } catch {
        toast.error("לא הצלחנו לפתוח את התמונה לעריכה");
        return undefined;
      }
      return requestCrop(file, spec);
    },
    [requestCrop],
  );

  return (
    <CropContext.Provider value={{ requestCrop, adjustPhoto }}>
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
