import { SITE } from "@/config/site";

/* ---------------------------------------------------------------------------
   Opening hours, minutes from midnight, indexed by JS weekday (0 = Sunday).
   Source: the FurnitureStore JSON-LD on the home page — Sun–Thu 08:30–18:00,
   Fri 08:30–12:00. Saturday carries no entry there, so it reads as closed.

   Lives in its own module because both the Q&A rail and the structured data
   need the same answer to "are we open right now", and two copies of a clock
   drift.
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
export const rows: { label: string; value: string; ltr: boolean; days: number[] }[] = [
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

export type Status = {
  open: boolean;
  day: number;
  label: string;
  detail: string;
  time: string;
};

export const readStatus = (): Status => {
  const { day, minutes } = israelNow();
  const today = WEEK[day];

  if (today && minutes >= today.open && minutes < today.close) {
    return {
      open: true,
      day,
      label: "פתוח עכשיו",
      detail: "סוגרים היום ב־",
      time: hhmm(today.close),
    };
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
export const GOOGLE_MAPS = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
export const WAZE = `https://waze.com/ul?q=${mapsQuery}&navigate=yes`;
