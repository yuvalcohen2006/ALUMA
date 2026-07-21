import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Forces every route navigation to start at the top of the page.
 * Runs synchronously before paint AND again after the new route's
 * lazy chunk resolves (covers the Suspense fallback → content swap).
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  const navType = useNavigationType();

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
    if (navType === "POP") return; // preserve back/forward position
    scrollTop();
  }, [pathname, search, navType]);

  // After lazy content mounts / images shift layout
  useEffect(() => {
    if (navType === "POP") return;
    const r1 = requestAnimationFrame(scrollTop);
    const t1 = window.setTimeout(scrollTop, 60);
    const t2 = window.setTimeout(scrollTop, 250);
    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, search, navType]);

  return null;
};

export default ScrollToTop;
