/**
 * The home page's opening paragraph, on the three lines the client set.
 *
 * The breaks are not derivable from the text. The first one falls mid
 * sentence, after "שלדת אלומיניום," — so no rule about sentences, commas or
 * measure produces them, and natural wrapping cannot either: at a width that
 * fits the longest line, the browser would pull "בדי" up onto the first line
 * and the break would land in the wrong place.
 *
 * So the breaks have to be stated. Three sources, in order:
 *
 *   1. Newlines in the copy. If the owner has pressed Enter in the admin's
 *      textarea, those are the breaks — their call, not ours.
 *   2. Otherwise the markers below, which reproduce what the client asked for
 *      on the copy as it stands today.
 *   3. Otherwise the paragraph whole, wrapping normally. A rewrite that no
 *      longer contains the markers gets sensible behaviour rather than a
 *      mangled one.
 *
 * This lives in code rather than in the database because it is a LAYOUT
 * requirement. Shipping it as a migration made three correct lines depend on
 * someone remembering to run a script, which is how the page spent a day
 * showing four.
 */
const BREAK_AFTER = ["שלדת אלומיניום,", "של ישראל."];

export function statementLines(body: string): string[] {
  const authored = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (authored.length > 1) return authored;

  let rest = body.trim();
  const lines: string[] = [];

  for (const marker of BREAK_AFTER) {
    const at = rest.indexOf(marker);
    if (at === -1) continue;
    const end = at + marker.length;
    lines.push(rest.slice(0, end).trim());
    rest = rest.slice(end).trim();
  }

  if (rest) lines.push(rest);
  return lines.length > 0 ? lines : [body.trim()];
}
