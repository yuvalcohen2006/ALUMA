import { lazy, Suspense } from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import CategoryMosaic from "@/components/home/CategoryMosaic";
import Newsletter from "@/components/home/Newsletter";
import SEO from "@/components/SEO";
import { SITE } from "@/config/site";

// Below the fold and pulls in framer-motion, so it loads lazily.
const Testimonials = lazy(() => import("@/components/home/Testimonials"));

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
      {/* Scroll once and you know what is being sold: the range, then the
          proof, then one small ask. Materials, projects and the story all live
          in the navbar for anyone who wants them. */}
      <Hero />
      <CategoryMosaic />
      <Suspense fallback={<div className="min-h-[860px] md:min-h-[900px] bg-background" />}>
        <Testimonials />
      </Suspense>
      <Newsletter />
    </Layout>
  );
};

export default Index;
