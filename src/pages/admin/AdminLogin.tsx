import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import alumaLogo from "@/assets/aluma-logo.png";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.11a6.6 6.6 0 010-4.22V7.05H2.18a11 11 0 000 9.9l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 002.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

/**
 * The way in to the CMS.
 *
 * A password is checked by Supabase, but being a customer is not the same as
 * running the shop: the role is checked here too, and an account without it is
 * signed straight back out rather than left holding a session it cannot use.
 */
const AdminLogin = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<"password" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || busy) return;

    setBusy("password");
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError || !data.user) {
        // Deliberately vague: naming which half was wrong tells someone
        // fishing for addresses which ones exist.
        setError("האימייל או הסיסמה לא נכונים.");
        return;
      }

      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!role) {
        await supabase.auth.signOut();
        setError("החשבון הזה לא מוגדר כמנהל. אם זה אמור להיות אחרת, פנו למי שהקים את האתר.");
        return;
      }

      nav("/admin");
    } catch {
      setError("משהו השתבש בדרך. נסו שוב.");
    } finally {
      setBusy(null);
    }
  };

  const onGoogle = async () => {
    setBusy("google");
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin` },
    });
    // On success the browser leaves for Google and never gets here.
    if (oauthError) {
      setError("הכניסה עם Google נכשלה.");
      setBusy(null);
    }
  };

  const field =
    "w-full h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground " +
    "placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-ring transition-colors";

  return (
    <div dir="rtl" className="min-h-dvh grid place-items-center bg-secondary px-5 py-12">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center text-center">
          <img src={alumaLogo} alt="Aluma" className="h-9 w-auto opacity-90" />
          <h1 className="mt-6 font-display text-2xl text-foreground">ניהול האתר</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            הכניסה מיועדת לצוות אלומה בלבד.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-sm border border-border bg-background p-6 sm:p-7"
        >
          <label htmlFor="admin-email" className="block text-sm font-medium text-foreground">
            אימייל
          </label>
          <input
            id="admin-email"
            type="email"
            dir="ltr"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-2 ${field}`}
          />

          <label
            htmlFor="admin-password"
            className="mt-5 block text-sm font-medium text-foreground"
          >
            סיסמה
          </label>
          <div className="relative mt-2">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              dir="ltr"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // pr-12, not pe-12. Logical properties resolve against THIS
              // element's own direction, and this input is dir="ltr" — so
              // padding-inline-end landed on the right while the button sat
              // on the page's inline-end (the left). The eye ended up on top
              // of the text. Both are physical here, and agree.
              className={`${field} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "הסתרת הסיסמה" : "הצגת הסיסמה"}
              className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </div>

          {/* Announced, not just shown: a screen reader gets told the sign-in
              failed instead of the focus silently landing back on the form. */}
          <div role="alert" aria-live="polite">
            {error && (
              <p className="mt-4 rounded-sm bg-destructive/10 px-3 py-2.5 text-sm leading-relaxed text-destructive">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={busy !== null}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-foreground text-base text-background transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {busy === "password" && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            כניסה
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            או
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Kept because the first admin account was created with Google and
              has no password until one is set from inside the panel. */}
          <button
            type="button"
            onClick={onGoogle}
            disabled={busy !== null}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-sm border border-border bg-background text-base text-foreground transition-colors hover:bg-secondary disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <GoogleIcon />
            כניסה עם Google
          </button>
        </form>

        {/* Names the screen exactly as the menu names it. It used to say
            "הגדרות אתר", which is not a label that exists any more. */}
        <p className="mt-5 text-center text-sm leading-relaxed text-muted-foreground">
          אין לכם סיסמה עדיין? היכנסו עם Google, ואז קבעו סיסמה בתפריט תחת
          <span className="mx-1 text-foreground">הגדרות → פרטי קשר וסיסמה</span>.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
