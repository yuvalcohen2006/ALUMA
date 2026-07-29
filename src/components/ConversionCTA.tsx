import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import ShineButton from "@/components/ui/shine-button";

interface ConversionCTAProps {
  title: string;
  subtitle: string;
  /** Quiet secondary link under the primary button (defaults to the questionnaire). */
  contactHref?: string;
  contactLabel?: string;
  whatsappMessage?: string;
}

/**
 * Charcoal conversion band used at the end of the interactive tools
 * (SofaDesigner, FabricConfigurator). One primary action — WhatsApp via
 * ShineButton — with phone and the questionnaire as quiet text links.
 */
const ConversionCTA = ({
  title,
  subtitle,
  contactHref = "/questionnaire",
  contactLabel = "לקבלת הצעת מחיר אישית",
  whatsappMessage = "היי, שיחקתי עם הכלי באתר ואשמח לדבר על פרויקט.",
}: ConversionCTAProps) => {
  const wa = `https://wa.me/972504519062?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="py-16 md:py-24 bg-foreground text-background">
      <div className="container-luxury">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
          <SectionHeading light subtitle={subtitle}>
            {title}
          </SectionHeading>

          <div className="mt-10">
            <ShineButton to={wa} invert>
              בוואטסאפ עכשיו
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
            </ShineButton>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <a
              href="tel:+972504519062"
              className="inline-flex items-center gap-2 text-meta text-background/85 hover:text-background link-underline transition-smooth"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              חייגו אלינו
            </a>
            <Link
              to={contactHref}
              className="inline-flex items-center gap-2 text-meta text-background/85 hover:text-background link-underline transition-smooth"
            >
              {contactLabel}
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <p className="mt-8 text-meta text-background/60">
            ייעוץ ראשוני חינם · תשובה תוך יום עסקים · ללא התחייבות
          </p>
        </div>
      </div>
    </section>
  );
};

export default ConversionCTA;
