import { afterEach, describe, expect, it, vi } from "vitest";
import { formatDateOnly } from "./dates";

/**
 * A Postgres `date` comes back as "2026-10-01". Handed to `new Date()` that is
 * parsed as UTC midnight, so formatting it anywhere west of Greenwich prints
 * the previous day — a member abroad saw their project's next milestone a day
 * early, every time, by exactly one day.
 */
describe("formatDateOnly", () => {
  afterEach(() => vi.useRealTimers());

  it("keeps the calendar day the owner typed", () => {
    expect(formatDateOnly("2026-10-01", "en-GB")).toBe("01/10/2026");
  });

  it("keeps it in a timezone behind UTC, where the naive parse slips back", () => {
    // The bug's home ground: UTC-5 turns UTC midnight into 19:00 the day before.
    const naive = new Date("2026-10-01").toLocaleDateString("en-GB", {
      timeZone: "America/New_York",
    });
    expect(naive).toBe("30/09/2026");
    expect(formatDateOnly("2026-10-01", "en-GB")).toBe("01/10/2026");
  });

  it("still handles a full timestamp", () => {
    expect(formatDateOnly("2026-10-01T12:00:00Z", "en-GB")).toContain("2026");
  });

  it("hands back anything it cannot read, rather than 'Invalid Date'", () => {
    expect(formatDateOnly("בקרוב", "en-GB")).toBe("בקרוב");
  });
});
