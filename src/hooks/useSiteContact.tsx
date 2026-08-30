import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mergeContact, type ContactOverrides, type SiteContact } from "@/lib/site-contact";

const SiteContactContext = createContext<ContactOverrides | null>(null);

/**
 * The phone number, address and social links, as edited in /admin/settings.
 *
 * One query for the whole app, and `src/config/site.ts` underneath it, so the
 * site shows correct details on first paint and keeps showing them if the
 * request never lands.
 */
export const SiteContactProvider = ({ children }: { children: ReactNode }) => {
  const [overrides, setOverrides] = useState<ContactOverrides | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "contact")
          .maybeSingle();
        if (!cancelled && data?.value) setOverrides(data.value as ContactOverrides);
      } catch {
        // Offline, or the row was never written. The shipped facts stand.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteContactContext.Provider value={overrides}>{children}</SiteContactContext.Provider>
  );
};

/** Never throws for a missing provider — the fallback is the whole design. */
export function useSiteContact(): SiteContact {
  const overrides = useContext(SiteContactContext);
  return useMemo(() => mergeContact(overrides), [overrides]);
}
