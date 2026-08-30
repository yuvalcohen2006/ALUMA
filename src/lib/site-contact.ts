import { SITE } from "@/config/site";

/** What the admin's contact screen stores, all of it optional. */
export type ContactOverrides = {
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  hours?: string;
};

export type SiteContact = {
  phone: { display: string; tel: string };
  whatsapp: { number: string; href: string; link: (text?: string) => string };
  email: string;
  address: { street: string; city: string; full: string };
  social: { instagram: string; facebook: string };
  hours: string | null;
};

/** A field the owner left blank means "use what the site ships with". */
const set = (v: string | undefined): string | null => {
  const trimmed = v?.trim();
  return trimmed ? trimmed : null;
};

/**
 * An Israeli number as wa.me and tel: want it: digits only, country code
 * included, no leading zero. Returns null for anything with no digits in it,
 * so a stray word never becomes a link that silently fails to dial.
 */
function internationalise(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (raw.trim().startsWith("+")) return digits;
  if (digits.startsWith("972")) return digits;
  return `972${digits.replace(/^0/, "")}`;
}

/**
 * The contact facts the site should show: whatever the owner has typed into
 * /admin/settings, over the values in `src/config/site.ts`.
 *
 * The static config stays the floor, so an empty table, an offline visitor or
 * a half-filled form all render the site exactly as it shipped.
 */
export function mergeContact(overrides: ContactOverrides | null | undefined): SiteContact {
  const o = overrides ?? {};

  const phoneRaw = set(o.phone);
  const phoneDigits = phoneRaw ? internationalise(phoneRaw) : null;
  const phone = phoneDigits
    ? { display: phoneRaw as string, tel: `+${phoneDigits}` }
    : { display: SITE.phone.display, tel: SITE.phone.tel };

  // WhatsApp usually IS the phone number, so it follows it unless set apart.
  const waDigits =
    (set(o.whatsapp) ? internationalise(set(o.whatsapp) as string) : null) ??
    phoneDigits ??
    SITE.whatsapp.number;
  const href = `https://wa.me/${waDigits}`;

  // "street, city" is how the admin field is labelled and how Israeli
  // addresses are written. One part means the same thing twice rather than an
  // empty half.
  const full = set(o.address) ?? SITE.address.full;
  const parts = full.split(",").map((p) => p.trim()).filter(Boolean);
  const address =
    full === SITE.address.full
      ? { street: SITE.address.street, city: SITE.address.city, full }
      : { street: parts[0] ?? full, city: parts[parts.length - 1] ?? full, full };

  return {
    phone,
    whatsapp: {
      number: waDigits,
      href,
      link: (text?: string) => (text ? `${href}?text=${encodeURIComponent(text)}` : href),
    },
    email: set(o.email) ?? SITE.email,
    address,
    social: {
      instagram: set(o.instagram) ?? SITE.social.instagram,
      facebook: set(o.facebook) ?? SITE.social.facebook,
    },
    hours: set(o.hours),
  };
}
