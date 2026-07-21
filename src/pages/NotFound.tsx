import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import SectionLabel from "@/components/SectionLabel";
import { ArrowLeft } from "lucide-react";

const popular = [
  { to: "/collections", label: "קולקציות" },
  { to: "/projects", label: "פרויקטים" },
  { to: "/materials", label: "החומרים שלנו" },
  { to: "/story", label: "הסיפור שלנו" },
  { to: "/faq", label: "שאלות ותשובות" },
  { to: "/contact", label: "צרו קשר" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <Helmet>
        <title>הדף לא נמצא (404) | Aluma</title>
        <meta
          name="description"
          content="הדף שחיפשתם לא נמצא באתר Aluma. חזרו לדף הבית כדי לעיין בקולקציות סלוני החוץ והפרויקטים שלנו."
        />
        <meta name="robots" content="noindex,follow" />
      </Helmet>

      <section className="pt-32 pb-20 md:pt-40 md:pb-28 gradient-cream min-h-[70vh] flex items-center">
        <div className="container-luxury text-center max-w-2xl mx-auto">
          <div className="font-display text-7xl md:text-9xl text-foreground/20 leading-none mb-4">
            404
          </div>
          <SectionLabel he="הדף לא נמצא" en="Page Not Found" className="text-xs mb-5" />
          <h1 className="font-display text-3xl md:text-5xl text-foreground leading-tight mb-5">
            נראה שהלכתם <span className="italic">לאיבוד</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-10">
            הדף שחיפשתם הוסר או שהקישור שגוי. אבל אל דאגה, הנה כמה מהדפים
            הפופולריים שלנו שיכולים לעניין אתכם:
          </p>

          <div className="grid sm:grid-cols-2 gap-3 max-w-md mx-auto mb-10">
            {popular.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className="group flex items-center justify-between gap-3 bg-card border border-border hover:border-primary/50 hover:shadow-soft rounded-sm px-5 py-3.5 text-right transition-smooth"
              >
                <ArrowLeft className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                <span className="font-display text-base text-foreground">{p.label}</span>
              </Link>
            ))}
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary hover:bg-accent text-primary-foreground px-8 py-3 rounded-sm tracking-wide transition-smooth"
          >
            חזרה לדף הבית
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
