import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/hooks/useAuth";

const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading } = useIsAdmin();

  if (authLoading || loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background" dir="rtl">
        <div className="text-muted-foreground text-sm tracking-wider">טוען…</div>
      </div>
    );
  }
  // The panel has its own door. The club sign-in is for customers, and
  // sending staff through it dropped the redirect back to /admin anyway.
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-6 text-center" dir="rtl">
        <h1 className="font-display text-3xl text-foreground mb-3">אין כאן מה לראות</h1>
        <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed">
          החשבון שאיתו נכנסתם לא מוגדר כמנהל של האתר.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <a href="/admin/login" className="text-foreground underline underline-offset-4">
            כניסה עם חשבון אחר
          </a>
          <a href="/" className="text-muted-foreground hover:text-foreground">חזרה לאתר</a>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export default AdminGuard;
