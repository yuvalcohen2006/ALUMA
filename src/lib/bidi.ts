/**
 * Keeping Latin runs intact inside Hebrew text.
 *
 * A right-to-left paragraph reorders anything it considers neutral. The
 * dangerous case is not a lone English word — those are strongly typed and
 * survive — it is digits with a neutral between them. When the Unicode
 * algorithm resolves that neutral it treats European numbers as right-to-left,
 * so "2400 × 1350" comes out as "1350 × 2400", and a leading "/" on a path
 * hops to the far end.
 *
 * In JSX the tool for this is <Ltr>, which renders a <bdi>. For plain strings
 * — toasts, aria-labels, document titles — there is no element to hang it on,
 * so the isolate goes in as characters.
 */

/** U+2066 LEFT-TO-RIGHT ISOLATE. */
export const LRI = "\u2066";
/** U+2069 POP DIRECTIONAL ISOLATE. */
export const PDI = "\u2069";

/**
 * Fences a Latin/numeric run so the surrounding paragraph cannot reorder it.
 * Invisible: the characters take no width and are not selected as text.
 */
export function isolateLtr(text: string): string {
  if (!text) return "";
  if (text.startsWith(LRI) && text.endsWith(PDI)) return text;
  return `${LRI}${text}${PDI}`;
}
