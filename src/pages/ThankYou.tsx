import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Check, ArrowLeft, Phone, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import alumaLogo from "@/assets/aluma-logo.png";

const ThankYou = () => {
  useEffect(() => {
    // Conversion event for analytics (gtag/fbq if loaded later)
    try {
      const w = window as unknown as {
        gtag?: (...args: unknown[]) => void;
        fbq?: (...args: unknown[]) => void;
      };
      w.gtag?.("event", "generate_lead", { event_category: "contact", event_label: "thank_you" });
      w.fbq?.("track", "Lead");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>תודה על פנייתכם | Aluma</title>
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href="https://alumaoutdoor.com/thank-you" />
      </Helmet>
      <Header />
      <main className="min-h-[80vh] flex items-center justify-center px-5 py-20 bg-background">
        <div className="max-w-xl w-full text-center">
          <div className="mx-auto w-16 h-16 rounded-sm bg-accent/15 border border-accent/40 flex items-center justify-center mb-6">
            <Check className="w-8 h-8 text-accent" strokeWidth={2.5} />
          </div>

          <img src={alumaLogo} alt="Aluma" className="h-10 w-auto mx-auto mb-6 opacity-90" />

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-primary mb-3 leading-tight">
            תודה רבה על פנייתכם
          </h1>
          <p className="text-body text-foreground mb-2">
            קיבלנו את ההודעה ונחזור אליכם בהקדם, בדרך כלל תוך 24 שעות בימי עסקים.
          </p>
          <p className="text-[18px] text-muted-foreground mb-10">
            בינתיים, אתם מוזמנים להתרשם מהפרויקטים שלנו או לכתוב לנו ישירות בוואטסאפ.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <a
              href="https://wa.me/972504519062"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white px-6 py-3 rounded-[14px] text-[18px] transition-smooth"
            >
              <MessageCircle className="w-4 h-4" />
              שלחו לנו ב-Whatsapp
            </a>
            <a
              href="tel:0504519062"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-[14px] text-[18px] transition-smooth"
            >
              <Phone className="w-4 h-4" />
              חיוג ישיר
            </a>
          </div>

          <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-[18px]">
            <Link
              to="/projects"
              className="text-foreground hover:text-accent transition-smooth inline-flex items-center gap-1.5"
            >
              צפו בפרויקטים שלנו
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <span className="hidden sm:inline text-border">|</span>
            <Link
              to="/"
              className="text-muted-foreground hover:text-primary transition-smooth"
            >
              חזרה לדף הבית
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ThankYou;
