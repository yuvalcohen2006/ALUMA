import { MAX_UPLOAD_MB } from "@/lib/photo-specs";

/**
 * Getting a photograph off a phone and into a crop dialog without it arriving
 * sideways, blowing up a mobile browser, or exporting something other than what
 * was on screen.
 *
 * The whole file exists to make ONE guarantee: the pixels the owner drags
 * around are the same pixels that get uploaded. Everything below serves that.
 *
 * EXIF is the reason. A photo from a phone is very often stored landscape with
 * an orientation tag saying "rotate this". Browsers apply that tag when they
 * render an <img>, and historically did NOT apply it when the same image was
 * drawn to a canvas — so the obvious implementation shows an upright photo,
 * crops what it sees, and uploads a sideways one. Rather than track which
 * browser does what, the orientation is resolved exactly once here and
 * everything downstream works from a normalised copy that has no EXIF at all.
 */

/**
 * The longest side of the working copy.
 *
 * A modern phone photo is 12-50MP. iOS Safari has historically refused canvases
 * past roughly 16.7 million pixels, and a browser that refuses does so by
 * returning a blank canvas rather than by throwing — a silently white upload.
 * 4096 on the longest side keeps the worst case (4096²) under that, and is
 * still comfortably more than the largest thing the site exports.
 */
const MAX_WORK_PX = 4096;

/** JPEG quality for the exported crop. */
const JPEG_QUALITY = 0.9;

export type LoadedImage = {
  /** A blob URL of the normalised copy — upright, capped, EXIF stripped. */
  url: string;
  width: number;
  height: number;
  /** Whether the working copy had to be shrunk to fit MAX_WORK_PX. */
  downscaled: boolean;
  /** Must be called when the dialog closes, or the blob leaks for the session. */
  release: () => void;
};

export class ImageLoadError extends Error {}

function canvasOf(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageLoadError("2d context unavailable");
  return { canvas, ctx };
}

async function decode(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      // The option is what applies the EXIF rotation. Where it is unsupported
      // the browser throws rather than ignoring it, which is why this is a
      // try and not a feature test.
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      try {
        return await createImageBitmap(file);
      } catch {
        /* fall through to the <img> path */
      }
    }
  }

  // <img> applies EXIF orientation by default (image-orientation: from-image),
  // so this fallback agrees with the bitmap path rather than fighting it.
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new ImageLoadError("decode failed"));
      img.src = url;
    });
  } finally {
    // Safe: the decoded image keeps its own pixels once loaded.
    URL.revokeObjectURL(url);
  }
}

function sizeOf(src: ImageBitmap | HTMLImageElement) {
  return src instanceof HTMLImageElement
    ? { w: src.naturalWidth, h: src.naturalHeight }
    : { w: src.width, h: src.height };
}

/**
 * Decode a picked file into something the crop dialog can show and export.
 *
 * Rejects rather than silently accepting: a file the browser cannot decode is
 * the HEIC case, and it used to upload successfully and then render as a broken
 * image everywhere except Safari.
 */
export async function loadImageForCrop(file: File): Promise<LoadedImage> {
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new ImageLoadError(`הקובץ גדול מ-${MAX_UPLOAD_MB}MB`);
  }

  const source = await decode(file).catch(() => {
    throw new ImageLoadError("לא הצלחנו לפתוח את התמונה. שמרו אותה כ-JPG ונסו שוב.");
  });

  const natural = sizeOf(source);
  if (!natural.w || !natural.h) throw new ImageLoadError("התמונה ריקה");

  const ratio = Math.min(1, MAX_WORK_PX / Math.max(natural.w, natural.h));
  const w = Math.round(natural.w * ratio);
  const h = Math.round(natural.h * ratio);

  const { canvas, ctx } = canvasOf(w, h);
  /* White first, and this is the pass that matters.
     PNG and WebP are both accepted, both can carry an alpha channel, and this
     is where the file is first written out as JPEG — which has no alpha, so
     every transparent pixel becomes BLACK. exportCrop further down fills white
     before it draws, but by then the image it is handed has already been
     flattened here, so that fill had nothing left to fill. A cut-out product
     shot on a transparent background arrived on the site on a black slab. */
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, w, h);
  if ("close" in source) source.close();

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.95));
  if (!blob) throw new ImageLoadError("לא הצלחנו לעבד את התמונה");

  const url = URL.createObjectURL(blob);
  return {
    url,
    width: w,
    height: h,
    downscaled: ratio < 1,
    release: () => URL.revokeObjectURL(url),
  };
}

/**
 * Bake the crop.
 *
 * One drawImage, from the normalised copy straight to a canvas the size of the
 * OUTPUT — not the size of the photograph. That is what keeps every canvas
 * limit above irrelevant at export time as well as during interaction.
 *
 * The white fill underneath matters for PNGs with transparency: JPEG has no
 * alpha, and the specification says to composite onto black while several
 * browsers have historically done something else entirely. Filling first means
 * the result is the same everywhere and it is white, which is the page colour.
 */
export async function exportCrop(
  imageUrl: string,
  source: { sx: number; sy: number; sw: number; sh: number },
  output: { w: number; h: number },
  fileName = "image.jpg",
): Promise<File> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new ImageLoadError("crop source failed to load"));
    el.src = imageUrl;
  });

  const { canvas, ctx } = canvasOf(output.w, output.h);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, output.w, output.h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    img,
    source.sx,
    source.sy,
    source.sw,
    source.sh,
    0,
    0,
    output.w,
    output.h,
  );

  const blob = await new Promise<Blob | null>((res) =>
    // Quality passed explicitly: the HTML spec only says a user agent "will use
    // its default", so the widely-quoted 0.92 is not something to rely on.
    canvas.toBlob(res, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) throw new ImageLoadError("לא הצלחנו לשמור את החיתוך");

  const base = fileName.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}
