/**
 * Supabase's auth errors in the language of the page.
 *
 * `AuthApiError.message` is always English — "Invalid login credentials",
 * "Email not confirmed" — and it was being passed straight into a toast on a
 * Hebrew page. Worse than untranslated: "Invalid login credentials" does not
 * tell a member whether the address or the password was wrong, or that they
 * have not confirmed their email yet.
 *
 * Anything unrecognised falls back to a plain Hebrew sentence rather than
 * leaking an English string from a library.
 */
const MAP: [RegExp, string][] = [
  [/invalid login credentials/i, "האימייל או הסיסמה אינם נכונים."],
  [/email not confirmed/i, "צריך לאשר את האימייל קודם. בדקו את תיבת הדואר."],
  [/user already registered/i, "כתובת האימייל הזו כבר רשומה במועדון."],
  [/password should be at least/i, "הסיסמה קצרה מדי, לפחות 6 תווים."],
  [/for security purposes|rate limit|too many requests/i, "יותר מדי ניסיונות. נסו שוב בעוד רגע."],
  [/unable to validate email address|invalid format/i, "כתובת האימייל אינה תקינה."],
  [/network|fetch/i, "אין חיבור לרשת. בדקו את החיבור ונסו שוב."],
];

export function authErrorMessage(err: unknown): string {
  const raw = typeof err === "string" ? err : (err as { message?: string })?.message ?? "";
  for (const [pattern, message] of MAP) if (pattern.test(raw)) return message;
  return "אירעה שגיאה. נסו שוב.";
}
