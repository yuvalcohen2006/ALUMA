import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { trackPixel } from "@/lib/pixel";
import alumaLogo from "@/assets/aluma-logo.png";
import heroSalon from "@/assets/hero-salon.jpg";
import { Sparkles, Heart, ShieldCheck, ClipboardCheck, ArrowLeft } from "lucide-react";

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
      const result = await lovable.auth.signInWithOAuth("google", {
        // Honor the same ?redirect target the email flow uses (e.g. /club/dashboard),
        // instead of always dumping the user on the homepage.
        redirect_uri: `${window.location.origin}${redirectTo}`,
      });
      if (result.error) {
        toast.error(result.error.message ?? "כניסה עם Google נכשלה");
        setGoogleBusy(false);
        return;
      }
      if (result.redirected) return;
      nav(redirectTo);
    } catch (err: any) {
      toast.error(err?.message ?? "כניסה עם Google נכשלה");
      setGoogleBusy(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <Layout>
      <SEO
        title={isSignup ? "הצטרפות למועדון | Aluma" : "התחברות למועדון | Aluma"}
        description="מועדון אלומה, מעקב הזמנה, מועדפים והטבות בלעדיות."
        path="/club/auth"
      />
      <section className="pt-24 md:pt-28 pb-16 md:pb-24 gradient-cream">
        <div className="container-luxury">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 rounded-sm overflow-hidden shadow-luxury border border-primary/15 bg-background">
            {/* LEFT, brand panel */}
            <aside className="relative hidden lg:flex flex-col justify-between p-12 text-primary-foreground overflow-hidden min-h-[640px]">
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${heroSalon})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(160deg, hsl(13 39% 22% / 0.88), hsl(13 39% 32% / 0.72))",
                }}
              />

              <div className="relative">
                <img src={alumaLogo} alt="Aluma" className="h-12 w-auto brightness-0 invert opacity-95" />
                <p className="mt-3 text-[11px] tracking-[0.4em] uppercase opacity-70">
                  Aluma Private Club
                </p>
              </div>

              <div className="relative">
                <h2 className="font-display text-3xl xl:text-4xl leading-tight text-balance mb-6">
                  עולם שקט של שירות,
                  <br />
                  שנתפר במידה שלכם.
                </h2>
                <div className="w-16 h-px bg-primary-foreground/40 mb-6" />
                <ul className="space-y-4">
                  {sidePerks.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3 text-sm opacity-95 font-normal leading-relaxed">
                      <span className="mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-sm bg-primary-foreground/10 backdrop-blur border border-primary-foreground/20 shrink-0">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative text-[11px] tracking-[0.25em] uppercase opacity-70">
                חינם · בלי התחייבות · יציאה בכל רגע
              </div>
            </aside>

            {/* RIGHT, form */}
            <div className="p-8 md:p-12 lg:p-14 bg-background">
              <div className="max-w-sm mx-auto">
                {/* Mobile logo */}
                <div className="lg:hidden text-center mb-8">
                  <img src={alumaLogo} alt="Aluma" className="h-12 w-auto mx-auto mb-2" />
                  <p className="text-[10px] tracking-[0.4em] uppercase text-foreground">
                    Aluma Private Club
                  </p>
                </div>

                {/* Mode toggle pills */}
                <div className="inline-flex w-full rounded-sm bg-secondary/60 p-1 mb-8 border border-border">
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`flex-1 py-2.5 text-sm rounded-sm transition-smooth ${
                      isSignup
                        ? "bg-background shadow-soft text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    הצטרפות
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className={`flex-1 py-2.5 text-sm rounded-sm transition-smooth ${
                      !isSignup
                        ? "bg-background shadow-soft text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    התחברות
                  </button>
                </div>

                <h1 className="font-display text-3xl md:text-4xl text-primary mb-2 leading-tight">
                  {isSignup ? "ברוכים הבאים למועדון" : "ברוכים השבים"}
                </h1>
                <p className="text-sm text-muted-foreground mb-8 font-normal leading-relaxed">
                  {isSignup
                    ? "דקה אחת, ואתם בפנים. חינם, ללא התחייבות."
                    : "טוב לראות אתכם שוב. התחברו כדי להמשיך."}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onGoogle}
                  disabled={googleBusy}
                  className="w-full h-11 rounded-sm flex items-center justify-center gap-3 border-primary/25 hover:border-primary hover:bg-secondary/40"
                >
                  <GoogleIcon />
                  <span className="text-sm">
                    {googleBusy ? "רגע..." : isSignup ? "הרשמה מהירה עם Google" : "המשך עם Google"}
                  </span>
                </Button>

                <div className="flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase text-muted-foreground my-6">
                  <div className="flex-1 h-px bg-border" />
                  <span>או במייל</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  {isSignup && (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="fullName" className="text-xs text-foreground">שם מלא</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="h-11 rounded-sm"
                          placeholder="שם פרטי ומשפחה"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs text-foreground">טלפון</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="h-11 rounded-sm"
                          placeholder="050-0000000"
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs text-foreground">אימייל</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      dir="ltr"
                      className="h-11 rounded-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs text-foreground">סיסמה</Label>
                    <Input
                      id="password"
                      type="password"
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      dir="ltr"
                      className="h-11 rounded-sm"
                      placeholder="לפחות 8 תווים"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={busy}
                    className="w-full h-11 rounded-sm shadow-luxury group"
                  >
                    {busy ? "רגע..." : isSignup ? "להצטרפות למועדון" : "התחברות"}
                    {!busy && (
                      <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-smooth" />
                    )}
                  </Button>
                </form>

                <p className="text-[11px] text-muted-foreground text-center mt-6 leading-relaxed">
                  בהצטרפות אתם מאשרים את{" "}
                  <Link to="/terms" className="text-foreground hover:text-accent underline underline-offset-2">
                    תנאי השימוש
                  </Link>{" "}
                  ואת{" "}
                  <Link to="/privacy" className="text-foreground hover:text-accent underline underline-offset-2">
                    מדיניות הפרטיות
                  </Link>
                  .
                </p>

                <Link
                  to="/club"
                  className="mt-6 block text-center text-xs text-muted-foreground hover:text-accent tracking-[0.15em] uppercase"
                >
                  ← על המועדון
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AuthPage;
