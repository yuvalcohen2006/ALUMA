import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import BrandStatement from "@/components/home/BrandStatement";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ProjectsPreview from "@/components/home/ProjectsPreview";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import SEO from "@/components/SEO";
import { useSiteContact } from "@/hooks/useSiteContact";
import type { SiteContact } from "@/lib/site-contact";
import { useTranslation } from "react-i18next";

const localBusinessFor = (SITE: SiteContact) => ({
"@context": "https://schema.org",
"@type": "FurnitureStore",
  name: "Aluma",
  description:
"Aluma מתמחה בריהוט גן וריהוט חוץ יוקרתי בעיצוב אישי, סלוני חוץ, שולחנות גן ופינות אוכל מאלומיניום פרימיום, בדי Sunbrella ושיש גרניט פורצלן.",
  url: "https://alumaoutdoor.com/",
  telephone: SITE.phone.tel,
  email: SITE.email,
  image: "https://alumaoutdoor.com/og-image.jpg",
  address: {
"@type": "PostalAddress",
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
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
});

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
  const { t: tr, i18n } = useTranslation("home");
  const localBusiness = localBusinessFor(useSiteContact());
  return (
    <Layout>
      {/* Translated, like every other page that has been through this. These
          were Hebrew literals, so /en shipped a Hebrew browser tab and a Hebrew
          Google snippet on a document declaring itself English. */}
      <SEO
        title={tr("seo.title")}
        description={tr("seo.description")}
        path="/"
        jsonLd={[localBusiness, { ...websiteSchema, inLanguage: i18n.resolvedLanguage === "en" ? "en" : "he-IL" }]}
      />
      {/* The client's order, and it is the order every reference brand uses:
          say who you are before you sell anything. The eight category tiles
          that used to sit here — the entire catalogue, arriving before a word
          had been said — move to /collections. Hem delays its category grid to
          section seven of ten; Hillerstorp shows none at all.

          Sections that have nothing to show render nothing rather than
          rendering an empty frame, so an unpopulated database simply makes
          this page shorter. */}
      <Hero />
      <BrandStatement />
      <FeaturedCollections />
      <FeaturedProducts />
      <ProjectsPreview />
      <Testimonials />
      <Newsletter />
    </Layout>
  );
};

export default Index;
