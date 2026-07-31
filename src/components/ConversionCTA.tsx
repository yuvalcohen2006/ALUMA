import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Phone, Sparkles } from "lucide-react";

interface ConversionCTAProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primaryHref?: string;
  primaryLabel?: string;
  whatsappMessage?: string;
}

/**
 * Rich conversion strip used at the end of the interactive tools
 * (SofaDesigner, FabricConfigurator) to turn "playing with the tool"
 * into a concrete next step: get a quote, WhatsApp us, or book a call.
 */
const ConversionCTA = ({
  eyebrow = "הצעד הבא",
  title,
  subtitle,
  primaryHref = "/questionnaire",
  primaryLabel = "לקבלת הצעת מחיר אישית",
  whatsappMessage = "היי, שיחקתי עם הכלי באתר ואשמח לדבר על פרויקט.",
}: ConversionCTAProps) => {
  const wa = `https://wa.me/972504519062?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, hsl(var(--accent)) 0, transparent 40%), radial-gradient(circle at 80% 80%, hsl(var(--primary-foreground)) 0, transparent 40%)",
        }}
      />
      <div className="container-luxury relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-primary-foreground/25 rounded-sm px-4 py-1.5 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-[11px] tracking-[0.35em] uppercase opacity-90">
              {eyebrow}
            </span>
          </div>

          <h2 className="font-display text-3xl md:text-5xl leading-tight mb-4 text-balance">
            {title}
          </h2>
          <p className="text-base md:text-lg font-normal opacity-85 leading-relaxed max-w-2xl mx-auto mb-10">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-sm px-8 shadow-luxury group bg-background text-primary hover:bg-background/90"
            >
              <Link to={primaryHref}>
                {primaryLabel}
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-smooth" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-sm px-8 bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="ml-2 h-4 w-4" />
                בוואטסאפ עכשיו
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-sm px-8 bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <a href="tel:+972504519062">
                <Phone className="ml-2 h-4 w-4" />
                חייגו אלינו
              </a>
            </Button>
          </div>

          <p className="mt-8 text-xs opacity-70">
            ייעוץ ראשוני חינם · תשובה תוך יום עסקים · ללא התחייבות
          </p>
        </div>
      </div>
    </section>
  );
};

export default ConversionCTA;
