import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, PackageSearch, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocalizedPath } from "@/lib/useLocalizedPath";

/** "דנה כהן" if we have it, otherwise the half of the email before the @. */
function displayName(user: { email?: string; user_metadata?: { full_name?: string } }) {
  const full = user.user_metadata?.full_name?.trim();
  if (full) return full.split(" ")[0];
  return user.email?.split("@")[0] ?? "החשבון שלי";
}

/**
 * Proof that you are signed in, and the two or three things you would want
 * next. Renders nothing at all when signed out — the club link in the nav is
 * already the way in, and a second "sign in" chip beside it is noise.
 */
const AccountMenu = () => {
  const { user, loading, signOut } = useAuth();
  const { to } = useLocalizedPath();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  // Nothing to say yet, and a name that appears then vanishes is worse than a
  // beat of nothing.
  if (loading || !user) return null;

  const name = displayName(user);

  const item =
    "flex w-full items-center gap-3 px-4 h-11 text-small text-foreground text-start " +
    "hover:bg-foreground/[0.05] transition-colors focus-visible:outline-2 " +
    "focus-visible:-outline-offset-2 focus-visible:outline-ring";

  const close = () => setOpen(false);

  return (
    <div ref={wrap} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-11 items-center gap-2 rounded-full border border-foreground/15 ps-3 pe-2.5 text-small text-foreground transition-colors hover:border-foreground/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span
          aria-hidden="true"
          className="grid h-6 w-6 place-items-center rounded-full bg-foreground/10 text-label"
        >
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[9ch] truncate">{name}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 text-foreground/50 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="החשבון שלי"
          className="absolute top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-sm border border-border bg-background py-1.5 shadow-soft"
          style={{ insetInlineEnd: 0 }}
        >
          <div className="px-4 pb-2.5 pt-1.5">
            <p className="text-label text-muted-foreground">מחוברים בתור</p>
            <p className="truncate text-small text-foreground" dir="ltr" title={user.email}>
              {user.email}
            </p>
          </div>
          <div className="my-1 h-px bg-border" />

          <Link role="menuitem" to={to("/club/dashboard")} onClick={close} className={item}>
            <PackageSearch className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            מעקב אחרי ההזמנה
          </Link>
          <Link
            role="menuitem"
            to={to("/club/dashboard")}
            onClick={close}
            className={item}
          >
            <UserRound className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            הפרטים שלי
          </Link>

          <div className="my-1 h-px bg-border" />
          <button
            role="menuitem"
            type="button"
            onClick={async () => {
              close();
              await signOut();
              nav(to("/"));
            }}
            className={item}
          >
            <LogOut className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            יציאה
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
