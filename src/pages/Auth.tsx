import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import ShineAction from "@/components/ui/shine-action";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { trackPixel } from "@/lib/pixel";
import { cn } from "@/lib/utils";
import alumaLogo from "@/assets/aluma-logo.png";
import heroSalon from "@/assets/hero-salon.jpg";
import {
  Sparkles,
  Heart,
  ShieldCheck,
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const sidePerks = [
  { icon: ClipboardCheck, text: "מעקב פרויקט חי, סטטוס ואבני דרך בזמן אמת" },
  { icon: Heart, text: "מועדפים שנשמרים בין המכשירים" },
  { icon: Sparkles, text: "גישה מוקדמת לקולקציות והזמנות פרטיות" },
  { icon: ShieldCheck, text: "מעצב אישי ושירות VIP מלווה" },
];

/* Plain <label>/<input> with the Contact-form field grammar rather than the ui
   Input/Label primitives: those carry text-sm / md:text-sm baked in, which
   fights the 18px floor through tailwind-merge. Same 10px control radius, same
   focus ring recipe — deliberately no `outline-none`, the global focus-visible
   ring is what keyboard users navigate by. */
const fieldClass =
  "h-12 w-full rounded-[10px] border border-border bg-background px-4 text-meta text-foreground placeholder:text-muted-foreground/70 transition-smooth focus:border-primary focus:ring-4 focus:ring-primary/15";

const labelClass = "block font-display text-meta font-medium text-foreground mb-2.5";

const AuthPage = () => {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(
    params.get("mode") === "signup" ? "signup" : "signin"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const rawRedirect = params.get("redirect") || "";
  const redirectTo =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/club/dashboard";

  useEffect(() => {
    if (!loading && user) nav(redirectTo, { replace: true });
  }, [user, loading, nav, redirectTo]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/club/dashboard`,
            data: { full_name: fullName, phone },
          },
        });
        if (error) throw error;
        trackPixel("CompleteRegistration", {
          content_name: "הצטרפות למועדון אלומה",
          status: true,
        });
        toast.success("נרשמת למועדון! בדוק את האימייל לאישור.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("ברוכים השבים למועדון");
        nav(redirectTo);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "אירעה שגיאה");
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setGoogleBusy(true);
    try {
      // Supabase's own OAuth. On success the browser navigates away to Google,
      // so there is nothing to do afterwards — Supabase brings the user back to
      // `redirectTo` with a session already established. Only reset the busy
      // flag on failure, otherwise the button flickers during the hand-off.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Honor the same ?redirect target the email flow uses (e.g.
          // /club/dashboard) instead of always dumping the user on the homepage.
          redirectTo: `${window.location.origin}${redirectTo}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err?.message ?? "כניסה עם Google נכשלה");
      setGoogleBusy(false);
    }
  };

  const isSignup = mode === "signup";

  const segmentClass = (active: boolean) =>
    cn(
      "h-11 rounded-[10px] text-meta transition-smooth",
      active
        ? "bg-foreground text-background"
        : "text-foreground-soft hover:text-foreground"
    );

  return (
    <Layout>
      <SEO
        title={isSignup ? "הצטרפות למועדון | Aluma" : "התחברות למועדון | Aluma"}
        description="מועדון אלומה, מעקב הזמנה, מועדפים והטבות בלעדיות."
        path="/club/auth"
        noIndex
      />

      <PageHero title={isSignup ? "הצטרפות למועדון" : "התחברות למועדון"} />

      <section className="pt-8 md:pt-10 pb-16 md:pb-24 bg-background">
        <div className="container-luxury">
          <Reveal>
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 rounded-[14px] overflow-hidden border border-border bg-background shadow-soft">
              {/* ── Brand panel — the page's one dark element ──
                  The hero photograph under a charcoal scrim, finished with the
                  shared film grain. RTL: first grid child, so it takes the
                  RIGHT column and the form sits left. */}
              <aside className="grain relative hidden lg:flex flex-col justify-between p-12 min-h-[640px] overflow-hidden text-background">
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${heroSalon})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-b from-foreground/90 via-foreground/85 to-foreground/80"
                />

                <div className="relative">
                  {/* Decorative: the Hebrew line right under it names the brand. */}
                  <img
                    src={alumaLogo}
                    alt=""
                    aria-hidden="true"
                    className="h-12 w-auto brightness-0 invert opacity-95"
                  />
                  <p className="mt-4 text-meta text-background/80">
                    מועדון הלקוחות של אלומה
                  </p>
                </div>

                <div className="relative">
                  <h2 className="font-display font-normal text-[30px] xl:text-[34px] leading-tight">
                    עולם שקט של שירות,
                    <br />
                    שנתפר במידה שלכם.
                  </h2>
                  <div className="w-16 h-px bg-background/40 my-7" aria-hidden="true" />
                  <ul className="space-y-4">
                    {sidePerks.map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-center gap-3 text-meta text-background/90">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-background/20 bg-background/10">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="leading-relaxed">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="relative text-meta text-background/70">
                  חינם · בלי התחייבות · יציאה בכל רגע
                </p>
              </aside>

              {/* ── The form ── */}
              <div className="p-7 sm:p-8 md:p-12 lg:p-14 bg-background">
                <div className="max-w-md mx-auto">
                  {/* Mobile brand head — below lg the charcoal panel is gone,
                      so the card still opens on the mark and the Hebrew line. */}
                  <div className="lg:hidden text-center mb-8">
                    <img
                      src={alumaLogo}
                      alt=""
                      aria-hidden="true"
                      className="h-12 w-auto mx-auto"
                    />
                    <p className="mt-3 text-meta text-muted-foreground">
                      מועדון הלקוחות של אלומה
                    </p>
                  </div>

                  {/* Segmented mode control — active half takes the charcoal fill. */}
                  <div className="grid grid-cols-2 gap-1 rounded-[14px] border border-border bg-secondary/60 p-1 mb-8">
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      aria-pressed={isSignup}
                      className={segmentClass(isSignup)}
                    >
                      הצטרפות
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      aria-pressed={!isSignup}
                      className={segmentClass(!isSignup)}
                    >
                      התחברות
                    </button>
                  </div>

                  {/* Greeting, not the page title — the h1 lives in PageHero. */}
                  <h2 className="font-display font-normal text-[26px] leading-snug text-foreground">
                    {isSignup ? "ברוכים הבאים למועדון" : "ברוכים השבים"}
                  </h2>
                  <p className="mt-2 mb-8 text-meta leading-relaxed text-muted-foreground">
                    {isSignup
                      ? "דקה אחת, ואתם בפנים. חינם, ללא התחייבות."
                      : "טוב לראות אתכם שוב. התחברו כדי להמשיך."}
                  </p>

                  <button
                    type="button"
                    onClick={onGoogle}
                    disabled={googleBusy}
                    className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-[10px] border border-border bg-background text-meta text-foreground transition-smooth hover:border-primary/60 hover:bg-secondary/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <GoogleIcon />
                    {googleBusy ? "רגע..." : isSignup ? "הרשמה מהירה עם Google" : "המשך עם Google"}
                  </button>

                  <div className="my-6 flex items-center gap-3 text-meta text-muted-foreground">
                    <span className="h-px flex-1 bg-border" aria-hidden="true" />
                    או במייל
                    <span className="h-px flex-1 bg-border" aria-hidden="true" />
                  </div>

                  <form onSubmit={onSubmit} className="space-y-5">
                    {isSignup && (
                      <>
                        <div>
                          <label htmlFor="fullName" className={labelClass}>
                            שם מלא
                          </label>
                          <input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className={fieldClass}
                            placeholder="שם פרטי ומשפחה"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className={labelClass}>
                            טלפון
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className={fieldClass}
                            placeholder="050-0000000"
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label htmlFor="email" className={labelClass}>
                        אימייל
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        dir="ltr"
                        className={fieldClass}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className={labelClass}>
                        סיסמה
                      </label>
                      <input
                        id="password"
                        type="password"
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        dir="ltr"
                        className={fieldClass}
                        placeholder="לפחות 8 תווים"
                      />
                    </div>

                    <ShineAction
                      type="submit"
                      disabled={busy}
                      className="group w-full disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busy ? "רגע..." : isSignup ? "להצטרפות למועדון" : "התחברות"}
                      {!busy && (
                        <ArrowLeft
                          className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
                          aria-hidden="true"
                        />
                      )}
                    </ShineAction>
                  </form>

                  <p className="mt-6 text-meta leading-relaxed text-muted-foreground text-center">
                    בהצטרפות אתם מאשרים את{" "}
                    <Link
                      to="/terms"
                      className="font-medium text-foreground underline underline-offset-4 decoration-foreground/40 transition-colors hover:decoration-foreground"
                    >
                      תנאי השימוש
                    </Link>{" "}
                    ואת{" "}
                    <Link
                      to="/privacy"
                      className="font-medium text-foreground underline underline-offset-4 decoration-foreground/40 transition-colors hover:decoration-foreground"
                    >
                      מדיניות הפרטיות
                    </Link>
                    .
                  </p>

                  <div className="mt-8 text-center">
                    {/* RTL: back points RIGHT, and the icon leads so it sits on
                        the right of the label. */}
                    <Link
                      to="/club"
                      className="link-underline inline-flex items-center gap-2 text-meta text-foreground-soft transition-smooth hover:text-accent"
                    >
                      <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
                      על המועדון
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default AuthPage;
