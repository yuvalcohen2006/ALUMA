import { describe, expect, it } from "vitest";
import { mailtoLink } from "./mailto";

/**
 * The email tile linked to a bare `mailto:address` — no subject, no body. Any
 * mail client opens that as an empty message, which is what "it doesn't open
 * with a pre-written message" actually was. WhatsApp got a prefilled text from
 * day one; email never did.
 */
describe("mailtoLink", () => {
  it("addresses the mail", () => {
    expect(mailtoLink("hi@aluma.com")).toBe("mailto:hi@aluma.com");
  });

  it("carries a subject", () => {
    expect(mailtoLink("hi@aluma.com", "פנייה מהאתר")).toBe(
      "mailto:hi@aluma.com?subject=%D7%A4%D7%A0%D7%99%D7%99%D7%94%20%D7%9E%D7%94%D7%90%D7%AA%D7%A8",
    );
  });

  it("carries a subject and a body together", () => {
    const link = mailtoLink("hi@aluma.com", "Subject", "Line one");
    expect(link).toBe("mailto:hi@aluma.com?subject=Subject&body=Line%20one");
  });

  it("keeps line breaks in the body", () => {
    // %0A, not a raw newline — a raw one truncates the link in some clients.
    expect(mailtoLink("hi@aluma.com", "S", "one\ntwo")).toContain("body=one%0Atwo");
  });

  it("encodes the characters that would otherwise end the link early", () => {
    expect(mailtoLink("hi@aluma.com", "a&b=c")).toContain("subject=a%26b%3Dc");
  });

  it("leaves out an empty subject rather than sending a blank one", () => {
    expect(mailtoLink("hi@aluma.com", "", "body")).toBe("mailto:hi@aluma.com?body=body");
  });
});
