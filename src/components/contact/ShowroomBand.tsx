import { useEffect, useState } from "react";
import { Clock, MapPin, Navigation } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { SITE } from "@/config/site";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Opening hours, minutes from midnight, indexed by JS weekday (0 = Sunday).
   Source: the FurnitureStore JSON-LD on the home page — Sun–Thu 08:30–18:00,
   Fri 08:30–12:00. Saturday carries no entry there, so it reads as closed.
--------------------------------------------------------------------------- */
const WEEK: ({ open: number; close: number } | null)[] = [
  { open: 510, close: 1080 }, // ראשון
  { open: 510, close: 1080 }, // שני
  { open: 510, close: 1080 }, // שלישי
  { open: 510, close: 1080 }, // רביעי
  { open: 510, close: 1080 }, // חמישי
  { open: 510, close: 720 }, // שישי
  null, // שבת
];

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const EN_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Rows as the client states them, each mapped to the weekdays it covers. */
const rows: { label: string; value: string; ltr: boolean; days: number[] }[] = [
  { label: "ראשון – חמישי", value: "08:30 – 18:00", ltr: true, days: [0, 1, 2, 3, 4] },
  { label: "שישי", value: "08:30 – 12:00", ltr: true, days: [5] },
  { label: "שבת", value: "סגור", ltr: false, days: [6] },
];

const hhmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/**
 * "Now" as the showroom experiences it. The visitor may sit in another time
 * zone, so the clock is read in Asia/Jerusalem rather than off the local Date.
 */
const israelNow = () => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jerusalem",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    const day = EN_DAYS.indexOf(get("weekday"));
    // hour12:false yields "24" for midnight in some engines — fold it back to 0.
    const minutes = (Number(get("hour")) % 24) * 60 + Number(get("minute"));
    if (day === -1 || Number.isNaN(minutes)) throw new Error("unparsable");
    return { day, minutes };
  } catch {
    const d = new Date();
    return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
  }
};

type Status = { open: boolean; day: number; label: string; detail: string; time: string };

const readStatus = (): Status => {
  const { day, minutes } = israelNow();
  const today = WEEK[day];

  if (today && minutes >= today.open && minutes < today.close) {
    return { open: true, day, label: "פתוח עכשיו", detail: "סוגרים היום ב־", time: hhmm(today.close) };
  }

  for (let i = 0; i < 7; i++) {
    const next = (day + i) % 7;
    const slot = WEEK[next];
    if (!slot) continue;
    // Today's slot has already passed — the next opening is on a later day.
    if (i === 0 && minutes >= slot.open) continue;
    const when = i === 0 ? "היום" : i === 1 ? "מחר" : `ביום ${DAY_NAMES[next]}`;
    return { open: false, day, label: "סגור כעת", detail: `נפתח ${when} ב־`, time: hhmm(slot.open) };
  }

  return { open: false, day, label: "סגור כעת", detail: "", time: "" };
};

const mapsQuery = encodeURIComponent(`${SITE.address.street} ${SITE.address.city}`);
const GOOGLE_MAPS = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
const WAZE = `https://waze.com/ul?q=${mapsQuery}&navigate=yes`;

const navPill =
  "inline-flex items-center gap-2.5 rounded-[10px] border border-background/30 px-5 py-3 text-[18px] text-background/90 transition-all duration-300 hover:bg-background/10 hover:border-background/60 hover:-translate-y-0.5";

/**
 * The one dark band on the page.
 *
 * Left of the split composition above, everything is a message you send. Here
 * the direction reverses: this is the invitation to come to us, so the surface
 * flips to charcoal and the hours stop being fine print — they become a live
 * card that knows whether the showroom is open right now.
 */
const ShowroomBand = () => {
  const [status, setStatus] = useState<Status>(readStatus);

  // A minute is plenty: the card only ever crosses one boundary at a time.
  useEffect(() => {
    const id = window.setInterval(() => setStatus(readStatus()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      id="showroom"
      dir="rtl"
      className="scroll-mt-28 bg-foreground text-background py-20 md:py-28"
    >
      <div className="container-luxury">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center max-w-6xl mx-auto">
          {/* Invitation — right column in RTL */}
          <Reveal className="order-1 min-w-0">
            <SectionHeading
              light
              align="start"
              subtitle="באולם התצוגה שביציץ אפשר לגעת בבדים, לשבת על המערכות ולראות איך הפרופורציות עובדות באמת. הביקור בתיאום מראש, כדי שנוכל להקדיש לכם את כל הזמן שצריך."
            >
              בואו לראות מקרוב
            </SectionHeading>

            <div className="mt-8 flex items-start gap-3.5">
              <MapPin className="w-6 h-6 shrink-0 text-primary mt-1" aria-hidden="true" />
              <div>
                <p className="font-display font-normal text-[22px] leading-snug text-background">
                  {SITE.address.full}
                </p>
                <p className="text-[18px] leading-snug text-background/70 mt-1.5">
                  ביקור בתיאום מראש
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href={WAZE} target="_blank" rel="noopener noreferrer" className={navPill}>
                <Navigation className="w-5 h-5" aria-hidden="true" />
                ניווט ב־Waze
              </a>
              <a href={GOOGLE_MAPS} target="_blank" rel="noopener noreferrer" className={navPill}>
                <MapPin className="w-5 h-5" aria-hidden="true" />
                פתיחה ב־Google Maps
              </a>
            </div>
          </Reveal>

          {/* Hours — left column */}
          <Reveal delay={120} className="order-2 min-w-0">
            <div className="rounded-[14px] border border-background/15 bg-background/[0.06] p-6 md:p-8 shadow-luxury">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" aria-hidden="true" />
                <h3 className="font-display font-normal text-[22px] leading-snug text-background">
                  שעות פעילות
                </h3>
              </div>
              <div className="w-20 h-[2px] bg-background/40 mt-5" aria-hidden="true" />

              <div
                className={cn(
                  "mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[10px] border px-4 py-2.5 text-[18px]",
                  status.open
                    ? "border-[#25D366]/45 bg-[#25D366]/10 text-background"
                    : "border-background/25 bg-background/[0.06] text-background/85",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    status.open ? "bg-[#25D366] animate-pulse motion-reduce:animate-none" : "bg-background/45",
                  )}
                />
                <span className="font-medium">{status.label}</span>
                {status.time && (
                  <span className="text-background/70">
                    {status.detail}
                    <bdi dir="ltr">{status.time}</bdi>
                  </span>
                )}
              </div>

              <ul className="mt-6 space-y-2">
                {rows.map((row) => {
                  const isToday = row.days.includes(status.day);
                  return (
                    <li
                      key={row.label}
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 rounded-[10px] px-4 py-3 text-[18px] transition-colors duration-300",
                        isToday ? "bg-background/10 text-background" : "text-background/70",
                      )}
                    >
                      <span className="flex items-center gap-2.5 whitespace-nowrap">
                        {row.label}
                        {isToday && (
                          <span className="rounded-full bg-primary px-2.5 py-0.5 text-[18px] leading-snug text-primary-foreground">
                            היום
                          </span>
                        )}
                      </span>
                      <span className="whitespace-nowrap" dir={row.ltr ? "ltr" : undefined}>
                        {row.value}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-6 pt-5 border-t border-background/15 text-[18px] leading-relaxed text-background/70">
                ניתן להגיע לאולם התצוגה בתיאום מראש, בטלפון{" "}
                <a href={`tel:${SITE.phone.tel}`} className="link-underline text-background" dir="ltr">
                  {SITE.phone.display}
                </a>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default ShowroomBand;
