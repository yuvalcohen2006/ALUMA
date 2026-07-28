import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Forces every route navigation to start at the top of the page.
 * Runs synchronously before paint AND again after the new route's
 * lazy chunk resolves (covers the Suspense fallback → content swap).
 *
 * A query-string-only change is NOT a navigation — the filter drawers write
 * their state to the URL, and yanking the reader back to the top every time
 * they tick a checkbox made filtering unusable. Only a new pathname scrolls.
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  const navType = useNavigationType();

  const lastPathRef = useRef<string | null>(null);
  // Read during render, before the layout effect advances the ref, so both
  // effects in this commit agree on whether the page actually changed.
  const isNewPage = lastPathRef.current !== pathname;

  const scrollTop = () => {
    // Disable any CSS smooth-scroll for this jump
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    html.scrollTop = 0;
    html.style.scrollBehavior = prev;
  };

  // Before paint
  useLayoutEffect(() => {
    lastPathRef.current = pathname;
    if (navType === "POP") return; // preserve back/forward position
    if (!isNewPage) return; // filter change, not a navigation
    scrollTop();
  }, [pathname, search, navType, isNewPage]);

  // After lazy content mounts / images shift layout
  useEffect(() => {
    if (navType === "POP") return;
    if (!isNewPage) return;
    const r1 = requestAnimationFrame(scrollTop);
    const t1 = window.setTimeout(scrollTop, 60);
    const t2 = window.setTimeout(scrollTop, 250);
    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, search, navType, isNewPage]);

  return null;
};

export default ScrollToTop;
