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
  const { pathname, search, hash } = useLocation();
  const navType = useNavigationType();

  const lastPathRef = useRef<string | null>(null);
  // Read during render, before the layout effect advances the ref, so both
  // effects in this commit agree on whether the page actually changed.
  const isNewPage = lastPathRef.current !== pathname;
  // A hash arriving on the page you are already on is not a navigation, but it
  // still has somewhere to go — the FAQ's own "write to us" link is exactly
  // this case.
  const hasTarget = Boolean(hash);

  /*
   * A link carrying a #fragment wants that element, not the top.
   *
   * React Router does not restore fragments itself, and this component ran
   * unconditionally — so every cross-page "contact us" on the site
   * (footer, home, story, product page, account, catalogue: six of them) went
   * to /faq#contact and landed at the top of the FAQ, with the form a screen
   * and a half further down. The anchor and its scroll-mt were there the whole
   * time; nothing ever reached them.
   *
   * Returning true here means "handled" — the caller then leaves the page
   * alone rather than yanking it back up.
   */
  const scrollToHash = () => {
    if (!hash) return false;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return false;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" });
    return true;
  };

  const scrollTop = () => {
    if (scrollToHash()) return;
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
    if (!isNewPage && !hasTarget) return; // filter change, not a navigation
    scrollTop();
  }, [pathname, search, hash, navType, isNewPage]);

  // After lazy content mounts / images shift layout
  useEffect(() => {
    if (navType === "POP") return;
    if (!isNewPage && !hasTarget) return;
    const r1 = requestAnimationFrame(scrollTop);
    const t1 = window.setTimeout(scrollTop, 60);
    const t2 = window.setTimeout(scrollTop, 250);
    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, search, hash, navType, isNewPage]);

  return null;
};

export default ScrollToTop;
