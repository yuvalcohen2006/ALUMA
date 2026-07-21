import { useEffect } from "react";

/**
 * After first paint, prefetch the lazy chunks for the most-visited routes
 * so navigation feels instant. Uses requestIdleCallback to avoid blocking.
 */
const RoutePrefetcher = () => {
  useEffect(() => {
    const prefetch = () => {
      // Only the few most-likely next routes. Prefetching every page on load
      // just pulls the whole app back down and defeats the code-splitting.
      import("@/pages/Collections.tsx");
      import("@/pages/CollectionDetail.tsx");
      import("@/pages/Contact.tsx");
    };

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(prefetch, { timeout: 2500 });
    } else {
      const t = window.setTimeout(prefetch, 1500);
      return () => clearTimeout(t);
    }
  }, []);

  return null;
};

export default RoutePrefetcher;
