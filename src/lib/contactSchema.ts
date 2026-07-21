import { z } from "zod";

// Israeli phone: allows 0XX-XXXXXXX or +972, spaces/dashes optional
const phoneRegex = /^(\+?972|0)[\s-]?[23489567][\s-]?\d{3}[\s-]?\d{4}$/;

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
    .regex(phoneRegex, { message: "מספר טלפון ישראלי לא תקין" }),
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
  // honeypot — must remain empty
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
