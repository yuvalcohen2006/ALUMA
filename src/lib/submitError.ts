/**
 * Why a contact-form submission failed, in words the sender can act on.
 *
 * supabase-js reads the edge function's response body before handing us the
 * error, so a second `.json()` on it throws. The old code did exactly that
 * inside a `try` that swallowed the failure, which is why a rate-limited
 * submission — the most common real failure — reported itself as a generic
 * "error sending" and made a working site look broken.
 *
 * So: try the body, but never depend on it. The status alone is enough to say
 * something true.
 */
export async function submitErrorMessage(res: Response | undefined): Promise<string> {
  if (res) {
    try {
      // clone() so this read cannot be the one that consumes the body.
      const text = await res.clone().text();
      const parsed = text ? (JSON.parse(text) as { error?: unknown }) : null;
      if (typeof parsed?.error === "string" && parsed.error.trim()) return parsed.error;
    } catch {
      // Already read, or not JSON. The status still tells us plenty.
    }

    if (res.status === 429) {
      return "נשלחו יותר מדי פניות מהכתובת הזו. נסו שוב בעוד שעה, או פשוט התקשרו.";
    }
    if (res.status === 400 || res.status === 422) {
      return "הפרטים לא התקבלו. בדקו את השם והטלפון ונסו שוב.";
    }
    if (res.status >= 500) {
      return "התקלה אצלנו, לא אצלכם. נסו שוב בעוד רגע או התקשרו.";
    }
  }
  return "לא הצלחנו לשלוח. נסו שוב, או צרו קשר בטלפון.";
}
