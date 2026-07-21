import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { contactSchema } from "@/lib/contactSchema";
import { supabase } from "@/integrations/supabase/client";
import alumaLogo from "@/assets/aluma-logo.png";

const contactItems = [
  {
    icon: Phone,
    title: "050-451-9062",
    subtitle: "אנו זמינים עבורכם בטלפון",
    href: "tel:0504519062",
  },
  {
    icon: Mail,
    title: "info@aluma.co.il",
    subtitle: "כתבו לנו במייל או דרך הטופס",
    href: "mailto:info@aluma.co.il",
  },
  {
    icon: MapPin,
    title: "התמר 78, יציץ",
    subtitle: "אולם תצוגה בתיאום מראש",
    href: null,
  },
  {
    icon: MessageCircle,
    title: "שלחו לנו הודעת Whatsapp",
    subtitle: "מענה אנושי מהיר",
    href: "https://wa.me/972504519062",
    accent: true,
  },
];

const COOLDOWN_MS = 30_000;
const MIN_FILL_MS = 2_500;

const Contact = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const formMountedAt = useRef<number>(Date.now());
  const lastSubmitAt = useRef<number>(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const now = Date.now();

    if (now - formMountedAt.current < MIN_FILL_MS) {
      toast.error("נא לנסות שוב בעוד רגע");
      return;
    }
    if (now - lastSubmitAt.current < COOLDOWN_MS) {
      const secs = Math.ceil((COOLDOWN_MS - (now - lastSubmitAt.current)) / 1000);
      toast.error(`נשלחה הודעה לאחרונה — נסו שוב בעוד ${secs} שניות`);
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || ""),
      phone: String(data.get("phone") || ""),
      email: String(data.get("email") || ""),
      message: String(data.get("message") || ""),
      website: String(data.get("website") || ""),
    };

    if (payload.website) {
      toast.success("תודה! נחזור אליכם בהקדם");
      form.reset();
      return;
    }

    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("יש לתקן את השדות המסומנים");
      return;
    }

    setErrors({});
    setSubmitting(true);
    lastSubmitAt.current = now;

    try {
      const { data: result, error } = await supabase.functions.invoke("submit-contact", {
        body: { ...parsed.data, source: "contact-page" },
      });

      if (error) {
        // Try to extract structured error message from edge function response
        const ctx = (error as { context?: Response }).context;
        let serverMsg = "שגיאה בשליחה. נסו שוב או צרו קשר בטלפון.";
        if (ctx) {
          try {
            const body = await ctx.json();
            if (body?.error) serverMsg = body.error;
            if (ctx.status === 429) serverMsg = body?.error ?? "נשלחו יותר מדי פניות. נסו שוב מאוחר יותר.";
          } catch {
            /* ignore */
          }
        }
        toast.error(serverMsg);
      } else if (result?.ok) {
        form.reset();
        formMountedAt.current = Date.now();
        navigate("/thank-you");
      } else {
        toast.error("שגיאה לא צפויה. נסו שוב.");
      }
    } catch (err) {
      console.error(err);
      toast.error("שגיאת רשת. בדקו חיבור ונסו שוב.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-background">
      <div className="container-luxury">
       <div className="border border-primary/50 rounded-sm p-6 md:p-10 bg-background">
         <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-10 lg:gap-0 items-stretch">
           {/* Right column (RTL first) — Form */}
           <div className="lg:pl-16 order-1">
             <div className="mb-8">
               <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal text-primary leading-tight mb-3">
                 כתבו לנו
               </h2>
               <p className="text-muted-foreground text-base md:text-lg">
                 ספרו לנו מה החלום שלכם ואנחנו נדאג להגשים לכם אותו.
               </p>
               <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-primary/80">
                 <span className="inline-flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-accent" /> מענה תוך 24 שעות בימי עסקים
                 </span>
                 <span className="inline-flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-accent" /> ייעוץ ללא עלות וללא התחייבות
                 </span>
                 <span className="inline-flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-accent" /> פרטיכם נשמרים אצלנו בלבד
                 </span>
               </div>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Honeypot — hidden from real users */}
                <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden" style={{ position: "absolute" }}>
                  <label>
                    Website
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-display text-lg font-bold text-primary mb-2">
                      שם <span className="text-accent">*</span>
                    </label>
                    <Input
                      name="name"
                      required
                      maxLength={100}
                      autoComplete="name"
                      placeholder="שם מלא"
                      dir="rtl"
                      aria-invalid={!!errors.name}
                      className="bg-transparent h-12 rounded-sm border-border focus-visible:border-primary text-right placeholder:text-right"
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block font-display text-lg font-bold text-primary mb-2">
                      טלפון <span className="text-accent">*</span>
                    </label>
                    <Input
                      name="phone"
                      required
                      type="tel"
                      maxLength={20}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="טלפון נייד לחזרה"
                      dir="rtl"
                      aria-invalid={!!errors.phone}
                      className="bg-transparent h-12 rounded-sm border-border focus-visible:border-primary text-right placeholder:text-right"
                    />
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block font-display text-lg font-bold text-primary mb-2">מייל</label>
                    <Input
                      name="email"
                      type="email"
                      maxLength={255}
                      autoComplete="email"
                      placeholder="כתובת מייל"
                      dir="rtl"
                      aria-invalid={!!errors.email}
                      className="bg-transparent h-12 rounded-sm border-border focus-visible:border-primary text-right placeholder:text-right"
                    />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block font-display text-lg font-bold text-primary mb-2">
                    ספרו לנו על הפרויקט שלכם
                  </label>
                  <Textarea
                    name="message"
                    maxLength={1000}
                    placeholder="מה תרצו לכתוב לנו?"
                    rows={6}
                    aria-invalid={!!errors.message}
                    className="bg-transparent rounded-sm border-border focus-visible:border-primary resize-none"
                  />
                  {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  בשליחת הטופס הינכם מאשרים את{" "}
                  <a href="/privacy" className="underline underline-offset-2 hover:text-primary">מדיניות הפרטיות</a>{" "}
                  שלנו. הפרטים נשמרים לצורך חזרה אליכם בלבד ולא מועברים לצד שלישי.
                </p>

                <div className="flex items-center justify-between gap-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-10 rounded-sm tracking-wide shadow-gold disabled:opacity-60"
                  >
                    {submitting ? "שולח..." : "שליחת הודעה"}
                  </Button>
                  <img
                    src={alumaLogo}
                    alt="Aluma"
                    className="h-7 md:h-8 w-auto opacity-90"
                  />
                </div>
              </form>
           </div>

           {/* Divider */}
           <div className="hidden lg:block w-px bg-primary/20 self-stretch order-2" />

           {/* Left column — Contact info */}
           <div className="lg:pr-16 order-3">


             <div className="space-y-0">
               {contactItems.map((item, idx) => {
                 const Icon = item.icon;
                 const inner = (
                   <div className={`flex items-center gap-3 py-3 ${idx !== contactItems.length - 1 ? 'border-b border-border/40' : ''}`}>
                     <Icon className={`w-4 h-4 shrink-0 ${item.accent ? 'text-[#25D366]' : 'text-primary/60'}`} />
                     <div className="text-right flex-1 min-w-0">
                       <div className="text-sm text-primary leading-snug truncate">
                         {item.title}
                       </div>
                       <div className="text-xs text-muted-foreground truncate">
                         {item.subtitle}
                       </div>
                     </div>
                   </div>
                 );
                 return item.href ? (
                   <a key={item.title} href={item.href} className="block hover:opacity-70 transition-smooth">
                     {inner}
                   </a>
                 ) : (
                   <div key={item.title}>{inner}</div>
                 );
               })}
             </div>

             <div className="mt-6 pt-5 border-t border-border/40 text-right">
               <div className="flex items-center justify-start gap-2 text-primary mb-2">
                 <span className="font-display text-sm font-normal">
                   שעות פעילות
                 </span>
                 <Clock className="w-3.5 h-3.5 text-primary/50" />
               </div>
               <div className="space-y-1 text-primary">
                 <div className="flex justify-between gap-4 text-xs text-muted-foreground">
                   <span>א׳ – ה׳</span>
                   <span dir="ltr">08:30 – 18:00</span>
                 </div>
                 <div className="flex justify-between gap-4 text-xs text-muted-foreground">
                   <span>יום ו׳</span>
                   <span dir="ltr">08:30 – 12:00</span>
                 </div>
               </div>
               <p className="text-[11px] text-muted-foreground mt-2">
                 אולם תצוגה בתיאום מראש
               </p>
             </div>
           </div>
         </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
