import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { SITE } from "@/config/site";

const row = vi.hoisted(() => ({ value: null as Record<string, string> | null }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: row.value ? { value: row.value } : null }) }),
      }),
    }),
  },
}));

const { SiteContactProvider, useSiteContact } = await import("./useSiteContact");

const wrapper = ({ children }: { children: ReactNode }) => (
  <SiteContactProvider>{children}</SiteContactProvider>
);

describe("useSiteContact", () => {
  beforeEach(() => {
    row.value = null;
  });

  it("renders the shipped phone number before anything has loaded", () => {
    const { result } = renderHook(() => useSiteContact(), { wrapper });
    expect(result.current.phone.display).toBe(SITE.phone.display);
  });

  it("takes over once the owner has set one in the admin", async () => {
    row.value = { phone: "052-123-4567" };
    const { result } = renderHook(() => useSiteContact(), { wrapper });
    await waitFor(() => expect(result.current.phone.display).toBe("052-123-4567"));
    expect(result.current.phone.tel).toBe("+972521234567");
  });

  it("still renders the site when the settings row does not exist", async () => {
    const { result } = renderHook(() => useSiteContact(), { wrapper });
    await waitFor(() => expect(result.current.email).toBe(SITE.email));
  });

  it("works outside the provider, so no page can crash for want of one", () => {
    const { result } = renderHook(() => useSiteContact());
    expect(result.current.email).toBe(SITE.email);
  });
});
