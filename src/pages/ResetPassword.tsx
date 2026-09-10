import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage } from "@/lib/auth-errors";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { directionFor } from "@/lib/field-direction";

/**
 * Where the "forgot password" email lands.
 *
 * Supabase's recovery link puts a session in place before this page renders,
 * so there is nothing to verify here — `updateUser` is authorised by that
 * session. What this page has to do is refuse to pretend: arriving without a
 * recovery session (an expired link, a link opened in another browser, someone
 * typing the URL) has to say so rather than show a form that cannot work.
 */
const ResetPassword = () => {
  const nav = useNavigate();
  const { to } = useLocalizedPath();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // The link's token is consumed by supabase-js on load, and that is async,
    // so the session can arrive a beat after mount. onAuthStateChange catches
    // the PASSWORD_RECOVERY event; getSession covers the case where it has
    // already happened before this effect ran.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAllowed(true);
        setChecking(false);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setAllowed(true);
      setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("הסיסמה צריכה להיות באורך 8 תווים לפחות.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("הסיסמה עודכנה. ברוכים השבים.");
      nav(to("/club/dashboard"), { replace: true });
    } catch (err) {
      toast.error(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <SEO title="איפוס סיסמה | מועדון אלומה" description="בחירת סיסמה חדשה למועדון אלומה." path="/club/reset" noindex />
      <section className="min-h-[70vh] pt-32 pb-20 md:pt-40">
        <div className="container-luxury max-w-md">
          <h1 className="font-display text-3xl text-foreground md:text-4xl">בחירת סיסמה חדשה</h1>

          {checking ? (
            <p className="mt-6 text-body text-muted-foreground">רגע…</p>
          ) : !allowed ? (
            <>
              <p className="mt-6 text-body leading-relaxed text-muted-foreground">
                הקישור לאיפוס הסיסמה פג או כבר נוצל. בקשו קישור חדש ממסך ההתחברות.
              </p>
              <Button asChild variant="outline" className="mt-6 rounded-sm">
                <a href={to("/club/auth")}>למסך ההתחברות</a>
              </Button>
            </>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-4">
              <div>
                <Label htmlFor="new-password">סיסמה חדשה</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  dir={directionFor(password)}
                  className="mt-1.5 h-11 rounded-sm"
                  placeholder="לפחות 8 תווים"
                />
              </div>
              <Button type="submit" disabled={busy} className="h-11 w-full rounded-sm">
                {busy ? "שומרים…" : "שמירת הסיסמה"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ResetPassword;
