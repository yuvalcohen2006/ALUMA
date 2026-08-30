import { describe, expect, it } from "vitest";
import { submitErrorMessage } from "./submitError";

/**
 * When a submission fails, the person has to be told which failure it was.
 *
 * The old code called `ctx.json()` on the edge function's response — but
 * supabase-js has already read that body, so the second read throws, the real
 * reason is swallowed, and every failure reads "שגיאה בשליחה" no matter what
 * it was. Someone who has simply sent three messages in an hour is told the
 * site is broken.
 */
describe("submitErrorMessage", () => {
  it("uses the reason the server gave", async () => {
    const res = new Response(JSON.stringify({ error: "נשלחו יותר מדי פניות" }), { status: 429 });
    expect(await submitErrorMessage(res)).toBe("נשלחו יותר מדי פניות");
  });

  it("explains a rate limit even when the body is unreadable", async () => {
    // The body has already been consumed — the case that produced the wrong
    // message in the first place.
    const res = new Response("{}", { status: 429 });
    await res.text();
    expect(await submitErrorMessage(res)).toMatch(/יותר מדי/);
  });

  it("says the details were rejected on a validation failure", async () => {
    const res = new Response("", { status: 400 });
    await res.text();
    expect(await submitErrorMessage(res)).toMatch(/הפרטים/);
  });

  it("distinguishes a fault on our side", async () => {
    const res = new Response("", { status: 500 });
    await res.text();
    expect(await submitErrorMessage(res)).toMatch(/אצלנו/);
  });

  it("falls back to something honest when there is no response at all", async () => {
    expect(await submitErrorMessage(undefined)).toMatch(/נסו שוב|טלפון/);
  });

  it("never returns an empty string", async () => {
    for (const status of [400, 401, 404, 429, 500, 503]) {
      const res = new Response("", { status });
      expect((await submitErrorMessage(res)).length).toBeGreaterThan(5);
    }
  });
});
