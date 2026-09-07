/**
 * Getting an email link to actually open something.
 *
 * A `mailto:` link is correct and it is also, for a large share of visitors,
 * a link that does nothing at all. The browser hands the URL to a registered
 * protocol handler; if none is registered, Chrome and Edge do NOTHING — no
 * error, no tab, not even a console message, deliberately, so that a page
 * cannot learn which handlers a person has. Gmail only becomes a handler if
 * the person once accepted a prompt on mail.google.com.
 *
 * So the person most likely to click an email link on a furniture site — signed
 * into Gmail in a browser tab, no desktop mail client — is exactly the person
 * for whom it silently fails. That is the bug the owner hit.
 *
 * And a page cannot detect it. The list of protocol handlers is not exposed to
 * JavaScript, on privacy grounds. There is no callback, no error event, no
 * timeout that means anything. Any "did the mailto work?" check is folklore.
 *
 * The only honest fix is to make failure impossible: keep the mailto for people
 * who have a client, offer a direct Gmail compose link, and let anyone copy the
 * address. Three routes, no detection.
 */

/**
 * Gmail's web compose URL.
 *
 * Two details that are easy to get wrong and both silently degrade:
 *
 * The subject parameter is `su`, not `subject`. Gmail ignores `subject`
 * entirely, so the compose window opens with an empty subject line and looks
 * like the prefill failed.
 *
 * No `/u/0/` segment. That pins the compose window to whichever account signed
 * in first in that browser, which for anyone with a work and a personal account
 * is a coin flip. Without it Gmail uses the active account.
 *
 * Signed-out visitors are not a dead end: Gmail 302s to the sign-in page with
 * this URL as `continue`, so they land in the composed message after logging in.
 */
export function gmailComposeLink(to: string, subject?: string, body?: string): string {
  const params = new URLSearchParams({ view: "cm", fs: "1", to });
  if (subject?.trim()) params.set("su", subject);
  if (body?.trim()) params.set("body", body);
  // URLSearchParams encodes spaces as "+", which Gmail decodes correctly in
  // its own query string — unlike a mailto:, where several desktop clients
  // render the plus literally. This is why the two builders differ.
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/**
 * Put text on the clipboard, however the browser allows.
 *
 * `navigator.clipboard` needs a secure context and a user gesture, and is
 * absent altogether on older mobile browsers — so the execCommand path stays
 * as a fallback rather than being treated as dead. Returns whether it worked,
 * because a copy button that lies is worse than one that is not there.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }

  try {
    const el = document.createElement("textarea");
    el.value = text;
    // Off-screen rather than hidden: a display:none or visibility:hidden
    // element cannot be selected, so the copy silently produces nothing.
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.top = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
