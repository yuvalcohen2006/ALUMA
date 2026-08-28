import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type TextMap = Record<string, string>;

const SiteTextContext = createContext<TextMap>({});

/**
 * Editable copy, loaded once for the whole app.
 *
 * One query on mount rather than a query per string — a dozen components each
 * fetching their own headline would be a dozen round trips for a few hundred
 * bytes.
 */
export const SiteTextProvider = ({ children }: { children: ReactNode }) => {
  const [texts, setTexts] = useState<TextMap>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.from("site_texts").select("key, value");
        if (cancelled || !data) return;
        const map: TextMap = {};
        for (const row of data as { key: string; value: string }[]) {
          // A blank row means "not written yet", not "render nothing" — leave
          // it out so the caller's fallback wins.
          if (row.value?.trim()) map[row.key] = row.value;
        }
        setTexts(map);
      } catch {
        // Offline, or the table isn't migrated yet. Every caller passes the
        // copy it ships with, so the site renders exactly as it would have.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <SiteTextContext.Provider value={texts}>{children}</SiteTextContext.Provider>;
};

/**
 * `const t = useSiteText(); t("home.statement.lead", "אלומה נולדה…")`
 *
 * The second argument is not optional by convention: it is the copy the
 * component ships with, and it is what renders on first paint, while offline,
 * before the migration has run, and whenever the client has cleared a field.
 * That makes the CMS additive — it can improve the site but it cannot break
 * it, which matters when a non-technical person is the one typing.
 */
export function useSiteText() {
  const texts = useContext(SiteTextContext);
  return useMemo(
    () => (key: string, fallback: string) => texts[key] ?? fallback,
    [texts],
  );
}
