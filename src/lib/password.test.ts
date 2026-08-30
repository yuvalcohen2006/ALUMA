import { describe, expect, it } from "vitest";
import { checkNewPassword } from "./password";

/**
 * Whoever ends up running this site is not a technical person, so a rejected
 * password has to say what to do about it — not "invalid password".
 */
describe("checkNewPassword", () => {
  it("accepts a decent password typed twice", () => {
    expect(checkNewPassword("sunflower-terrace-9", "sunflower-terrace-9")).toBeNull();
  });

  it("says how many characters are missing rather than just refusing", () => {
    expect(checkNewPassword("abc", "abc")).toBe("הסיסמה צריכה להיות באורך 8 תווים לפחות.");
  });

  it("catches a typo in the confirmation", () => {
    expect(checkNewPassword("sunflower-terrace-9", "sunflower-terrace-8")).toBe(
      "שתי הסיסמאות לא זהות.",
    );
  });

  it("asks for a password at all before anything else", () => {
    expect(checkNewPassword("", "")).toBe("צריך להקליד סיסמה.");
  });

  it("does not count spaces at the ends as characters", () => {
    // Eight spaces is not an eight-character password.
    expect(checkNewPassword("  abc   ", "  abc   ")).toBe(
      "הסיסמה צריכה להיות באורך 8 תווים לפחות.",
    );
  });

  it("allows a long passphrase with spaces inside it", () => {
    expect(checkNewPassword("two chairs one table", "two chairs one table")).toBeNull();
  });
});
