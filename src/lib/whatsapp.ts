import { SITE } from "@/config/site";

/**
 * The single source for WhatsApp prefill messages across the site.
 *
 * Every page that opens a WhatsApp chat should build its link here rather than
 * hard-coding a wa.me URL or its own Hebrew string: `waLink()` for the generic
 * "tell me about Aluma" opener, `waLink("הקולקציות שלכם")` (or any other
 * subject) when the page wants the chat to open already pointed at what the
 * visitor was looking at. Keeping the sentence in one place means the tone and
 * wording of the first message customers send us can never drift between pages.
 *
 * The phone number itself lives in SITE.whatsapp (src/config/site.ts) — this
 * module only owns the message text.
 */

/** The generic opener used when no per-page context is given. */
export const WA_DEFAULT = "היי, אשמח לשמוע פרטים על אלומה";

/**
 * Build a wa.me link with a prefilled Hebrew message.
 *
 * @param context Optional subject that replaces "אלומה" in the opener, e.g.
 *   waLink("סלון מונוליט") → "היי, אשמח לשמוע פרטים על סלון מונוליט".
 * @returns A full https://wa.me/... URL with the message URL-encoded.
 */
export const waLink = (context?: string) =>
  SITE.whatsapp.link(context ? `היי, אשמח לשמוע פרטים על ${context}` : WA_DEFAULT);
