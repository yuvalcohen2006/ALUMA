import { useEffect, useRef, useState } from "react";
import heroPoster from "@/assets/hero/hero-poster.webp";
import heroFilm from "@/assets/hero/hero-film.mp4";
import heroFilmMobile from "@/assets/hero/hero-film-mobile.mp4";
import alumaLogo from "@/assets/aluma-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

type HeroSettings = {
  title_he?: string;
  subtitle?: string;
  desktop_image?: string;
  mobile_image?: string;
  cta_text?: string;
  cta_link?: string;
};

/** navigator.connection is still non-standard, so lib.dom does not declare it. */
type SaveDataNavigator = Navigator & { connection?: { saveData?: boolean } };

const Hero = () => {
  const [offset, setOffset] = useState(0);
  const [showCue, setShowCue] = useState(true);
  const [settings, setSettings] = useState<HeroSettings>({});
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false,
  );

  /* ── The film ─────────────────────────────────────────────────────────────
     The still is the LCP element and stays the LCP element. The film is an
     upgrade layered over it that is only allowed to touch the network after
     the page has finished loading, and only when nobody has asked us not to. */

  // The hero settings row has come back (or failed). The film waits for it,
  // because a CMS image means the admin has chosen the hero and we stand down.
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  // window 'load' has fired — the film may now start fetching.
  const [armed, setArmed] = useState(false);
  // canplay: the film has enough data to show, so it can take over from the still.
  const [filmReady, setFilmReady] = useState(false);
  // Actually rolling. Parallax stands down while this is true.
  const [filmPlaying, setFilmPlaying] = useState(false);
  // The film has failed and is not coming back — autoplay refused, a decode
  // error, a 404 on the file. One flag for every failure, because they all end
  // the same way: the element leaves the DOM and the hero is the still again.
  const [filmDown, setFilmDown] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [reducedMotion, setReducedMotion] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  // Data Saver is a standing preference rather than something that flips
  // mid-visit, so it is read once per mount.
  const [saveData] = useState(
    () =>
      typeof navigator !== "undefined" &&
      (navigator as SaveDataNavigator).connection?.saveData === true,
  );

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setSettings(data.value as HeroSettings);
      })
      // The film is gated on this answer, so an unreachable table has to release
      // it too — otherwise one network blip leaves the hero on the still forever.
      .then(
        () => setSettingsLoaded(true),
        () => setSettingsLoaded(true),
      );
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Nothing about the film may run before the page has finished loading — a
  // video fetch racing the hero image is exactly how an LCP gets ruined.
  useEffect(() => {
    if (document.readyState === "complete") {
      setArmed(true);
      return;
    }
    const onLoad = () => setArmed(true);
    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
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
    // Parallax belongs to the STILL. Re-transforming a playing <video> on every
    // scroll frame is the jankiest thing that could happen on this page, so the
    // moment the film takes over the background stops moving. The still freezes
    // at whatever offset it held, which is invisible — the film covers it.
    if (reducedMotion || filmPlaying) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        setOffset(window.scrollY * 0.25);
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion, filmPlaying]);

  const desktopBg = settings.desktop_image || heroPoster;
  const mobileBg = settings.mobile_image || desktopBg;
  const bg = isMobile ? mobileBg : desktopBg;
  const srTitle = settings.title_he || "Aluma, סלוני חוץ ופרגולות בעיצוב אישי";

  // Any hero image set in the CMS means the admin has chosen what the top of the
  // site shows, and the film does not get to overrule it.
  const cmsHeroImage = Boolean(settings.desktop_image || settings.mobile_image);
  const showFilm =
    armed && settingsLoaded && !filmDown && !cmsHeroImage && !reducedMotion && !saveData;

  useEffect(() => {
    if (!showFilm) return;
    const video = videoRef.current;
    if (!video) return;
    // preload="none" means not one byte is fetched until playback is asked for —
    // and this call is that request, which is why it sits behind the load event.
    video.muted = true;
    const started = video.play();
    // Autoplay refused (iOS Low Power Mode, a managed device that blocks even
    // muted video). The element has to come OUT, not just stay quiet: canplay
    // still fires on a video that loaded but was not allowed to roll, and that
    // would fade an opaque frozen frame over the still and leave the hero
    // looking like the parallax had died. Standing down puts the still back.
    if (started)
      started.catch(() => {
        setFilmDown(true);
        setFilmPlaying(false);
      });
  }, [showFilm]);

  return (
    <section
      id="home"
      className="relative min-h-dvh flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <img
          src={bg}
          alt="סלון חוץ יוקרתי בעיצוב מודרני של Aluma"
          className="w-full h-[115%] object-cover will-change-transform"
          style={{ transform: `translate3d(0, ${offset}px, 0)` }}
          width={1280}
          height={720}
          fetchPriority="high"
        />
        {showFilm && (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            poster={heroPoster}
            // Decorative: it is the same scene as the still above, which already
            // carries the alt text.
            aria-hidden="true"
            tabIndex={-1}
            onCanPlay={() => setFilmReady(true)}
            onPlaying={() => setFilmPlaying(true)}
            onPause={() => setFilmPlaying(false)}
            // Same exit as a refused autoplay: filmPlaying has to be released
            // too, or a film that dies mid-playback leaves the parallax switched
            // off for the rest of the visit.
            onError={() => {
              setFilmDown(true);
              setFilmReady(false);
              setFilmPlaying(false);
            }}
            // The exact box the still occupies at offset 0 — same width, same
            // 115% height, same top anchor — so the fade is a dissolve between
            // identical frames rather than a jump in framing.
            className={`absolute inset-x-0 top-0 w-full h-[115%] object-cover transition-opacity duration-700 ease-out ${
              filmReady ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* One source in the DOM at a time, chosen by the same 768px query
                this component already tracks. `media` on a <source> is only
                honoured inside <picture>: Chromium never implemented it for
                <video> and Firefox dropped it, and both then simply take the
                first playable source — which would hand every desktop the
                half-size mobile film. The attribute stays on the mobile source
                as the declaration a compliant engine agrees with.

                A breakpoint crossed mid-visit does not reload the film; it
                keeps playing whatever it started, which is the right trade
                against a re-buffer and a black flash on every resize. */}
            {isMobile ? (
              <source media="(max-width: 768px)" src={heroFilmMobile} type="video/mp4" />
            ) : (
              <source src={heroFilm} type="video/mp4" />
            )}
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/80" />
      </div>

      <div className="container-luxury relative z-10 text-center pt-24 pb-12 flex flex-col items-center">
        <h1 className="sr-only">{srTitle}</h1>
        <img
          src={alumaLogo}
          alt="Aluma"
          width={2026}
          height={492}
          fetchPriority="high"
          className="w-[58%] sm:w-[68%] max-w-[320px] sm:max-w-[560px] md:max-w-[760px] lg:max-w-[980px] h-auto mb-5 sm:mb-8 animate-logo-reveal drop-shadow-md"
        />
        {settings.cta_text && settings.cta_link && (
          <Link
            to={settings.cta_link}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-[10px] text-meta tracking-wider hover:bg-accent transition-smooth animate-fade-in-up"
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
