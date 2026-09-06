import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FolderOpen,
  HelpCircle,
  MessageSquareQuote,
  Package,
  Phone,
  Type,
} from "lucide-react";
import AdminLayout from "./AdminLayout";

type Block = {
  icon: typeof Package;
  title: string;
  to: string;
};

/**
 * The way in — six places to go, and nothing else.
 *
 * This screen used to explain each area in three lines before you could reach
 * it, which is reading you do once and then scroll past forever. The
 * explanations moved onto the screens themselves, where they are read at the
 * moment they are needed rather than the moment they are not.
 *
 * The hero image and the enquiries screens are gone from here as well. Neither
 * is somewhere the shop's owner sets out to go; both are still in the sidebar.
 */
const BLOCKS: Block[] = [
  { icon: Package, title: "קולקציות ומוצרים", to: "/admin/collections" },
  { icon: FolderOpen, title: "פרויקטים", to: "/admin/projects" },
  { icon: Type, title: "טקסטים באתר", to: "/admin/texts" },
  { icon: MessageSquareQuote, title: "המלצות לקוחות", to: "/admin/reviews" },
  { icon: HelpCircle, title: "שאלות ותשובות", to: "/admin/faqs" },
  { icon: Phone, title: "פרטי הקשר", to: "/admin/settings" },
];

const AdminGuide = () => (
  <AdminLayout>
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl text-foreground">מה בא לכם לעשות?</h1>

      <nav aria-label="אזורי הניהול" className="mt-8">
        {/* One hairline grid, not six floating cards. The tiles share their
            edges — the 1px gaps sit over a border-coloured ground, so the gaps
            ARE the rules — and the block reads as one object with six doors
            rather than six things competing for attention. */}
        <ul className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
          {BLOCKS.map((b) => (
            <li key={b.to}>
              <Link
                to={b.to}
                className="group flex h-full items-center gap-4 bg-card px-6 py-7 transition-colors hover:bg-secondary focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
              >
                <span
                  aria-hidden="true"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-secondary text-foreground/70 transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  <b.icon className="h-5 w-5" />
                </span>

                <span className="flex-1 text-base font-medium text-foreground">{b.title}</span>

                <ArrowLeft
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-foreground"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </AdminLayout>
);

export default AdminGuide;
