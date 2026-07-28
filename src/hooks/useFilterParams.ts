import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type FilterValue = Record<string, string[]>;

/**
 * Filter state lives in the URL (`?cat=salon,tables`) rather than in component
 * state, so a filtered view can be shared, bookmarked and walked back through
 * with the browser's back button.
 */
export function useFilterParams(keys: string[]) {
  const [params, setParams] = useSearchParams();

  // `keys` is almost always a fresh array literal from the caller, so join it
  // into a stable primitive before memoising on it.
  const keySignature = keys.join("|");

  // Every requested key is always present, so callers can read `value.cat`
  // directly — no `?? []` fallback, which would mint a new array each render
  // and defeat their memos.
  const value = useMemo(() => {
    const next: FilterValue = {};
    for (const key of keySignature ? keySignature.split("|") : []) {
      const raw = params.get(key);
      next[key] = raw ? raw.split(",").filter(Boolean) : [];
    }
    return next;
  }, [params, keySignature]);

  const setValue = useCallback(
    (next: FilterValue) => {
      const search = new URLSearchParams(params);
      for (const [key, selected] of Object.entries(next)) {
        if (selected.length) search.set(key, selected.join(","));
        else search.delete(key);
      }
      setParams(search, { replace: true });
    },
    [params, setParams]
  );

  const activeCount = useMemo(
    () => Object.values(value).reduce((sum, selected) => sum + selected.length, 0),
    [value]
  );

  return { value, setValue, activeCount };
}
