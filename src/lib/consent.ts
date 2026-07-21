// Authoritative consent state for NON-essential tracking (Meta Pixel + first-party
// analytics). Nothing that tracks the visitor may run unless getConsent() === "accepted".

const STORAGE_KEY = "aluma_cookie_consent_v1";

export type ConsentValue = "accepted" | "declined";

type Listener = (value: ConsentValue) => void;
const listeners = new Set<Listener>();

export function getConsent(): ConsentValue | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === "accepted";
}

export function setConsent(value: ConsentValue): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore storage failures (private mode, etc.)
  }
  listeners.forEach((l) => l(value));
}

/** Subscribe to consent changes; returns an unsubscribe fn. */
export function onConsentChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
