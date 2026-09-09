import { describe, expect, it } from "vitest";
import { decodeHash } from "./safe-hash";

describe("decodeHash", () => {
  it("decodes a real Hebrew anchor", () => {
    expect(decodeHash("#%D7%A1%D7%9C%D7%95%D7%9F")).toBe("סלון");
  });

  it("takes the leading # off, and tolerates its absence", () => {
    expect(decodeHash("#lounge")).toBe("lounge");
    expect(decodeHash("lounge")).toBe("lounge");
  });

  // The whole point. A bare "%" is not a valid escape, and decodeURIComponent
  // throws on it — inside an effect that used to take the entire page down.
  it("survives a malformed escape instead of throwing", () => {
    expect(() => decodeHash("#%")).not.toThrow();
    expect(decodeHash("#%")).toBe("%");
    expect(decodeHash("#100%")).toBe("100%");
    expect(decodeHash("#%D7")).toBe("%D7");
  });
});
