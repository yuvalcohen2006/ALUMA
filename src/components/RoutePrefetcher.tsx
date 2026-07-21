import { useEffect } from "react";

/**
 * After first paint, prefetch the lazy chunks for the most-visited routes
 * so navigation feels instant. Uses requestIdleCallback to avoid blocking.
 */
const RoutePrefetcher = () => {
  useEffect(() => {
    const prefetch = () => {
      // Order matters loosely — most likely next pages first
      import("@/pages/Collections.tsx");
      import("@/pages/CollectionDetail.tsx");
      import("@/pages/Materials.tsx");
      import("@/pages/MaterialDetail.tsx");
      import("@/pages/Projects.tsx");
      import("@/pages/ProjectDetail.tsx");
      import("@/pages/Blog.tsx");
      import("@/pages/BlogPost.tsx");
      import("@/pages/Contact.tsx");
      import("@/pages/FAQ.tsx");
      import("@/pages/Story.tsx");
      import("@/pages/BeforeAfter.tsx");
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
