/** Supabase's own floor, and low enough not to fight a non-technical owner. */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Why a new password is not acceptable, or null if it is.
 *
 * Returns the sentence to show the person, not an error code — every caller
 * would only have translated the code into this sentence anyway.
 */
export function checkNewPassword(password: string, confirmation: string): string | null {
  if (!password.trim()) return "צריך להקליד סיסמה.";
  // A password of spaces is not a password; count what is actually typed.
  if (password.trim().length < MIN_PASSWORD_LENGTH) {
    return `הסיסמה צריכה להיות באורך ${MIN_PASSWORD_LENGTH} תווים לפחות.`;
  }
  if (password !== confirmation) return "שתי הסיסמאות לא זהות.";
  return null;
}
