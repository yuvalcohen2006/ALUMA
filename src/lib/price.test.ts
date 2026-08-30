import { describe, expect, it } from "vitest";
import { formatPrice, parsePriceInput } from "./price";

/**
 * Prices are optional on purpose — the brand's own line is that every piece is
 * made to order and there is no price list. So "no price" has to be a normal,
 * silent state, not a zero and not a "₪0".
 */
describe("formatPrice", () => {
  it("writes a price the way it is written in a shop here", () => {
    expect(formatPrice(12400)).toBe("₪12,400");
  });

  it("drops the decimals when there are none to show", () => {
    expect(formatPrice(990)).toBe("₪990");
  });

  it("keeps the agorot when there are any", () => {
    expect(formatPrice(99.9)).toBe("₪99.90");
  });

  it("says nothing at all when there is no price", () => {
    expect(formatPrice(null)).toBeNull();
    expect(formatPrice(undefined)).toBeNull();
  });

  it("treats zero as 'not priced', not as free", () => {
    // A saved-but-empty field arrives as 0 more often than as null.
    expect(formatPrice(0)).toBeNull();
  });

  it("ignores a negative price rather than printing one", () => {
    expect(formatPrice(-50)).toBeNull();
  });
});

describe("parsePriceInput", () => {
  it("takes a plain number", () => {
    expect(parsePriceInput("12400")).toBe(12400);
  });

  it("takes the number the way somebody would actually type it", () => {
    expect(parsePriceInput("₪12,400")).toBe(12400);
    expect(parsePriceInput("12 400")).toBe(12400);
  });

  it("returns null for an empty field, so the price is simply unset", () => {
    expect(parsePriceInput("")).toBeNull();
    expect(parsePriceInput("   ")).toBeNull();
  });

  it("returns null for something that is not a number at all", () => {
    expect(parsePriceInput("לפי הצעת מחיר")).toBeNull();
  });

  it("keeps agorot when they are typed", () => {
    expect(parsePriceInput("99.90")).toBe(99.9);
  });
});
