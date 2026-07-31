import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { LANGUAGE_DIR, languageFromPath } from "@/i18n";
import { localizePath, stripLanguagePrefix } from "@/lib/useLocalizedPath";
import { SITE } from "@/config/site";

const SITE_URL = "https://alumaoutdoor.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SEOProps {
  title: string;
  description: string;
  /** App path WITHOUT the language prefix, e.g. "/collections". */
  path: string;
  image?: string;
  type?: "website" | "article" | "product";
  jsonLd?: object | object[];
}

const SEO = ({ title, description, path, image, type = "website", jsonLd }: SEOProps) => {
  const { pathname } = useLocation();
  const lang = languageFromPath(pathname);

  // Call sites pass an unprefixed path; strip anyway so a prefixed one can't
  // produce /en/en/... in the canonical.
  const basePath = stripLanguagePrefix(path);
  const url = `${SITE_URL}${localizePath(basePath, lang)}`;
  const heUrl = `${SITE_URL}${localizePath(basePath, "he")}`;
  const enUrl = `${SITE_URL}${localizePath(basePath, "en")}`;

  const ogImage = image
    ? (image.startsWith("http") ? image : `${SITE_URL}${image}`)
    : DEFAULT_OG_IMAGE;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <html lang={lang} dir={LANGUAGE_DIR[lang]} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Alternates are only advertised once English actually has copy —
          pointing crawlers at a half-translated tree is worse than not
          declaring it. x-default is the tag most sites forget; without it
          Google has no fallback for unmatched locales. */}
      {SITE.enableEnglish && <link rel="alternate" hrefLang="he-IL" href={heUrl} />}
      {SITE.enableEnglish && <link rel="alternate" hrefLang="en" href={enUrl} />}
      {SITE.enableEnglish && <link rel="alternate" hrefLang="x-default" href={enUrl} />}

      <meta property="og:site_name" content="Aluma" />
      <meta property="og:locale" content={lang === "en" ? "en_US" : "he_IL"} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
