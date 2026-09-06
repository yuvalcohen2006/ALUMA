import { describe, expect, it } from "vitest";
import { canonicalRedirect } from "./canonical-host";

const CANON = "alumaoutdoor.com";

/**
 * The site must live at one address.
 *
 * Supabase still holds the Vercel preview as its Site URL, so a Google
 * sign-in that starts on alumaoutdoor.com finishes on aluma-three.vercel.app
 * — a different address, showing the same site, with the session attached to
 * the wrong host. Rather than wait on a dashboard setting, the app sends
 * itself home.
 *
 * The hash matters more than anything else here: Supabase returns the session
 * tokens in it. Drop the hash on the way back and the sign-in that triggered
 * the redirect is destroyed by the redirect.
 */
describe("canonicalRedirect", () => {
  it("sends a preview host home", () => {
    expect(canonicalRedirect("https://aluma-three.vercel.app/admin", CANON)).toBe(
      "https://alumaoutdoor.com/admin",
    );
  });

  it("keeps the session tokens that arrive in the hash", () => {
    const from = "https://aluma-three.vercel.app/admin#access_token=abc&refresh_token=def";
    expect(canonicalRedirect(from, CANON)).toBe(
      "https://alumaoutdoor.com/admin#access_token=abc&refresh_token=def",
    );
  });

  it("keeps the query string", () => {
    expect(canonicalRedirect("https://aluma-three.vercel.app/faq?x=1", CANON)).toBe(
      "https://alumaoutdoor.com/faq?x=1",
    );
  });

  it("leaves the real domain alone", () => {
    expect(canonicalRedirect("https://alumaoutdoor.com/admin", CANON)).toBeNull();
  });

  it("leaves www alone — that is the site too", () => {
    expect(canonicalRedirect("https://www.alumaoutdoor.com/admin", CANON)).toBeNull();
  });

  it("never touches local development", () => {
    expect(canonicalRedirect("http://localhost:8080/admin", CANON)).toBeNull();
    expect(canonicalRedirect("http://127.0.0.1:8080/", CANON)).toBeNull();
  });

  it("catches any vercel preview, not just the one we know about", () => {
    expect(canonicalRedirect("https://aluma-git-branch-x.vercel.app/", CANON)).toBe(
      "https://alumaoutdoor.com/",
    );
  });

  it("does not redirect when no canonical host is configured", () => {
    expect(canonicalRedirect("https://aluma-three.vercel.app/admin", "")).toBeNull();
  });

  it("refuses to redirect a host that merely mentions vercel.app", () => {
    // vercel.app.evil.test is not a Vercel preview.
    expect(canonicalRedirect("https://vercel.app.evil.test/admin", CANON)).toBeNull();
  });
})
