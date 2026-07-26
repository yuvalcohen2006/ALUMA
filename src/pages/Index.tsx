import { lazy, Suspense } from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import AboutBrief from "@/components/home/AboutBrief";
import CategoryIcons from "@/components/home/CategoryIcons";
import ProjectsGrid from "@/components/home/ProjectsGrid";
import Newsletter from "@/components/home/Newsletter";
import SEO from "@/components/SEO";

// Below-the-fold + pulls in framer-motion, so load them lazily to keep the
// initial bundle light. Fixed-height fallbacks avoid layout shift.
const MaterialsBrief = lazy(() => import("@/components/home/MaterialsBrief"));
const Testimonials = lazy(() => import("@/components/home/Testimonials"));

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
      <CategoryIcons />
      <ProjectsGrid />
      <Suspense fallback={<div className="min-h-[820px] md:min-h-[900px] bg-foreground" />}>
        <MaterialsBrief />
      </Suspense>
      {/* ⚠️ Placeholder testimonials — fabricated demo content for preview only.
          Swap in real, attributed customer quotes before launch. See the banner
          in src/data/testimonials.ts. */}
      <Suspense fallback={<div className="min-h-[700px] bg-background" />}>
        <Testimonials />
      </Suspense>
      <Newsletter />
    </Layout>
  );
};

export default Index;
