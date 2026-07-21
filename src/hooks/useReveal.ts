import { useEffect, useRef } from "react";

/**
 * IntersectionObserver-based reveal hook.
 * Adds `data-revealed="true"` to the ref'd element when it enters view.
 * Pair with the `.reveal` CSS utility (see index.css).
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-revealed", "true");
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.setAttribute("data-revealed", "true");
            obs.unobserve(el);
          }
        });
      },
      options
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}
