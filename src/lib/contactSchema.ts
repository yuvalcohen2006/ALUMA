import { z } from "zod";

/**
 * Israeli phone number, accepting 0XX-XXXXXXX or +972, with spaces and dashes
 * anywhere.
 *
 * The previous pattern ended in `\d{3}[\s-]?\d{4}` — eight digits after the
 * prefix digit, i.e. exactly nine in total. Every Israeli MOBILE number has
 * ten (05X + seven), so the form rejected 050, 052, 054, 058… — including
 * Aluma's own 050-451-9062. Landlines passed, mobiles did not, which in
 * practice meant almost nobody could submit the contact form.
 *
 * Normalising first and matching second is what keeps it readable: strip the
 * separators, fold +972 to a leading 0, then match a fixed shape.
 *   02/03/04/08/09 + 7 digits  (landline)
 *   05X            + 8 digits  (mobile)
 *   07X            + 8 digits  (VoIP / non-geographic)
 */
const isIsraeliPhone = (raw: string): boolean => {
  const digits = raw.replace(/[\s-]/g, "").replace(/^\+?972/, "0");
  return /^0(?:[23489]\d{7}|5\d{8}|7\d{8})$/.test(digits);
};

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "שם קצר מדי" })
    .max(100, { message: "שם ארוך מדי" })
    // block obvious URLs / HTML to reduce spam
    .refine((v) => !/<[^>]*>|https?:\/\//i.test(v), {
      message: "שם לא תקין",
    }),
  phone: z
    .string()
    .trim()
    .min(9, { message: "מספר טלפון לא תקין" })
    .max(20, { message: "מספר טלפון ארוך מדי" })
    .refine(isIsraeliPhone, { message: "מספר טלפון ישראלי לא תקין" }),
  email: z
    .string()
    .trim()
    .max(255)
    .email({ message: "כתובת מייל לא תקינה" })
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .max(1000, { message: "הודעה ארוכה מדי (עד 1000 תווים)" })
    .optional()
    .or(z.literal("")),
  // honeypot, must remain empty
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
