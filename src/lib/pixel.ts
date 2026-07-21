/**
 * Safe Meta Pixel event helper.
 * Falls back silently if the Facebook Pixel SDK isn't loaded yet.
 */
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
