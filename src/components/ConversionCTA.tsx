import { useSiteContact } from "@/hooks/useSiteContact";
import { MessageCircle, Phone, Sparkles } from "lucide-react";
import DirectionalArrow from "@/components/DirectionalArrow";
import ShineButton from "@/components/ui/shine-button";

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
  const SITE = useSiteContact();
  const wa = SITE.whatsapp.link(whatsappMessage);

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
            <span className="text-label tracking-[0.35em] uppercase">
              {eyebrow}
            </span>
          </div>

          <h2 className="font-display text-3xl md:text-5xl leading-tight mb-4 text-balance">
            {title}
          </h2>
          <p className="text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto mb-10">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <ShineButton to={primaryHref} on="terracotta">
              {primaryLabel}
              <DirectionalArrow animate={false} />
            </ShineButton>
            <ShineButton href={wa} target="_blank" rel="noopener noreferrer" on="terracotta">
              <MessageCircle aria-hidden="true" />
              בוואטסאפ עכשיו
            </ShineButton>
            <ShineButton href={`tel:${SITE.phone.tel}`} on="terracotta">
              <Phone aria-hidden="true" />
              חייגו אלינו
            </ShineButton>
          </div>

          <p className="mt-8 text-label">
            ייעוץ ראשוני חינם · תשובה תוך יום עסקים · ללא התחייבות
          </p>
        </div>
      </div>
    </section>
  );
};

export default ConversionCTA;
