import { useEffect, useState } from "react";
import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { SITE } from "@/config/site";
import { cn } from "@/lib/utils";
import { GOOGLE_MAPS, WAZE, readStatus, rows, type Status } from "./showroomHours";

/**
 * The showroom, as a rail beside the questions rather than a band beneath them.
 *
 * This used to be a full-width charcoal section at the very bottom of the Q&A
 * page — which meant the two things a reader most often wants while reading the
 * answers (are you open, and where are you) were the two things they had to
 * scroll past everything to reach.
 *
 * As a sticky rail it stays with them the whole way down. The panel takes the
 * footer's own charcoal so the page ends on one continuous dark mass, broken
 * only by the 12px seam the home page uses between its tiles.
 *
 * The outer element carries the colour and stretches the full height of the
 * grid row, so the rail runs all the way to the footer; the inner element is
 * what actually sticks. One element cannot do both — a full-height box has
 * nowhere to travel.
 */
const ShowroomRail = () => {
  const [status, setStatus] = useState<Status>(readStatus);

  // A minute is plenty: the card only ever crosses one boundary at a time.
  useEffect(() => {
    const id = window.setInterval(() => setStatus(readStatus()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <aside className="rounded-[14px] bg-footer text-background">
      <div className="lg:sticky lg:top-28 p-6 md:p-7">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display font-semibold text-[22px] leading-snug text-background">
            אולם התצוגה
          </h2>
          <Clock className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        </div>
        <div className="mt-4 h-px bg-background/15" aria-hidden="true" />

        {/* Live status — the one thing worth knowing before you drive. */}
        <div
          className={cn(
            "mt-5 inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-[10px] border px-3.5 py-2.5 text-[16px]",
            status.open
              ? "border-[#25D366]/45 bg-[#25D366]/10 text-background"
              : "border-background/25 bg-background/[0.06] text-background/85",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              status.open
                ? "bg-[#25D366] animate-pulse motion-reduce:animate-none"
                : "bg-background/45",
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

        {/* Hours. Edge to edge so today reads as a band across the rail. */}
        <ul className="mt-5">
          {rows.map((row) => {
            const isToday = row.days.includes(status.day);
            return (
              <li
                key={row.label}
                className={cn(
                  "-mx-6 md:-mx-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-6 md:px-7 py-2.5 text-[16px] transition-colors duration-300",
                  isToday ? "bg-background/10 text-background" : "text-background/65",
                )}
              >
                <span className="flex items-center gap-2 whitespace-nowrap">
                  {row.label}
                  {isToday && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[13px] leading-snug text-primary-foreground">
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

        {/* Address */}
        <div className="mt-6 flex items-start gap-3 border-t border-background/15 pt-5">
          <MapPin className="mt-[3px] h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[17px] leading-snug text-background">{SITE.address.full}</p>
            <p className="mt-1 text-[15px] leading-snug text-background/60">ביקור בתיאום מראש</p>
          </div>
        </div>

        {/* Navigation — the quick way out to a map. */}
        <div className="mt-5 flex flex-col gap-2.5">
          <a
            href={WAZE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-[10px] border border-background/25 px-4 py-2.5 text-[16px] text-background/90 transition-colors duration-200 hover:border-background/60 hover:bg-background/10"
          >
            <Navigation className="h-[18px] w-[18px]" aria-hidden="true" />
            ניווט ב־Waze
          </a>
          <a
            href={GOOGLE_MAPS}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-[10px] border border-background/25 px-4 py-2.5 text-[16px] text-background/90 transition-colors duration-200 hover:border-background/60 hover:bg-background/10"
          >
            <MapPin className="h-[18px] w-[18px]" aria-hidden="true" />
            פתיחה ב־Google Maps
          </a>
          <a
            href={`tel:${SITE.phone.tel}`}
            className="inline-flex items-center gap-2.5 rounded-[10px] border border-background/25 px-4 py-2.5 text-[16px] text-background/90 transition-colors duration-200 hover:border-background/60 hover:bg-background/10"
          >
            <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
            <bdi dir="ltr">{SITE.phone.display}</bdi>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default ShowroomRail;
