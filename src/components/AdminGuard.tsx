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
  if (!user) return <Navigate to="/auth?redirect=/admin" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-6 text-center" dir="rtl">
        <h1 className="font-display text-3xl text-primary mb-3">אין הרשאת גישה</h1>
        <p className="text-muted-foreground mb-6">
          רק משתמשים עם תפקיד אדמין יכולים להיכנס לפאנל הניהול.
        </p>
        <a href="/" className="text-primary hover:text-primary/80">חזרה לדף הבית</a>
      </div>
    );
  }
  return <>{children}</>;
};

export default AdminGuard;
