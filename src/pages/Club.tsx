import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import alumaLogo from "@/assets/aluma-logo.png";
import heroSalon from "@/assets/hero-salon.jpg";
import sunlightSofa from "@/assets/story-sunlight-sofa.jpg";
import {
  Heart,
  ClipboardCheck,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Gift,
  Users,
} from "lucide-react";

const perks = [
  {
    icon: ClipboardCheck,
    title: "מעקב פרויקט חי",
    text: "צפו בסטטוס ההזמנה, אבני דרך והתקדמות בזמן אמת — בלי להרים טלפון.",
  },
  {
    icon: Heart,
    title: "מועדפים חכמים",
    text: "סמנו קולקציות, בדים וקונפיגורציות. הכל נשמר ומסונכרן בין המכשירים.",
  },
  {
    icon: Sparkles,
    title: "גישה מוקדמת",
    text: "קולקציות חדשות, גוונים בלעדיים והזמנות לאירועי לונץ׳ פרטיים — לפני כולם.",
  },
  {
    icon: ShieldCheck,
    title: "שירות VIP אישי",
    text: "מעצב מלווה, היסטוריית תקשורת מסודרת ותיעדוף בבקשות שירות ותחזוקה.",
  },
];

const steps = [
  { n: "01", title: "הרשמה", text: "דקה אחת — שם, מייל וטלפון. בלי טפסים ארוכים." },
  { n: "02", title: "אימות מהיר", text: "מאמתים את החשבון ומעצבים את הפרופיל האישי שלכם." },
  { n: "03", title: "עולם שלם נפתח", text: "מועדפים, מעקב פרויקט, הטבות והזמנות פרטיות." },
];

const stats = [
  { k: "10+", v: "שנות אחריות Sunbrella®" },
  { k: "24/7", v: "מעקב סטטוס פרויקט" },
  { k: "VIP", v: "מעצב אישי מלווה" },
];

const Club = () => {
  const { user } = useAuth();

  const ctaBlock = (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      {user ? (
        <Button asChild size="lg" className="rounded-full px-8 shadow-luxury">
          <Link to="/club/dashboard">לאזור האישי שלי</Link>
        </Button>
      ) : (
        <>
          <Button asChild size="lg" className="rounded-full px-8 shadow-luxury">
            <Link to="/club/auth?mode=signup">הצטרפות חינם למועדון</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full px-8 border-primary/40"
          >
            <Link to="/club/auth">כבר חבר? התחברות</Link>
          </Button>
        </>
      )}
    </div>
  );

  return (
    <Layout>
      <SEO
        title="מועדון אלומה | Aluma Club"
        description="הצטרפו למועדון הלקוחות של Aluma — מעקב הזמנה, מועדפים, גישה מוקדמת לקולקציות והטבות בלעדיות."
        path="/club"
      />

      {/* HERO — editorial split */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden gradient-cream">
        {/* Ornamental corner image */}
        <div
          aria-hidden
          className="hidden md:block absolute -top-10 -left-24 w-[520px] h-[520px] rounded-full opacity-25"
          style={{
            backgroundImage: `url(${heroSalon})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(2px)",
            maskImage: "radial-gradient(circle at center, black 45%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="hidden md:block absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full opacity-20"
          style={{
            backgroundImage: `url(${sunlightSofa})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            maskImage: "radial-gradient(circle at center, black 45%, transparent 70%)",
          }}
        />

        <div className="container-luxury relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="sr-only">מועדון אלומה</h1>

            <div className="inline-flex items-center gap-3 bg-background/80 backdrop-blur border border-primary/15 rounded-full px-5 py-2 mb-8 shadow-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] tracking-[0.35em] uppercase text-primary/70">
                Aluma Private Club · הצטרפות חינם
              </span>
            </div>

            <img
              src={alumaLogo}
              alt="Aluma"
              className="h-16 md:h-20 w-auto mx-auto mb-6"
            />

            <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-primary mb-6 text-balance">
              עולם שקט של שירות,
              <br />
              <span className="text-accent">שנתפר במידה שלכם.</span>
            </h2>

            <div className="w-24 h-px bg-primary/30 mx-auto mb-6" />

            <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mb-10">
              מועדון אלומה הוא לא תוכנית נקודות. זו דלת אחורית לעולם של מעצבים,
              קולקציות מוקדמות ושירות אישי — למי שרואה את החוץ של הבית כמו את הפנים.
            </p>

            {ctaBlock}

            {/* Stats strip */}
            <div className="mt-16 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
              {stats.map((s) => (
                <div
                  key={s.v}
                  className="border-t border-primary/20 pt-4 text-center"
                >
                  <div className="font-display text-2xl md:text-4xl text-primary mb-1">
                    {s.k}
                  </div>
                  <div className="text-[11px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PERKS — editorial bento */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container-luxury">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">
              ההטבות
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-primary mb-4">
              מה מקבלים כשמצטרפים
            </h2>
            <p className="text-muted-foreground font-light leading-relaxed">
              ארבע הטבות שנבנו סביב איך שלקוחות אלומה באמת עובדים איתנו — מהרגע
              שבחרתם דגם ועד שנים אחרי המסירה.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="group relative bg-card border border-border rounded-sm p-8 hover:shadow-luxury hover:-translate-y-1 transition-smooth overflow-hidden"
                >
                  <div className="absolute top-4 left-4 font-display text-5xl text-primary/5 group-hover:text-accent/10 transition-smooth">
                    0{i + 1}
                  </div>
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-smooth">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-xl text-primary mb-3">
                      {p.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-light">
                      {p.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STEPS — how to join */}
      <section className="py-20 md:py-28 gradient-cream">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-20 items-center">
            <div className="lg:col-span-2">
              <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">
                איך מצטרפים
              </p>
              <h2 className="font-display text-3xl md:text-5xl text-primary mb-6 leading-tight">
                שלוש דקות.
                <br />
                בלי טפסים,
                <br />
                בלי התחייבות.
              </h2>
              <p className="text-muted-foreground font-light leading-relaxed mb-8">
                החברות במועדון אלומה חינמית לחלוטין ואישית — לא נשלח לכם ספאם,
                לא נמכור את הנתונים ולא נציק לכם בטלפון.
              </p>
              {!user && (
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 shadow-luxury group"
                >
                  <Link to="/club/auth?mode=signup">
                    להצטרפות מיידית
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-smooth" />
                  </Link>
                </Button>
              )}
            </div>

            <div className="lg:col-span-3">
              <div className="space-y-4">
                {steps.map((s, i) => (
                  <div
                    key={s.n}
                    className="group flex gap-6 md:gap-8 bg-background border border-border rounded-sm p-6 md:p-8 hover:border-accent/50 hover:shadow-soft transition-smooth"
                  >
                    <div className="shrink-0 font-display text-4xl md:text-5xl text-primary/25 group-hover:text-accent transition-smooth leading-none">
                      {s.n}
                    </div>
                    <div className="flex-1 border-r border-border/60 pr-6 md:pr-8">
                      <h3 className="font-display text-lg md:text-xl text-primary mb-2">
                        {s.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-light leading-relaxed">
                        {s.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL / QUOTE */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${sunlightSofa})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container-luxury relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-8 h-px bg-primary-foreground/40" />
              <Gift className="h-4 w-4 opacity-70" />
              <div className="w-8 h-px bg-primary-foreground/40" />
            </div>
            <blockquote className="font-display text-2xl md:text-4xl leading-relaxed mb-8 text-balance font-light">
              „החברות במועדון אלומה זה מה שהופך פרויקט לחוויה. יש מישהו שמכיר את
              הבית, את הגוונים, את מה שאהבנו — ופשוט זוכר.”
            </blockquote>
            <div className="flex items-center justify-center gap-3 text-sm opacity-90">
              <Users className="h-4 w-4" />
              <span>לקוחות אלומה · הרצליה פיתוח</span>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container-luxury">
          <div className="max-w-4xl mx-auto text-center border border-primary/20 rounded-sm p-10 md:p-16 gradient-cream shadow-luxury">
            <img
              src={alumaLogo}
              alt="Aluma"
              className="h-12 w-auto mx-auto mb-6 opacity-90"
            />
            <h2 className="font-display text-3xl md:text-5xl text-primary mb-4 leading-tight text-balance">
              {user ? "טוב לראות אתכם שוב." : "הבית שלכם ראוי לזה."}
            </h2>
            <p className="text-muted-foreground font-light leading-relaxed mb-10 max-w-xl mx-auto">
              {user
                ? "אזור החברים שלכם מחכה — מועדפים, סטטוסים והזמנות במקום אחד."
                : "הצטרפות חינם, בלי התחייבות. בכל רגע אפשר לצאת."}
            </p>
            {ctaBlock}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Club;
