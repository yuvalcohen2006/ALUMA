/**
 * Meta Pixel helpers. The pixel is NOT loaded on page load — call loadPixel()
 * only after the visitor has consented (see src/lib/consent.ts). trackPixel()
 * is a no-op until then.
 */
const PIXEL_ID = "4514362492184862";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
};

let initialized = false;

/** Inject + initialize the Meta Pixel. Idempotent. Consent-gated by the caller. */
export function loadPixel(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const w = window as unknown as { fbq?: Fbq; _fbq?: Fbq };
  if (!w.fbq) {
    const n = function (...args: unknown[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue!.push(args);
    } as Fbq;
    n.queue = [];
    n.loaded = true;
    n.version = "2.0";
    w.fbq = n;
    w._fbq = n;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  w.fbq?.("init", PIXEL_ID);
  // PageView is fired per-route by useSiteTracking (also consent-gated).
}

export type PixelEvent =
  | "PageView"
  | "Lead"
  | "CompleteRegistration"
  | "ViewContent"
  | "InitiateCheckout"
  | "Contact"
  | "Purchase";

export interface PixelParams {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  [key: string]: unknown;
}

export function trackPixel(event: PixelEvent, params?: PixelParams) {
  try {
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof fbq === "function") {
      fbq("track", event, params ?? {});
    }
  } catch {
    // ignore pixel errors
  }
}
