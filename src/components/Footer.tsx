import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import alumaLogo from "@/assets/aluma-logo.png";
import { SITE } from "@/config/site";

const WhatsAppIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const Footer = () => {
  // Light-grey wash plus a small lift on hover — the old version flipped to a
  // solid white block, which was far too loud against the charcoal footer.
  const iconBox =
    "w-10 h-10 rounded-[10px] border border-background/25 text-background/80 flex items-center justify-center transition-all duration-300 hover:bg-background/15 hover:text-background hover:border-background/50 hover:-translate-y-0.5 hover:shadow-soft";

  return (
    <footer dir="rtl" className="bg-footer text-background [&_svg]:[stroke-width:1.25]">
      <div className="container-luxury py-16">
        <div dir="rtl" className="grid gap-y-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-y-0 lg:gap-x-8 lg:items-stretch">

          {/* Column 1 (rightmost in RTL), Logo + about + socials */}
          <div className="w-full text-center md:text-right lg:max-w-[320px] lg:pl-8">
            <img src={alumaLogo} alt="Aluma" loading="lazy" decoding="async" width={400} height={100} className="h-10 w-auto mb-5 mx-auto md:ml-auto brightness-0 invert opacity-90" />
            <p className="text-background/75 text-body mb-6">
              אנחנו יוצרים מערכות חוץ שמרגישות כמו סלון יוקרתי תחת כיפת השמיים —
              מקום לארח, להירגע, ולחיות את הרגעים היפים באמת.
            </p>
            <div className="flex gap-3 justify-center md:justify-end flex-row-reverse">
              <a href="mailto:info@aluma.co.il" aria-label="Email" className={iconBox}>
                <Mail className="w-4 h-4" />
              </a>
              <a href="tel:+972504519062" aria-label="Phone" className={iconBox}>
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/972504519062"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className={iconBox}
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
              {SITE.social.instagram && (
                <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={iconBox}>
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {SITE.social.facebook && (
                <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={iconBox}>
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2, Quick navigation */}
          <div className="w-full text-center md:text-right lg:max-w-[220px] lg:justify-self-center lg:px-8 lg:border-r lg:border-background/15">
            <h4 className="font-display text-card-title mb-6">מעבר מהיר</h4>
            <ul className="space-y-3 text-meta text-background/85">
              <li>
                <Link to="/" className="link-underline inline-block hover:text-background transition-smooth">
                  דף הבית
                </Link>
              </li>
              <li>
                <Link to="/story" className="link-underline inline-block hover:text-background transition-smooth">
                  הסיפור שלנו
                </Link>
              </li>
              <li>
                <Link to="/collections" className="link-underline inline-block hover:text-background transition-smooth">
                  קולקציות
                </Link>
              </li>
              <li>
                <Link to="/materials" className="link-underline inline-block hover:text-background transition-smooth">
                  חומרים
                </Link>
              </li>
              <li>
                <Link to="/projects" className="link-underline inline-block hover:text-background transition-smooth">
                  פרויקטים
                </Link>
              </li>
              <li>
                <Link to="/diy" className="link-underline inline-block hover:text-background transition-smooth">
                  הסטודיו
                </Link>
              </li>
              <li>
                <Link to="/blog" className="link-underline inline-block hover:text-background transition-smooth">
                  מגזין
                </Link>
              </li>
              <li>
                <Link to="/questionnaire" className="link-underline inline-block hover:text-background transition-smooth">
                  שאלון חכם
                </Link>
              </li>
              <li>
                <Link to="/account" className="link-underline inline-block hover:text-background transition-smooth">
                  אזור לקוחות
                </Link>
              </li>
              <li>
                <Link to="/faq" className="link-underline inline-block hover:text-background transition-smooth">
                  שאלות ותשובות
                </Link>
              </li>
              <li>
                <Link to="/contact" className="link-underline inline-block hover:text-background transition-smooth">
                  צרו קשר
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3, Materials */}
          <div className="w-full text-center md:text-right lg:max-w-[220px] lg:justify-self-center lg:px-8 lg:border-r lg:border-background/15">
            <h4 className="font-display text-card-title mb-6">החומרים שלנו</h4>
            <ul className="space-y-3 text-meta text-background/85">
              <li>
                <Link to="/materials" className="link-underline inline-block hover:text-background transition-smooth">
                  בד Sunbrella
                </Link>
              </li>
              <li>
                <Link to="/materials" className="link-underline inline-block hover:text-background transition-smooth">
                  אלומיניום
                </Link>
              </li>
              <li>
                <Link to="/materials" className="link-underline inline-block hover:text-background transition-smooth">
                  שיש גרניט פורצלן
                </Link>
              </li>
              <li>
                <Link to="/materials/polystone" className="link-underline inline-block hover:text-background transition-smooth">
                  PolyStone
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 (leftmost in RTL), Contact */}
          <div className="w-full text-center md:text-right lg:max-w-[240px] lg:justify-self-start lg:pr-8 lg:border-r lg:border-background/15">
            <h4 className="font-display text-card-title mb-6">יצירת קשר</h4>
            <ul className="space-y-4 text-meta text-background/85">
              <li>
                <a
                  href="tel:+972504519062"
                  className="flex items-center gap-3 justify-center md:justify-start hover:text-background transition-smooth"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  <span dir="ltr">050-451-9062</span>
                </a>
              </li>
              <li className="flex items-center gap-3 justify-center md:justify-start">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>התמר 78, יציץ.</span>
              </li>
              <li>
                <a
                  href="mailto:info@aluma.co.il"
                  className="flex items-center gap-3 justify-center md:justify-start hover:text-background transition-smooth"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span dir="ltr">info@aluma.co.il</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/972504519062"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 justify-center md:justify-start hover:text-background transition-smooth"
                >
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span>צ'אט באמצעות WhatsApp</span>
                </a>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-background/20 max-w-[240px] mx-auto md:mx-0 md:max-w-none">
              <div className="text-meta font-semibold mb-2">שעות פעילות</div>
              <div className="text-meta space-y-1 font-normal">
                <div className="flex justify-center md:justify-between gap-4">
                  <span>א׳ – ה׳</span>
                  <span dir="ltr">08:30 – 18:00</span>
                </div>
                <div className="flex justify-center md:justify-between gap-4">
                  <span>יום ו׳</span>
                  <span dir="ltr">08:30 – 12:00</span>
                </div>
              </div>
              <div className="text-meta text-background/70 mt-3">
                ניתן להגיע לאולם התצוגה בתיאום מראש
              </div>
            </div>
          </div>
        </div>

        <div dir="rtl" className="mt-14 pt-8 border-t border-background/15 flex flex-col md:flex-row justify-between items-center gap-4 text-meta text-background/60 text-center md:text-right">
          <div>© {new Date().getFullYear()} Aluma. כל הזכויות שמורות.</div>
          <div className="flex flex-wrap justify-center gap-5">
            <Link to="/accessibility" className="link-underline inline-block hover:text-background transition-smooth">
              הצהרת נגישות
            </Link>
            <Link to="/terms" className="link-underline inline-block hover:text-background transition-smooth">
              תקנון ומדיניות
            </Link>
            <Link to="/privacy" className="link-underline inline-block hover:text-background transition-smooth">
              מדיניות פרטיות
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
