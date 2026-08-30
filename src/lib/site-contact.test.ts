import { describe, expect, it } from "vitest";
import { SITE } from "@/config/site";
import { mergeContact } from "./site-contact";

/**
 * The admin's contact screen stores flat strings — "phone", "whatsapp",
 * "address" — while the site needs a display form, a `tel:` form and a wa.me
 * link. Getting from one to the other is the whole job here, and typing a
 * number the way a person types it must not produce a dead link.
 */
describe("mergeContact", () => {
  it("returns the shipped facts when the owner has set nothing", () => {
    const c = mergeContact(null);
    expect(c.phone.display).toBe(SITE.phone.display);
    expect(c.phone.tel).toBe(SITE.phone.tel);
    expect(c.email).toBe(SITE.email);
    expect(c.address.full).toBe(SITE.address.full);
  });

  it("shows an edited phone number and dials it", () => {
    const c = mergeContact({ phone: "052-123-4567" });
    expect(c.phone.display).toBe("052-123-4567");
    expect(c.phone.tel).toBe("+972521234567");
  });

  it("dials a number typed with spaces just as well", () => {
    expect(mergeContact({ phone: "052 123 4567" }).phone.tel).toBe("+972521234567");
  });

  it("keeps a number already written in international form", () => {
    const c = mergeContact({ phone: "+972 52 123 4567" });
    expect(c.phone.tel).toBe("+972521234567");
  });

  it("builds a working wa.me link from a number typed locally", () => {
    const c = mergeContact({ whatsapp: "050-451-9062" });
    expect(c.whatsapp.href).toBe("https://wa.me/972504519062");
    expect(c.whatsapp.link("שלום")).toBe("https://wa.me/972504519062?text=%D7%A9%D7%9C%D7%95%D7%9D");
  });

  it("falls back to the phone number when no WhatsApp number is given", () => {
    const c = mergeContact({ phone: "052-123-4567" });
    expect(c.whatsapp.href).toBe("https://wa.me/972521234567");
  });

  it("treats a field the owner cleared as 'not set'", () => {
    const c = mergeContact({ phone: "   ", email: "", address: "" });
    expect(c.phone.display).toBe(SITE.phone.display);
    expect(c.email).toBe(SITE.email);
    expect(c.address.full).toBe(SITE.address.full);
  });

  it("replaces the address wholesale", () => {
    const c = mergeContact({ address: "הברושים 4, תל אביב" });
    expect(c.address.full).toBe("הברושים 4, תל אביב");
    // The city drives the map link, so it has to follow the address.
    expect(c.address.city).toBe("תל אביב");
  });

  it("splits an edited address into the street and the city", () => {
    // The showroom band prints the street and searches maps on the city.
    const c = mergeContact({ address: "הברושים 4, תל אביב" });
    expect(c.address.street).toBe("הברושים 4");
    expect(c.address.city).toBe("תל אביב");
  });

  it("treats a one-part address as both street and city", () => {
    const c = mergeContact({ address: "המפעל" });
    expect(c.address.street).toBe("המפעל");
  });

  it("keeps the shipped city when the address has no comma", () => {
    expect(mergeContact({ address: "המפעל" }).address.city).toBe("המפעל");
  });

  it("takes over the social links, and hides the ones left blank", () => {
    const c = mergeContact({ instagram: "https://instagram.com/x", facebook: "" });
    expect(c.social.instagram).toBe("https://instagram.com/x");
    expect(c.social.facebook).toBe(SITE.social.facebook);
  });

  it("ignores a phone number with no digits rather than making a dead link", () => {
    const c = mergeContact({ phone: "צרו קשר" });
    expect(c.phone.display).toBe(SITE.phone.display);
    expect(c.phone.tel).toBe(SITE.phone.tel);
  });
});
