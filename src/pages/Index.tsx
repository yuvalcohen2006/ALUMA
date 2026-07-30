import { lazy, Suspense } from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import AboutBrief from "@/components/home/AboutBrief";
import CategoryIcons from "@/components/home/CategoryIcons";
import ProjectsGrid from "@/components/home/ProjectsGrid";
import Newsletter from "@/components/home/Newsletter";
import SEO from "@/components/SEO";

// All below the fold, and each one carries weight the first paint has no use
// for — framer-motion for the two rails, three full-size stills for the light
// band, a Supabase round-trip for the magazine. Loaded lazily to keep the
// initial bundle light; the fixed-height fallbacks hold the page open so
// nothing below them jumps as the chunks land.
const LightBand = lazy(() => import("@/components/home/LightBand"));
const MaterialsBrief = lazy(() => import("@/components/home/MaterialsBrief"));
const Testimonials = lazy(() => import("@/components/home/Testimonials"));
const MagazineStrip = lazy(() => import("@/components/home/MagazineStrip"));

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "FurnitureStore",
  name: "Aluma",
  description:
    "Aluma מתמחה בריהוט גן וריהוט חוץ יוקרתי בעיצוב אישי, סלוני חוץ, שולחנות גן ופינות אוכל מאלומיניום פרימיום, בדי Sunbrella ושיש גרניט פורצלן.",
  url: "https://alumaoutdoor.com/",
  telephone: "+972-50-451-9062",
  email: "info@aluma.co.il",
  image: "https://alumaoutdoor.com/og-image.jpg",
  address: {
    "@type": "PostalAddress",
    streetAddress: "התמר 78",
    addressLocality: "יציץ",
    addressCountry: "IL",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "08:30",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "08:30",
      closes: "12:00",
    },
  ],
  areaServed: "IL",
  priceRange: "$$$",
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "סלוני חוץ" } },
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "שולחנות גן" } },
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "פינות אוכל לגינה" } },
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "ריהוט מרפסת" } },
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Aluma",
  url: "https://alumaoutdoor.com/",
  inLanguage: "he-IL",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://alumaoutdoor.com/collections?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const Index = () => {
  return (
    <Layout>
      <SEO
        title="ריהוט גן וריהוט חוץ יוקרתי בעיצוב אישי | Aluma"
        description="ריהוט גן וריהוט חוץ יוקרתי בעיצוב אישי, סלוני חוץ, שולחנות גן ופינות אוכל מאלומיניום, בדי Sunbrella ושיש גרניט פורצלן. עמיד לכל מזג אוויר."
        path="/"
        jsonLd={[localBusiness, websiteSchema]}
      />
      <Hero />
      <AboutBrief />
      {/* The light band and the category rail are both sand: they read as one
          continuous slab between the warm-white About and the warm-white
          projects carousel, which is why the band closes on its own CTA rather
          than trailing off into the tiles. */}
      {/* Fallback heights are measured against the real sections: padding +
          heading block + a 16:9 frame at the container's width + the controls
          under it. Short fallbacks are the whole failure mode here — the page
          would settle taller than it was held open for. */}
      <Suspense fallback={<div className="min-h-[850px] md:min-h-[1090px] bg-secondary" />}>
        <LightBand />
      </Suspense>
      <CategoryIcons />
      <ProjectsGrid />
      <Suspense fallback={<div className="min-h-[820px] md:min-h-[900px] bg-foreground" />}>
        <MaterialsBrief />
      </Suspense>
      {/* ⚠️ Testimonials are dev-gated: the component renders only when
          import.meta.env.DEV (fabricated demo quotes, preview only) and
          returns null in production — the Suspense wrapper is fine with that.
          Real, attributed customer quotes must land in src/data/testimonials.ts
          before the gate inside Testimonials.tsx is removed. */}
      <Suspense fallback={<div className="min-h-[700px] bg-background" />}>
        <Testimonials />
      </Suspense>
      {/* Warm white on purpose. In production the testimonials above return
          null, so this lands directly on the charcoal materials rail and the
          page steps charcoal → warm white → sand into the newsletter. */}
      {/* Mobile stacks the three cards, so the phone fallback is the tall one:
          three covers plus two-line titles, not a third of the desktop row. */}
      <Suspense fallback={<div className="min-h-[1600px] md:min-h-[920px] bg-background" />}>
        <MagazineStrip />
      </Suspense>
      <Newsletter />
    </Layout>
  );
};

export default Index;
