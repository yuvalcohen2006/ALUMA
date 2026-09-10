import { describe, expect, it } from "vitest";
import { statementLines } from "./statement-lines";

const LIVE =
  "אנחנו מתכננים ומייצרים ריהוט חוץ בהתאמה אישית - שלדת אלומיניום, בדי Sunbrella ומשטחי אבן שנבחרו כדי לעמוד בשמש, במלח ובגשם של ישראל. כל פריט נמדד למרחב שהוא נכנס אליו, ונשאר בחוץ כל השנה.";

/**
 * Four lines is the bug this exists to stop. The paragraph is one 187-character
 * string in the database, and at the column's width it wraps to four — so the
 * three lines the client specified have to be produced from it, not hoped for.
 */
describe("statementLines", () => {
  it("puts the live copy on exactly the three lines that were asked for", () => {
    const lines = statementLines(LIVE);
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("אנחנו מתכננים ומייצרים ריהוט חוץ בהתאמה אישית - שלדת אלומיניום,");
    expect(lines[1]).toBe("בדי Sunbrella ומשטחי אבן שנבחרו כדי לעמוד בשמש, במלח ובגשם של ישראל.");
    expect(lines[2]).toBe("כל פריט נמדד למרחב שהוא נכנס אליו, ונשאר בחוץ כל השנה.");
  });

  it("loses not one word of the paragraph", () => {
    const rejoined = statementLines(LIVE).join(" ").replace(/\s+/g, " ");
    expect(rejoined).toBe(LIVE.replace(/\s+/g, " "));
  });

  it("lets the owner's own line breaks win", () => {
    expect(statementLines("שורה אחת\nשורה שתיים")).toEqual(["שורה אחת", "שורה שתיים"]);
  });

  it("ignores blank lines left behind by an extra Enter", () => {
    expect(statementLines("אחת\n\n\nשתיים")).toEqual(["אחת", "שתיים"]);
  });

  it("hands back a rewrite whole rather than mangling it", () => {
    const rewritten = "טקסט חדש לגמרי בלי שום סימן מוכר.";
    expect(statementLines(rewritten)).toEqual([rewritten]);
  });
});
