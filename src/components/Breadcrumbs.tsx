import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, Home } from "lucide-react";

const labels: Record<string, string> = {
  story: "הסיפור שלנו",
  collections: "קולקציות",
  materials: "חומרים",
  projects: "פרויקטים",
  faq: "שאלות ותשובות",
  contact: "צרו קשר",
  accessibility: "הצהרת נגישות",
  terms: "תקנון",
  privacy: "מדיניות פרטיות",
};

const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  return (
    <nav aria-label="פירורי לחם" className="container-luxury pt-24 md:pt-28">
      <ol
        className="flex flex-wrap items-center gap-1.5 text-xs md:text-sm text-muted-foreground"
        dir="rtl"
      >
        <li>
          <Link
            to="/"
            className="inline-flex items-center gap-1 hover:text-primary transition-smooth"
          >
            <Home className="w-3.5 h-3.5" />
            <span>דף הבית</span>
          </Link>
        </li>
        {segments.map((seg, i) => {
          const path = "/" + segments.slice(0, i + 1).join("/");
          const isLast = i === segments.length - 1;
          const label = labels[seg] ?? seg;
          return (
            <li key={path} className="flex items-center gap-1.5">
              <ChevronLeft className="w-3.5 h-3.5 opacity-50" aria-hidden="true" />
              {isLast ? (
                <span className="text-primary font-medium" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link to={path} className="hover:text-primary transition-smooth">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
