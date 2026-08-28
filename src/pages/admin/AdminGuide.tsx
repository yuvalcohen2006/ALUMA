import { Link } from "react-router-dom";
import {
  FileText,
  FolderOpen,
  HelpCircle,
  Image as ImageIcon,
  MessageSquareQuote,
  Palette,
  Users,
} from "lucide-react";

type Task = {
  icon: typeof FileText;
  title: string;
  what: string;
  steps: string[];
  to: string;
  cta: string;
};

/**
 * The landing screen for /admin.
 *
 * The client asked that opening the admin gives "a full quick guide on how to
 * use things, what to click in order to edit texts, photos or anything else".
 * So this is not a dashboard of numbers — it is a set of instructions, one per
 * job someone might arrive wanting to do, each ending in the button that
 * starts it.
 *
 * Written for somebody who has never seen a CMS: no jargon, every step is a
 * thing you can see on screen, and each card says what the visitor will end up
 * seeing on the public site.
 */
const TASKS: Task[] = [
  {
    icon: FolderOpen,
    title: "להוסיף מוצר",
    what: "מוצר חדש יופיע בעמוד הקולקציות, ואם הוא מהראשונים — גם בדף הבית.",
    steps: [
      'נכנסים ל"קולקציות" בתפריט הימני.',
      "בוחרים את הקולקציה שאליה שייך המוצר, או יוצרים קולקציה חדשה.",
      'לוחצים "מוצר חדש", ממלאים שם ותיאור קצר.',
      "מעלים תמונה ראשית — זו התמונה שתופיע ברשימה.",
      "אפשר להעלות עוד תמונות לגלריה של עמוד המוצר.",
      'מסמנים "מפורסם" ושומרים.',
    ],
    to: "/admin/collections",
    cta: "לניהול הקולקציות",
  },
  {
    icon: Palette,
    title: "להוסיף צבעים למוצר (עם תמונה לכל צבע)",
    what: "בעמוד המוצר יופיעו עיגולי צבע. לחיצה על צבע מחליפה את התמונה של המוצר.",
    steps: [
      'נכנסים ל"קולקציות", ופותחים את המוצר.',
      'בתחתית העמוד יש אזור "גימורים".',
      'לוחצים "גימור חדש", כותבים את שם הצבע (למשל "חול").',
      "בוחרים את גוון העיגול, ומעלים תמונה של המוצר בצבע הזה.",
      "חוזרים על זה לכל צבע. הסדר נקבע לפי מספר הסדר.",
    ],
    to: "/admin/collections",
    cta: "לניהול הקולקציות",
  },
  {
    icon: ImageIcon,
    title: "להוסיף פרויקט",
    what: 'הפרויקטים מופיעים בעמוד "פרויקטים" ושלושה מהם בדף הבית.',
    steps: [
      'נכנסים ל"פרויקטים" בתפריט.',
      'לוחצים "פרויקט חדש".',
      "ממלאים שם, מיקום ותיאור קצר.",
      "מעלים תמונה ראשית ותמונות נוספות לגלריה.",
      'מסמנים "מפורסם" ושומרים.',
    ],
    to: "/admin/projects",
    cta: "לניהול הפרויקטים",
  },
  {
    icon: FileText,
    title: "לשנות טקסטים באתר",
    what: "כותרות ופסקאות בדף הבית ובעמודים הראשיים.",
    steps: [
      'נכנסים ל"טקסטים".',
      "כל שדה מסומן לפי המקום שבו הוא מופיע באתר.",
      'משנים את הטקסט ולוחצים "שמירה" ליד אותו שדה.',
      "אם תמחקו טקסט לגמרי, האתר יחזור לנוסח המקורי. אי אפשר לשבור כלום.",
    ],
    to: "/admin/texts",
    cta: "לעריכת הטקסטים",
  },
  {
    icon: HelpCircle,
    title: "לערוך שאלות ותשובות",
    what: 'השאלות בעמוד "שאלות ותשובות".',
    steps: [
      'נכנסים ל"שאלות ותשובות".',
      "עורכים שאלה או תשובה קיימת, או מוסיפים חדשה.",
      "הקטגוריה היא הכותרת שמעל קבוצת שאלות — אפשר להשתמש בקיימות או להמציא חדשה.",
      'שאלה בלי סימון "מפורסם" לא תופיע באתר.',
    ],
    to: "/admin/faqs",
    cta: "לעריכת השאלות",
  },
  {
    icon: MessageSquareQuote,
    title: "להוסיף המלצות לקוחות",
    what: "ההמלצות מופיעות בתחתית דף הבית. אין המלצות — הקטע פשוט לא מופיע.",
    steps: [
      'נכנסים ל"המלצות".',
      "מוסיפים ציטוט, שם הלקוח, ואיפה הפרויקט.",
      "חשוב: להוסיף רק המלצות אמיתיות שקיבלתם עליהן אישור.",
      'מסמנים "מפורסם" ושומרים.',
    ],
    to: "/admin/reviews",
    cta: "לניהול ההמלצות",
  },
  {
    icon: ImageIcon,
    title: "להחליף את התמונה הראשית",
    what: "התמונה הגדולה בראש דף הבית.",
    steps: [
      'נכנסים ל"תמונה ראשית".',
      "מעלים תמונה לרוחב למחשב, ותמונה לגובה לנייד.",
      "שומרים.",
    ],
    to: "/admin/hero",
    cta: "להחלפת התמונה",
  },
  {
    icon: Users,
    title: "לראות פניות מהאתר",
    what: "כל מי שמילא טופס יצירת קשר או השאיר פרטים.",
    steps: ['נכנסים ל"פניות" בתפריט.', "הרשימה מסודרת מהחדש לישן."],
    to: "/admin/leads",
    cta: "לפניות",
  },
];

const AdminGuide = () => (
  <div className="max-w-4xl">
    <h1 className="text-2xl font-semibold text-foreground">ברוכים הבאים לניהול האתר</h1>
    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
      כל מה שאפשר לשנות באתר נמצא כאן. בחרו למטה מה אתם רוצים לעשות — לכל משימה
      יש הסבר קצר וכפתור שלוקח אתכם ישר למקום הנכון. שינויים מופיעים באתר מיד
      אחרי שמירה (לפעמים צריך לרענן את העמוד).
    </p>

    <div className="mt-8 grid gap-5 sm:grid-cols-2">
      {TASKS.map((task) => (
        <section key={task.title} className="rounded-lg border border-border p-5">
          <div className="flex items-center gap-2.5">
            <task.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="font-medium text-foreground">{task.title}</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{task.what}</p>

          <ol className="mt-4 space-y-1.5 text-sm text-foreground/80">
            {task.steps.map((step, i) => (
              <li key={step} className="flex gap-2">
                <span className="text-muted-foreground tabular-nums">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <Link
            to={task.to}
            className="mt-4 inline-block text-sm text-primary underline underline-offset-4 hover:text-accent"
          >
            {task.cta} ←
          </Link>
        </section>
      ))}
    </div>

    <p className="mt-10 text-sm text-muted-foreground">
      משהו לא ברור או לא עובד? עדיף לשאול מאשר לנחש — שום דבר כאן לא נמחק לתמיד
      בלי לשאול אתכם קודם.
    </p>
  </div>
);

export default AdminGuide;
