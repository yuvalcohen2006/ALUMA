import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import CategoryMosaic from "@/components/home/CategoryMosaic";
import Newsletter from "@/components/home/Newsletter";
import SEO from "@/components/SEO";
import { SITE } from "@/config/site";

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
      {/* Scroll once and you know what is being sold: the range, then one
          small ask. The reviews came off at the owner's call — placeholder
          quotes weren't worth the scroll; real ones can earn a section back
          via the site_reviews table when they exist. */}
      <Hero />
      <CategoryMosaic />
      <Newsletter />
    </Layout>
  );
};

export default Index;
