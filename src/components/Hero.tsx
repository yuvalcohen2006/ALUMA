import { useEffect, useState } from "react";
import heroImage from "@/assets/hero-salon.jpg";
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

const Hero = () => {
  const [offset, setOffset] = useState(0);
  const [settings, setSettings] = useState<HeroSettings>({});
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
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
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
  }, []);

  const desktopBg = settings.desktop_image || heroImage;
  const mobileBg = settings.mobile_image || desktopBg;
  const bg = isMobile ? mobileBg : desktopBg;
  const subtitle = settings.subtitle || "Where Outdoor Becomes Lifestyle";
  const srTitle = settings.title_he || "Aluma, סלוני חוץ ופרגולות בעיצוב אישי";

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
          width={1920}
          height={1280}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/80" />
      </div>

      <div className="container-luxury relative z-10 text-center pt-24 pb-12 flex flex-col items-center">
        <h1 className="sr-only">{srTitle}</h1>
        <img
          src={alumaLogo}
          alt="Aluma"
          width={980}
          height={260}
          fetchPriority="high"
          className="w-[58%] sm:w-[68%] max-w-[320px] sm:max-w-[560px] md:max-w-[760px] lg:max-w-[980px] h-auto mb-5 sm:mb-8 animate-fade-in-up drop-shadow-md"
        />
        <div className="relative mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {/* Soft feathered light pool so the slogan stays readable over the busy hero image */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[135%] h-[320%] rounded-[50%] bg-background/50 blur-2xl"
          />
          <p className="relative z-10 text-[11px] sm:text-sm md:text-base tracking-[0.22em] sm:tracking-[0.4em] uppercase text-foreground font-semibold px-2 whitespace-nowrap">
            {subtitle}
          </p>
        </div>
        {settings.cta_text && settings.cta_link && (
          <Link
            to={settings.cta_link}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm tracking-wider hover:bg-accent transition-smooth animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {settings.cta_text}
          </Link>
        )}
      </div>

      {/* Scroll cue — three chevrons fade in after the hero text, gently nudging down */}
      <button
        type="button"
        onClick={() =>
          window.scrollTo({ top: window.innerHeight * 0.9, behavior: "smooth" })
        }
        aria-label="גלול למטה"
        className="scroll-cue absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center text-foreground/70 hover:text-primary transition-smooth"
      >
        <ChevronDown className="w-6 h-6 -mb-3.5 animate-rise-in" style={{ animationDelay: "0.9s" }} strokeWidth={1.5} />
        <ChevronDown className="w-6 h-6 -mb-3.5 animate-rise-in" style={{ animationDelay: "1.05s" }} strokeWidth={1.5} />
        <ChevronDown className="w-6 h-6 animate-rise-in" style={{ animationDelay: "1.2s" }} strokeWidth={1.5} />
      </button>
    </section>
  );
};

export default Hero;
