/**
 * Is this article body authored HTML, or plain text the owner typed?
 *
 * The admin's magazine field is one textarea and accepts both, so the page has
 * to guess. The old guess was "a `<`, a Latin letter, and a `>` somewhere
 * later" — which an ordinary Hebrew sentence containing an email address in
 * angle brackets satisfies. The whole post was then treated as authored HTML:
 * the sanitiser dropped the unknown tag and, with it, every newline, and the
 * article collapsed into one unbroken block of running text.
 *
 * Recognising a real tag by NAME is the fix. An article uses a handful of
 * them; anything else is text, and text keeps its paragraphs.
 */
const HTML =
  /<\s*\/?\s*(?:p|br|h[1-6]|ul|ol|li|strong|em|b|i|a|blockquote|img|figure|figcaption|hr|div|span|table|thead|tbody|tr|td|th)\b(?:\s[^<>]*)?\s*\/?\s*>/i;

export const looksLikeHtml = (body: string): boolean => HTML.test(body);

/** Plain text to paragraphs, blank line by blank line. */
export const paragraphsToHtml = (body: string): string =>
  body
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

/** What the article page renders, whichever kind of body it was given. */
export const articleHtml = (body: string): string =>
  looksLikeHtml(body) ? body : paragraphsToHtml(body);
