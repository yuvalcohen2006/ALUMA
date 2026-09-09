import { describe, expect, it } from "vitest";
import { articleHtml, looksLikeHtml } from "./article-body";

/**
 * The admin's magazine field takes plain text or HTML, so the page guesses.
 * The old guess matched anything from a `<` followed by a Latin letter to a
 * later `>` — so an ordinary Hebrew sentence with an email address in angle
 * brackets was treated as authored HTML, the sanitiser dropped the unknown tag
 * along with every newline, and the whole article collapsed into one block.
 */
describe("looksLikeHtml", () => {
  it("recognises a real article", () => {
    expect(looksLikeHtml("<p>שלום</p>")).toBe(true);
    expect(looksLikeHtml("טקסט<br/>ועוד")).toBe(true);
    expect(looksLikeHtml('<a href="/x">קישור</a>')).toBe(true);
  });

  it("does not mistake an angle-bracketed address for markup", () => {
    const body = "לשאלות אפשר לכתוב ל <info@alumaoutdoor.com> ונחזור אליכם.\n\nפסקה שנייה.";
    expect(looksLikeHtml(body)).toBe(false);
    // The paragraph break survives, which is the whole point.
    expect(articleHtml(body).match(/<p>/g)).toHaveLength(2);
  });

  it("does not mistake maths or a heart for markup", () => {
    expect(looksLikeHtml("הרוחב <b במקרה הזה")).toBe(false);
    expect(looksLikeHtml("אוהבים את זה <3 מאוד")).toBe(false);
  });

  it("keeps plain paragraphs and single line breaks apart", () => {
    expect(articleHtml("שורה\nשנייה\n\nפסקה")).toBe("<p>שורה<br/>שנייה</p><p>פסקה</p>");
  });
});
