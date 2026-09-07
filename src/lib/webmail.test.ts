import { describe, expect, it } from "vitest";
import { gmailComposeLink } from "./webmail";

describe("the Gmail compose link", () => {
  /**
   * Gmail reads `su`, not `subject`. Passing `subject` is not an error — the
   * window simply opens with an empty subject line, which looks exactly like
   * the prefill failing.
   */
  it("uses su for the subject, because Gmail ignores `subject`", () => {
    const url = new URL(gmailComposeLink("hi@aluma.co.il", "פנייה מהאתר"));
    expect(url.searchParams.get("su")).toBe("פנייה מהאתר");
    expect(url.searchParams.get("subject")).toBeNull();
  });

  it("asks for a fullscreen compose window", () => {
    const url = new URL(gmailComposeLink("hi@aluma.co.il"));
    expect(url.searchParams.get("view")).toBe("cm");
    expect(url.searchParams.get("fs")).toBe("1");
    expect(url.searchParams.get("to")).toBe("hi@aluma.co.il");
  });

  /**
   * `/u/0/` pins the compose window to whichever account signed in FIRST in
   * that browser — a coin flip for anyone with a work and a personal account.
   */
  it("does not pin the visitor to their first-signed-in account", () => {
    expect(gmailComposeLink("hi@aluma.co.il")).not.toContain("/u/0");
    expect(new URL(gmailComposeLink("hi@aluma.co.il")).pathname).toBe("/mail/");
  });

  it("leaves out an empty subject or body rather than sending blanks", () => {
    const url = new URL(gmailComposeLink("hi@aluma.co.il", "   ", ""));
    expect(url.searchParams.has("su")).toBe(false);
    expect(url.searchParams.has("body")).toBe(false);
  });

  it("carries a multi-line Hebrew body intact", () => {
    const body = "היי,\n\nאשמח לשמוע על ריהוט חוץ.\n";
    const url = new URL(gmailComposeLink("hi@aluma.co.il", "נושא", body));
    expect(url.searchParams.get("body")).toBe(body);
  });
});
