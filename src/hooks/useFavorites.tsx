import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const LS_KEY = "aluma_favorites_v1";

type Ctx = {
  ids: Set<string>;
  isFav: (productId: string) => boolean;
  toggle: (productId: string, collectionSlug?: string) => Promise<void>;
  count: number;
  loading: boolean;
};

const FavContext = createContext<Ctx>({
  ids: new Set(),
  isFav: () => false,
  toggle: async () => {},
  count: 0,
  loading: true,
});

const readLS = (): string[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};
const writeLS = (ids: string[]) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
  } catch {}
};

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Initial load + sync on auth change
  useEffect(() => {
    if (authLoading) return;
    (async () => {
      setLoading(true);
      const local = readLS();

      if (!user) {
        setIds(new Set(local));
        setLoading(false);
        return;
      }

      // Merge local into DB, then load DB as source of truth
      if (local.length > 0) {
        const rows = local.map((product_id) => ({ user_id: user.id, product_id }));
        await supabase.from("product_favorites").upsert(rows, { onConflict: "user_id,product_id", ignoreDuplicates: true });
        writeLS([]);
      }
      const { data } = await supabase
        .from("product_favorites")
        .select("product_id")
        .eq("user_id", user.id);
      setIds(new Set((data ?? []).map((r: any) => r.product_id)));
      setLoading(false);
    })();
  }, [user, authLoading]);

  const toggle = useCallback(
    async (productId: string, collectionSlug?: string) => {
      const has = ids.has(productId);
      const next = new Set(ids);
      if (has) next.delete(productId);
      else next.add(productId);
      setIds(next);

      if (!user) {
        writeLS(Array.from(next));
        return;
      }

      const { error } = has
        ? await supabase.from("product_favorites").delete().eq("user_id", user.id).eq("product_id", productId)
        : await supabase.from("product_favorites").upsert(
            { user_id: user.id, product_id: productId, collection_slug: collectionSlug ?? null },
            { onConflict: "user_id,product_id", ignoreDuplicates: true }
          );

      // On failure, roll the optimistic change back so the heart reflects reality.
      if (error) {
        setIds((cur) => {
          const revert = new Set(cur);
          if (has) revert.add(productId);
          else revert.delete(productId);
          return revert;
        });
        toast.error("לא הצלחנו לשמור את המועדף. נסו שוב.");
      }
    },
    [ids, user]
  );

  const value = useMemo<Ctx>(
    () => ({
      ids,
      isFav: (id) => ids.has(id),
      toggle,
      count: ids.size,
      loading: loading || authLoading,
    }),
    [ids, toggle, loading, authLoading]
  );

  return <FavContext.Provider value={value}>{children}</FavContext.Provider>;
};

export const useFavorites = () => useContext(FavContext);
