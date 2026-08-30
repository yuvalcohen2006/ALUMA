/**
 * Prices are optional throughout. Aluma's own copy says every piece is made to
 * order and there is no price list, so a product without one is the normal
 * case and must render as nothing — never "₪0", never a dash.
 */

/**
 * The price as a shopper reads it, or null if there isn't one to show.
 *
 * Built by hand rather than with Intl: `he-IL` currency formatting puts the
 * sign after the number and wraps it in RTL marks, which is not how prices are
 * written on Israeli shop sites — and the invisible marks broke every
 * comparison anyone tried to make against the output.
 */
export function formatPrice(price: number | null | undefined): string | null {
  if (price == null || !Number.isFinite(price) || price <= 0) return null;

  // Agorot only when there are any: ₪990, but ₪99.90.
  const whole = Math.floor(price);
  const agorot = Math.round((price - whole) * 100);
  const grouped = whole.toLocaleString("en-US");

  return agorot > 0
    ? `₪${grouped}.${String(agorot).padStart(2, "0")}`
    : `₪${grouped}`;
}

/**
 * What the owner typed, as a number — or null to leave the product unpriced.
 *
 * People type "₪12,400" and "12 400". Refusing those would look like the field
 * was broken, so they are read the same as "12400".
 */
export function parsePriceInput(raw: string): number | null {
  const digits = raw.replace(/[^\d.]/g, "");
  if (!digits) return null;
  const value = Number(digits);
  return Number.isFinite(value) && value > 0 ? value : null;
}
