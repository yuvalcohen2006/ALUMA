import { useEffect, useState } from "react";
import heroImage from "@/assets/hero-salon.jpg";
import alumaLogo from "@/assets/aluma-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { HIGH_FETCH_PRIORITY } from "@/lib/img-priority";

type HeroSettings = {
  title_he?: string;
  subtitle?: string;
  desktop_image?: string;
  mobile_image?: string;
  cta_text?: string;
  cta_link?: string;
};

const Hero = () => {
  const [offset, setOffset] = useState(0);
  const [showCue, setShowCue] = useState(true);
  const [settings, setSettings] = useState<HeroSettings>({});
  const [viewport, setViewport] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800,
  );
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false,
  );

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setSettings(data.value as HeroSettings);
      });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    const onResize = () => setViewport(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Scroll cue visibility. Kept separate from the parallax listener below, which
  // bails out under reduced-motion — the cue must still hide for those users.
  useEffect(() => {
    // One-way latch: the cue is an invitation to start scrolling, so once it has
    // been acted on it has done its job. Bringing it back when the user returns
    // to the top would nag.
    const onScroll = () => {
      if (window.scrollY >= 40) setShowCue(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        // Past the hero there is nothing to parallax, and re-rendering this
        // component on every frame of a scroll through the rest of the page
        // was pure cost. One last write pins it at the bottom of its travel
        // rather than leaving it mid-slide.
        const y = window.scrollY;
        const past = y > window.innerHeight;
        setOffset((prev) => {
          const next = (past ? window.innerHeight : y) * 0.25;
          return next === prev ? prev : next;
        });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const { t: tr, i18n } = useTranslation("home");
  const { to } = useLocalizedPath();
  const isEnglish = i18n.resolvedLanguage === "en";
  const desktopBg = settings.desktop_image || heroImage;
  const mobileBg = settings.mobile_image || desktopBg;
  const bg = isMobile ? mobileBg : desktopBg;

  /*
   * The lockup is gone by the time the next section arrives.
   *
   * `offset` is scrollY * 0.25 and stops climbing at one viewport, so this
   * reaches 0 at roughly 70% of a screen of scrolling — while the hero is
   * still the thing being looked at, not after it has half left. Without it
   * the wordmark was still sitting over the top edge of the white section
   * below, which is what made the hand-off read as two pages colliding rather
   * than one page moving.
   */
  const fade = Math.max(0, 1 - offset / (Math.max(1, viewport) * 0.18));
  /*
   * The CMS field is title_he — Hebrew by name and by content, with no English
   * counterpart in the admin. So on /en an owner-supplied value would still be
   * Hebrew, and this is the page's ONLY h1: an English screen reader met the
   * document's single heading and got Hebrew codepoints.
   *
   * The owner's value still wins on the Hebrew site, which is the whole point
   * of the field. English falls back to the translation instead of to a Hebrew
   * literal.
   */
  const srTitle = (isEnglish ? "" : settings.title_he) || tr("hero.srTitle");
  /* A full URL typed into the admin's link field is not an app route. Handed
     to <Link>, react-router treats it as relative and navigates the visitor to
     /en/https:/example.com; as a plain href it does what the owner meant. */
  const externalCta = /^[a-z][a-z0-9+.-]*:|^\/\//i.test(settings.cta_link ?? "");

  return (
    <section
      id="home"
      className="relative min-h-dvh flex items-center justify-center overflow-hidden"
    >
      {/* Split parallax: the photograph climbs OUT faster than the page
          (negative translate) while the wordmark lags slightly behind it
          (positive), so the background visibly slides away from under the
          title as you scroll. The image is 25% taller than the section and
          top-anchored, which is the slack the upward travel eats into — at
          0.2×scroll the bottom edge can never clear the section while any of
          the hero is still on screen. */}
      <div className="absolute inset-0">
        <img
          src={bg}
          alt={tr("hero.alt")}
          className="w-full h-[125%] object-cover object-top will-change-transform"
          style={{ transform: `translate3d(0, ${offset * 0.6}px, 0)` }}
          width={1920}
          height={1280}
          {...HIGH_FETCH_PRIORITY}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/25 to-background" />
      </div>

      <div
        className="container-luxury relative z-10 text-center pt-24 pb-12 flex flex-col items-center will-change-transform"
        style={{
          transform: `translate3d(0, ${offset * 0.35}px, 0)`,
          opacity: fade,
        }}
      >
        <h1 className="sr-only">{srTitle}</h1>
        <img
          src={alumaLogo}
          alt="Aluma"
          width={2026}
          height={492}
          {...HIGH_FETCH_PRIORITY}
          className="w-[58%] sm:w-[68%] max-w-[320px] sm:max-w-[560px] md:max-w-[760px] lg:max-w-[980px] h-auto mb-5 sm:mb-8 animate-logo-reveal drop-shadow-md"
        />
        {settings.cta_text && settings.cta_link && externalCta && (
          <a
            href={settings.cta_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm tracking-wider hover:bg-accent transition-smooth animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {settings.cta_text}
          </a>
        )}
        {settings.cta_text && settings.cta_link && !externalCta && (
          <Link
            to={to(settings.cta_link)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm tracking-wider hover:bg-accent transition-smooth animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {settings.cta_text}
          </Link>
        )}
      </div>

      {/* Scroll cue — three chevrons pulse in sequence, then clear out on scroll */}
      <button
        type="button"
        onClick={() =>
          window.scrollTo({ top: window.innerHeight * 0.9, behavior: "smooth" })
        }
        aria-label="גלול למטה"
        aria-hidden={!showCue}
        tabIndex={showCue ? 0 : -1}
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center text-foreground-soft hover:text-primary transition-opacity duration-500 ${
          showCue ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronDown className="w-12 h-12 -mb-7 animate-chevron-blink" style={{ animationDelay: "0s" }} strokeWidth={1.75} />
        <ChevronDown className="w-12 h-12 -mb-7 animate-chevron-blink" style={{ animationDelay: "0.2s" }} strokeWidth={1.75} />
        <ChevronDown className="w-12 h-12 animate-chevron-blink" style={{ animationDelay: "0.4s" }} strokeWidth={1.75} />
      </button>
    </section>
  );
};

export default Hero;
