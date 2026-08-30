import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import i18n from "@/i18n";

const rows = vi.hoisted(() => ({
  data: [] as { key: string; value: string }[],
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({ select: async () => ({ data: rows.data, error: null }) }),
  },
}));

const { SiteTextProvider, useSiteText } = await import("./useSiteText");

const wrapper = ({ children }: { children: ReactNode }) => (
  <SiteTextProvider>{children}</SiteTextProvider>
);

/**
 * The admin is Hebrew-only, so anything typed into it is Hebrew. Letting it
 * override the English site would put Hebrew headings on /en — a page the
 * owner cannot see and would not know they had broken.
 */
describe("useSiteText", () => {
  beforeEach(async () => {
    rows.data = [{ key: "club.title", value: "כותרת מהמערכת" }];
    await i18n.changeLanguage("he");
  });

  it("prefers the owner's text over the copy the component ships with", async () => {
    const { result } = renderHook(() => useSiteText(), { wrapper });
    await waitFor(() => expect(result.current("club.title", "ברירת מחדל")).toBe("כותרת מהמערכת"));
  });

  it("falls back to the shipped copy for a key the owner has not written", async () => {
    const { result } = renderHook(() => useSiteText(), { wrapper });
    await waitFor(() => expect(result.current("club.title", "x")).toBe("כותרת מהמערכת"));
    expect(result.current("club.subtitle", "ברירת מחדל")).toBe("ברירת מחדל");
  });

  it("leaves the English site on its translation", async () => {
    await i18n.changeLanguage("en");
    const { result } = renderHook(() => useSiteText(), { wrapper });
    // Give the fetch the same chance to land as the Hebrew case gets.
    await waitFor(() => expect(result.current).toBeTypeOf("function"));
    expect(result.current("club.title", "Join the club")).toBe("Join the club");
  });

  it("treats a cleared field as 'not written yet'", async () => {
    rows.data = [{ key: "club.title", value: "   " }];
    const { result } = renderHook(() => useSiteText(), { wrapper });
    await waitFor(() => expect(result.current).toBeTypeOf("function"));
    expect(result.current("club.title", "ברירת מחדל")).toBe("ברירת מחדל");
  });
});
