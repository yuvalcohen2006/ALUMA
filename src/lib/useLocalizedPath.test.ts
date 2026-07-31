import { describe, expect, it } from "vitest";
import { localizePath, stripLanguagePrefix } from "./useLocalizedPath";
import { languageFromPath } from "@/i18n";

describe("languageFromPath", () => {
  it("treats /en and its descendants as English", () => {
    expect(languageFromPath("/en")).toBe("en");
    expect(languageFromPath("/en/")).toBe("en");
    expect(languageFromPath("/en/collections")).toBe("en");
  });

  it("does not match paths that merely start with the letters 'en'", () => {
    // The regex needs the boundary, or /enquiries would silently become English.
    expect(languageFromPath("/enquiries")).toBe("he");
    expect(languageFromPath("/engagement/rings")).toBe("he");
  });

  it("defaults to Hebrew at the root", () => {
    expect(languageFromPath("/")).toBe("he");
    expect(languageFromPath("/collections")).toBe("he");
  });
});

describe("localizePath", () => {
  it("leaves Hebrew paths unprefixed", () => {
    expect(localizePath("/collections", "he")).toBe("/collections");
    expect(localizePath("/", "he")).toBe("/");
  });

  it("prefixes English paths", () => {
    expect(localizePath("/collections", "en")).toBe("/en/collections");
    expect(localizePath("/", "en")).toBe("/en");
  });

  it("is idempotent, so re-localising never doubles the prefix", () => {
    expect(localizePath("/en/collections", "en")).toBe("/en/collections");
    expect(localizePath("/en/collections", "he")).toBe("/collections");
  });

  it("passes external and in-page links through untouched", () => {
    expect(localizePath("https://wa.me/972504519062", "en")).toBe("https://wa.me/972504519062");
    expect(localizePath("mailto:outdooraluma@gmail.com", "en")).toBe("mailto:outdooraluma@gmail.com");
    expect(localizePath("tel:+972504519062", "en")).toBe("tel:+972504519062");
    expect(localizePath("#main", "en")).toBe("#main");
  });

  it("tolerates paths written without a leading slash", () => {
    expect(localizePath("contact", "en")).toBe("/en/contact");
  });
});

describe("stripLanguagePrefix", () => {
  it("returns root rather than an empty string", () => {
    expect(stripLanguagePrefix("/en")).toBe("/");
  });

  it("keeps a lookalike segment", () => {
    expect(stripLanguagePrefix("/enquiries")).toBe("/enquiries");
  });
});
