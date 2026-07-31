import { lazy, Suspense } from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import CategoryMosaic from "@/components/home/CategoryMosaic";
import ConsultCTA from "@/components/home/ConsultCTA";
import ClubCard from "@/components/home/ClubCard";
import SEO from "@/components/SEO";
import { SITE } from "@/config/site";

// Below the fold, and the only remaining section that queries Supabase on the
// home page — lazy so it stays out of the initial bundle.
const ReviewsBand = lazy(() => import("@/components/home/ReviewsBand"));

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "FurnitureStore",
  name: "Aluma",
  description:
    "Aluma מתמחה בריהוט גן וריהוט חוץ יוקרתי בעיצוב אישי, סלוני חוץ, שולחנות גן ופינות אוכל מאלומיניום פרימיום, בדי Sunbrella ושיש גרניט פורצלן.",
  url: "https://alumaoutdoor.com/",
  telephone: "+972-50-451-9062",
  email: SITE.email,
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
      {/* The client's brief, in order: show them the range, then the proof,
          then one small ask. Materials, projects and the story brief moved off
          this page — a visitor should scroll once and understand what is being
          sold, not read three essays first. Those pages are all still linked
          from the navbar for anyone who wants the detail. */}
      <Hero />
      <CategoryMosaic />
      <ConsultCTA />
      {/* ⚠️ Falls back to fabricated placeholder quotes until real reviews are
          entered in the admin panel. They must not reach the live domain — see
          the banner in src/data/testimonials.ts. */}
      <Suspense fallback={<div className="min-h-[560px] bg-background" />}>
        <ReviewsBand />
      </Suspense>
      <ClubCard />
    </Layout>
  );
};

export default Index;
