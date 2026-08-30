import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FolderOpen,
  HelpCircle,
  Image as ImageIcon,
  Inbox,
  MessageSquareQuote,
  Palette,
  Phone,
  Sparkles,
  Type,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AdminLayout from "./AdminLayout";

type Card = {
  icon: typeof FolderOpen;
  title: string;
  /** One line, the way you'd say it out loud. */
  blurb: string;
  /** The setting worth getting right here. Omitted where there isn't one. */
  tip?: string;
  to: string;
};

/**
 * The landing screen for /admin.
 *
 * Someone opening this wants to change one thing and get on with their day.
 * So: what each screen is for, in a sentence, and the one setting worth
 * getting right. Everything else is on the screen itself when they get there.
 */
const CARDS: Card[] = [
  {
    icon: FolderOpen,
    title: "קולקציות ומוצרים",
    blurb: "הרהיטים עצמם. בלי אלה האתר די ריק, אז כדאי להתחיל כאן.",
    tip: "תמונות מרובעות, ⁦1600 × 1600⁩. הראשונות שתוסיפו הן אלה שיופיעו בדף הבית.",
    to: "/admin/collections",
  },
  {
    icon: Palette,
    title: "צבעים וגימורים",
    blurb: "עיגולי הצבע בעמוד המוצר. לוחצים על צבע, התמונה מתחלפת.",
    tip: "צלמו כל צבע מאותה זווית, אחרת הרהיט קופץ כשמחליפים.",
    to: "/admin/collections",
  },
  {
    icon: ImageIcon,
    title: "התמונה הראשית",
    blurb: "התמונה הגדולה בכניסה לאתר, והמשפט שעליה.",
    tip: "⁦2400 × 1350⁩, לרוחב. בטלפון היא נחתכת לגובה, אז שימו את העיקר במרכז.",
    to: "/admin/hero",
  },
  {
    icon: FolderOpen,
    title: "פרויקטים",
    blurb: "עבודות שכבר עשיתם. שלוש מהן מופיעות גם בדף הבית.",
    tip: "⁦2000 × 1333⁩, לרוחב. תמונות מהטלפון לגובה ייחתכו.",
    to: "/admin/projects",
  },
  {
    icon: Type,
    title: "טקסטים באתר",
    blurb: "כותרות ומשפטים בעמודים הראשיים. כל שדה מסומן איפה הוא מופיע.",
    tip: "מחקתם טקסט? האתר חוזר לנוסח המקורי. אי אפשר לשבור.",
    to: "/admin/texts",
  },
  {
    icon: HelpCircle,
    title: "שאלות ותשובות",
    blurb: "העמוד של השאלות הנפוצות, כולל הכותרות מעל כל קבוצה.",
    to: "/admin/faqs",
  },
  {
    icon: MessageSquareQuote,
    title: "המלצות לקוחות",
    blurb: "הציטוטים בדף הבית. כשאין אף אחד, האזור פשוט לא מופיע.",
    tip: "רק דברים שלקוחות באמת אמרו והסכימו שתפרסמו.",
    to: "/admin/reviews",
  },
  {
    icon: Phone,
    title: "פרטי הקשר",
    blurb: "טלפון, וואטסאפ, כתובת ורשתות — מתחלף בכל האתר בבת אחת.",
    to: "/admin/settings",
  },
  {
    icon: Inbox,
    title: "פניות מהאתר",
    blurb: "מי כתב לכם דרך הטופס. מגיע גם למייל, זה פשוט לא מתפספס כאן.",
    to: "/admin/leads",
  },
];

/** The four things worth knowing before touching anything. */
const BASICS = [
  ["איך עובדים", "בוחרים מסך מהתפריט, משנים, שומרים. זהו."],
  ["מתי זה עולה לאתר", "מיד. שומרים, מרעננים את האתר, זה שם."],
  ["מה זה פורסם", "מתג שקובע אם משהו נראה באתר. כבוי = שמור אצלכם, לא באתר."],
  ["אפשר לשבור משהו?", "לא. שום דבר לא נמחק בלי לשאול, וטקסט שנמחק חוזר לנוסח המקורי."],
];

const AdminGuide = () => (
  <AdminLayout>
    <div className="max-w-5xl">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-foreground">מה בא לכם לעשות?</h1>

        <Dialog>
          <DialogTrigger className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            חדשים כאן?
          </DialogTrigger>
          <DialogContent dir="rtl" className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-start">מה אפשר לעשות כאן</DialogTitle>
            </DialogHeader>
            <dl className="space-y-4 text-start">
              {BASICS.map(([q, a]) => (
                <div key={q}>
                  <dt className="text-sm font-medium text-foreground">{q}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{a}</dd>
                </div>
              ))}
            </dl>
          </DialogContent>
        </Dialog>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CARDS.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="group flex flex-col rounded-sm border border-border bg-card p-5 transition-colors hover:border-foreground/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <div className="flex items-center gap-2.5">
              <card.icon
                className="h-[18px] w-[18px] text-muted-foreground transition-colors group-hover:text-foreground"
                aria-hidden="true"
              />
              <h2 className="font-medium text-foreground">{card.title}</h2>
            </div>

            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{card.blurb}</p>

            {card.tip && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">{card.tip}</p>
            )}

            <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm text-foreground">
              פתיחה
              <ArrowLeft
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default AdminGuide;
