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
  Type,
} from "lucide-react";
import AdminLayout from "./AdminLayout";

type Card = {
  icon: typeof FolderOpen;
  title: string;
  /** One line, the way you'd say it out loud. */
  blurb: string;
  /** What you can actually do in there. Short phrases, not instructions. */
  can: string[];
  /** The thing people go looking for in the wrong place. */
  cant: string;
  to: string;
};

/**
 * The landing screen for /admin.
 *
 * Not a dashboard of numbers — the person opening this wants to change one
 * thing and get on with their day. So: what each screen is for, what you can
 * do there, and the one thing people will go looking for there and not find.
 *
 * The "not from here" line matters as much as the rest. Most of the time
 * somebody is stuck, it is because they are on the right-looking screen for
 * the wrong job.
 */
const CARDS: Card[] = [
  {
    icon: FolderOpen,
    title: "קולקציות ומוצרים",
    blurb: "הרהיטים עצמם. זה הדבר הראשון למלא — בלי מוצרים האתר די ריק.",
    can: [
      "להוסיף קולקציה (משפחה של רהיטים, למשל סלונים)",
      "להוסיף מוצר בתוך קולקציה, עם תמונות",
      "לשנות שם, תיאור ותמונות של מוצר קיים",
      "להוריד מוצר מהאתר בלי למחוק אותו",
      "להוסיף מחיר, אם בא לכם — זה לא חובה",
    ],
    cant: "מחיר שנשאר ריק פשוט לא מופיע. אין מחירון באתר.",
    to: "/admin/collections",
  },
  {
    icon: Palette,
    title: "צבעים וגימורים",
    blurb: "עיגולי הצבע בעמוד המוצר. לחיצה על צבע מחליפה את התמונה.",
    can: [
      "להוסיף צבע למוצר, עם תמונה של המוצר בצבע הזה",
      "לבחור את גוון העיגול שמופיע באתר",
      "לשנות את הסדר שלהם",
    ],
    cant: "זה יושב בתוך המוצר עצמו — קודם שומרים מוצר, ואז מוסיפים לו צבעים.",
    to: "/admin/collections",
  },
  {
    icon: ImageIcon,
    title: "התמונה הראשית",
    blurb: "התמונה הגדולה שרואים ראשונה בדף הבית, והמשפט שעליה.",
    can: ["להחליף את התמונה", "לשנות את הכותרת והמשפט מתחתיה", "לשנות את הכפתור ולאן הוא מוביל"],
    cant: "שאר דף הבית נבנה לבד מהמוצרים והפרויקטים שהזנתם.",
    to: "/admin/hero",
  },
  {
    icon: FolderOpen,
    title: "פרויקטים",
    blurb: "עבודות שכבר עשיתם. שלושה מהם מופיעים גם בדף הבית.",
    can: ["להוסיף פרויקט עם תמונות", "לכתוב איפה זה ומה היה שם", "לשנות את הסדר"],
    cant: "לא צריך למלא הכול — מה שריק פשוט לא מופיע.",
    to: "/admin/projects",
  },
  {
    icon: Type,
    title: "טקסטים באתר",
    blurb: "כותרות ומשפטים בעמודים הראשיים, כל אחד מסומן איפה הוא מופיע.",
    can: ["לשנות כותרות ומשפטי פתיחה", "למחוק טקסט כדי לחזור לנוסח המקורי"],
    cant: "התפריט למעלה והתחתית של האתר לא נערכים מכאן.",
    to: "/admin/texts",
  },
  {
    icon: HelpCircle,
    title: "שאלות ותשובות",
    blurb: 'העמוד של "שאלות ותשובות", כולל הקטגוריות שמעל כל קבוצה.',
    can: ["לערוך שאלה או תשובה", "להוסיף שאלה חדשה", "להסתיר שאלה בלי למחוק"],
    cant: "הטופס בתחתית העמוד קבוע, רק השאלות משתנות.",
    to: "/admin/faqs",
  },
  {
    icon: MessageSquareQuote,
    title: "המלצות לקוחות",
    blurb: "הציטוטים בדף הבית. כל עוד אין אף אחד, האזור הזה פשוט לא מופיע.",
    can: ["להוסיף ציטוט עם שם", "להסתיר או למחוק"],
    cant: "רק דברים שלקוחות באמת אמרו והסכימו שתפרסמו.",
    to: "/admin/reviews",
  },
  {
    icon: Phone,
    title: "פרטי הקשר",
    blurb: "טלפון, וואטסאפ, כתובת ורשתות. מה שתשנו כאן מתחלף בכל האתר.",
    can: ["להחליף מספר טלפון או וואטסאפ", "לשנות כתובת ואימייל", "להוסיף הערה על שעות הפעילות"],
    cant: "שעות הפתיחה עצמן קבועות בקוד — אפשר להוסיף עליהן הערה.",
    to: "/admin/settings",
  },
  {
    icon: Inbox,
    title: "פניות מהאתר",
    blurb: "מי כתב לכם דרך הטופס. גם מגיע לאימייל, זה פשוט המקום שלא מתפספס.",
    can: ["לקרוא פניות", "לראות מתי הגיעו"],
    cant: "לענות עונים מהאימייל או מהוואטסאפ, לא מכאן.",
    to: "/admin/leads",
  },
];

const AdminGuide = () => (
  <AdminLayout>
    <div className="max-w-5xl">
      <header>
        <h1 className="font-display text-3xl text-foreground">מה בא לכם לעשות?</h1>
        <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-muted-foreground">
          כל מה שאפשר לשנות באתר נמצא כאן. כל כרטיס למטה הוא מסך אחד בתפריט —
          מה יש בו, ומה דווקא לא. שינוי נשמר ומופיע באתר מיד.
        </p>
        <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-muted-foreground">
          אי אפשר לשבור כלום מכאן. שום דבר לא נמחק בלי לשאול אתכם קודם.
        </p>
      </header>

      <div className="mt-9 grid gap-4 sm:grid-cols-2">
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

            <ul className="mt-4 space-y-1.5">
              {card.can.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-foreground/85">
                  {/* A dot, not a tick: these are options, not a checklist. */}
                  <span
                    aria-hidden="true"
                    className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-foreground/30"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <p className="mt-4 border-t border-border pt-3.5 text-[13px] leading-relaxed text-muted-foreground">
              <span className="text-foreground/70">לא מכאן: </span>
              {card.cant}
            </p>

            <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-foreground">
              פתיחה
              <ArrowLeft
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-10 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
        משהו לא ברור או לא מתנהג כמו שציפיתם? עדיף לשאול מאשר לנחש.
      </p>
    </div>
  </AdminLayout>
);

export default AdminGuide;
