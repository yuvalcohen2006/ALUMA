// Single source of truth for Aluma's brand & contact facts.
// Update values HERE, not inline in components, this prevents the kind of
// drift where the showroom address or phone number disagreed across pages.

const WHATSAPP_NUMBER = "972504519062"; // international, digits only (for wa.me links)

export const SITE = {
  name: "Aluma",
  nameHe: "אלומה",
  domain: "https://alumaoutdoor.com",
  // The studio inbox. Everything the site sends — contact-form notifications,
  // club signup notices — lands here, and every mailto: on the site points at
  // it. Change it HERE only; the edge functions read OWNER_EMAIL separately
  // (see docs/GUIDE.md) and must be updated to match.
  email: "outdooraluma@gmail.com",

  phone: {
    display: "050-451-9062", // human-readable, RTL-safe
    tel: "+972504519062", // for tel: links
  },

  whatsapp: {
    number: WHATSAPP_NUMBER,
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    /** Build a wa.me link with a prefilled (raw, un-encoded) message. */
    link: (text?: string) =>
      text
        ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
        : `https://wa.me/${WHATSAPP_NUMBER}`,
  },

  address: {
    street: "התמר 78",
    city: "יציץ",
    full: "התמר 78, יציץ",
  },

  // Real profile URLs go here when they exist. Empty string = icon is hidden
  // (better than a dead href="#" link).
  social: {
    instagram: "https://www.instagram.com/alumaoutdoor",
    facebook: "https://www.facebook.com/share/18XY83Ge4f/?mibextid=wwXIfr",
  },
} as const;
