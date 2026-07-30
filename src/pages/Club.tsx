import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ClipboardCheck,
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ShineButton from "@/components/ui/shine-button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import alumaLogo from "@/assets/aluma-logo.png";

/**
 * Club — the membership page.
 *
 * Presentation only was rewritten; every route the old page reached is kept:
 * /club/auth?mode=signup (join), /club/auth (sign in), /club/dashboard (member
 * area), and the page still reads live membership state from useAuth so a
 * signed-in visitor is greeted rather than sold to. Every block that changes
 * with that state is held behind <AuthGate> until the session resolves.
 *
 * Structure runs on one strong contrast beat, the way the home screen does:
 * warm-white explanation → a single charcoal band carrying the four benefits as
 * a hairline-separated ledger row → sand-beige joining spine → warm-white close.
 * The page's signature object is the charcoal member card at the top of the
 * membership column: the club rendered as the physical thing you would hold,
 * carrying the signed-in member's own name.
 *
 * Vertical rhythm is one scale, `py-14 md:py-20`, on every band — the colour
 * change at each seam is what separates the sections, so the padding only has
 * to hold content off the edge rather than announce the break. Blocks keep
 * their own air; the space that isn't there is the empty screen between them.
 * Matches the density the Blog page runs at.
 */

const perks = [
  {
    icon: ClipboardCheck,
    title: "מעקב פרויקט חי",
    text: "צפו בסטטוס ההזמנה, אבני דרך והתקדמות בזמן אמת, בלי להרים טלפון.",
  },
  {
    icon: Heart,
    title: "מועדפים חכמים",
    text: "סמנו קולקציות, בדים וקונפיגורציות. הכל נשמר ומסונכרן בין המכשירים.",
  },
  {
    icon: Sparkles,
    title: "גישה מוקדמת",
    text: "קולקציות חדשות, גוונים בלעדיים והזמנות לאירועי לונץ׳ פרטיים, לפני כולם.",
  },
  {
    icon: ShieldCheck,
    title: "שירות VIP אישי",
    text: "מעצב מלווה, היסטוריית תקשורת מסודרת ותיעדוף בבקשות שירות ותחזוקה.",
  },
];

const steps = [
  { n: "01", title: "הרשמה", text: "דקה אחת, שם, מייל וטלפון. בלי טפסים ארוכים." },
  { n: "02", title: "אימות מהיר", text: "מאמתים את החשבון ומעצבים את הפרופיל האישי שלכם." },
  { n: "03", title: "עולם שלם נפתח", text: "מועדפים, מעקב פרויקט, הטבות והזמנות פרטיות." },
];

/** The quiet promises the club already makes, stated plainly. */
const terms = [
  "הצטרפות חינם, בלי התחייבות",
  "אפשר לצאת בכל רגע",
  "בלי ספאם ובלי מכירת נתונים",
];

const perkVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut", delay: i * 0.09 },
  }),
};

/**
 * Everything that depends on who is signed in waits behind this and fades in
 * together once the session resolves. Gating only the button while the copy
 * around it flipped would have flashed just as loudly, so the whole
 * state-dependent block is held back.
 *
 * `invisible` rather than a bare `opacity-0`: visibility:hidden keeps the held
 * copy out of the tab order and out of the accessibility tree, so nobody can
 * tab into "הצטרפו למועדון" while it is still unknown whether they are already
 * a member. Layout space is still reserved, so nothing jumps on reveal.
 */
const AuthGate = ({
  loading,
  className,
  children,
}: {
  loading: boolean;
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      "transition-opacity duration-300",
      loading ? "invisible opacity-0" : "opacity-100",
      className,
    )}
  >
    {children}
  </div>
);

const Club = () => {
  const { user, loading } = useAuth();
  const reduceMotion = useReducedMotion();

  /* The name the member card carries. Signed in: the full name the member gave
     at signup (auth metadata), falling back to their email prefix while the
     profile has no name yet. Signed out: a plain placeholder — the card shows
     visitors the object they would be holding. */
  const fullName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";
  const cardName = (user && (fullName || user.email?.split("@")[0])) || "השם שלכם";

  /* Both faces of the primary call to action. Alignment follows the block it is
     dropped into: start (= right, in RTL) inside the right-aligned membership
     panel, centred in the closing band. */
  const cta = (align: "start" | "center") => (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center" : "items-start",
      )}
    >
      {user ? (
        <ShineButton to="/club/dashboard">
          לאזור האישי
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        </ShineButton>
      ) : (
        <>
          <ShineButton to="/club/auth?mode=signup">
            הצטרפו למועדון
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </ShineButton>
          <Link
            to="/club/auth"
            className="link-underline text-[18px] text-foreground-soft hover:text-accent transition-smooth"
          >
            כבר חברים? התחברות
          </Link>
        </>
      )}
    </div>
  );

  return (
    <Layout>
      <SEO
        title="מועדון אלומה | Aluma Club"
        description="הצטרפו למועדון הלקוחות של Aluma, מעקב הזמנה, מועדפים, גישה מוקדמת לקולקציות והטבות בלעדיות."
        path="/club"
      />

      <PageHero
        title="מועדון אלומה"
        subtitle="עולם שקט של שירות, שנתפר במידה שלכם."
      />

      {/* ── 1. What the club is — copy on the right, membership panel on the left ──
          Opens tight under the hero: the hero band is the same warm white as this
          section, so a generous top padding here would read as one continuous
          empty screen rather than as breathing room. */}
      <section className="pt-8 pb-14 md:pt-10 md:pb-20 bg-background">
        <div className="container-luxury">
          {/* 7xl rather than a narrower cap: the grid then measures to the
              container on every screen a visitor actually has, and only
              ultra-wide displays ever see the cap engage. */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-7xl mx-auto">
            {/* RTL: first child sits at the right edge */}
            <Reveal className="lg:col-span-7">
              <div className="text-right">
                <h2 className="font-display font-bold text-[30px] leading-snug text-primary">
                  מה זה מועדון אלומה
                </h2>
                <div className="w-20 h-[2px] bg-primary/55 mt-5" aria-hidden="true" />

                <p className="text-[20px] leading-relaxed text-foreground mt-6 text-pretty">
                  מועדון אלומה הוא לא תוכנית נקודות. זו דלת אחורית לעולם של מעצבים,
                  קולקציות מוקדמות ושירות אישי, למי שרואה את החוץ של הבית כמו את הפנים.
                </p>
                <p className="text-[20px] leading-relaxed text-foreground-soft mt-5 text-pretty">
                  החברות במועדון אלומה חינמית לחלוטין ואישית, לא נשלח לכם ספאם,
                  לא נמכור את הנתונים ולא נציק לכם בטלפון.
                </p>
              </div>
            </Reveal>

            <div className="lg:col-span-5">
              {/* THE MEMBER CARD — the club's signature object: the membership
                  rendered as a physical charcoal card, resting above the
                  paperwork that issues it. It is not a link, and it is the one
                  deliberate exception to the "only clickables react" rule
                  below: the object is meant to feel pick-up-able, so under the
                  pointer it tips a degree in perspective and its shadow
                  deepens, the way a card lifts off a desk. */}
              <Reveal delay={120}>
                <div className="mx-auto lg:ms-0 w-full max-w-sm aspect-[8/5] relative grain overflow-hidden rounded-[14px] bg-foreground shadow-soft transition-[transform,box-shadow] duration-500 ease-out hover:shadow-luxury motion-safe:hover:[transform:perspective(1000px)_rotateX(2deg)_rotate(-1deg)]">
                  {/* Diagonal sheen — one soft band of light across the face,
                      the way lacquer catches a window. Pure gradient, no
                      animation: the grain supplies the texture, this supplies
                      the depth. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(115deg,transparent_38%,rgba(255,255,255,0.09)_50%,transparent_64%)]"
                  />

                  <div className="relative flex h-full flex-col justify-between p-6 sm:p-7 text-right">
                    {/* Decorative here: the brand is named by the meta line
                        right below on the same card. */}
                    <img
                      src={alumaLogo}
                      alt=""
                      aria-hidden="true"
                      className="h-7 w-auto self-start brightness-0 invert opacity-95"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Held behind the gate so a signed-in member never sees
                        the placeholder name flash before the session resolves. */}
                    <AuthGate loading={loading}>
                      <p className="text-meta tracking-wider text-background/60">
                        מועדון אלומה
                      </p>
                      <p className="mt-1 font-display text-card text-background">
                        {/* bdi: the fallback name is a Latin email prefix, and
                            full names can mix scripts — isolate the run so it
                            never drags the line's RTL order around. */}
                        <bdi>{cardName}</bdi>
                      </p>
                    </AuthGate>
                  </div>
                </div>
              </Reveal>

              <Reveal className="mt-6" delay={220}>
                {/* No hover state: the panel is a container, not a link, and the
                    house rule is that only things you can click react to the
                    pointer. Padding tops out at p-8 — this is the tallest thing
                    in the row, so every millimetre it carries is a millimetre of
                    empty column the copy beside it gets centred against. It eases
                    back to p-6 on narrow screens so the fixed-width ShineButton
                    never overflows it at 375px. */}
                <div className="rounded-[14px] border border-border bg-secondary/50 shadow-soft p-6 sm:p-7 md:p-8 text-right">
                  <img
                    src={alumaLogo}
                    alt="Aluma"
                    className="h-10 w-auto opacity-90"
                    loading="lazy"
                    decoding="async"
                  />

                  <AuthGate loading={loading} className="mt-5">
                    <h3 className="font-display font-normal text-[22px] text-foreground">
                      {user ? "אתם כבר בפנים" : "החברות פתוחה, ובחינם"}
                    </h3>

                    {user ? (
                      <>
                        <p className="text-[18px] text-foreground-soft leading-relaxed mt-3">
                          החשבון מחובר. כל מה שסימנתם ועקבתם אחריו מחכה באזור האישי שלכם.
                        </p>
                        {user.email && (
                          // Latin text, so it reads LTR — but still parked on the
                          // right edge with the rest of the panel.
                          <p
                            dir="ltr"
                            className="text-[18px] text-foreground mt-4 pt-4 border-t border-border/70 text-right break-all"
                          >
                            {user.email}
                          </p>
                        )}
                      </>
                    ) : (
                      <ul className="mt-5 space-y-3">
                        {terms.map((t) => (
                          <li
                            key={t}
                            className="flex items-start gap-3 border-t border-border/70 pt-3 first:border-t-0 first:pt-0"
                          >
                            <Check
                              className="w-[18px] h-[18px] mt-1.5 shrink-0 text-primary"
                              strokeWidth={2.5}
                              aria-hidden="true"
                            />
                            <span className="text-[18px] leading-relaxed text-foreground">
                              {t}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-7">{cta("start")}</div>
                  </AuthGate>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. The one dark band: benefits as a hairline-separated ledger row ── */}
      <section className="relative grain py-14 md:py-20 bg-foreground text-background">
        <div className="container-luxury">
          <Reveal className="flex flex-col items-center mb-10 md:mb-14">
            <SectionHeading
              light
              align="center"
              subtitle="ארבע הטבות שנבנו סביב איך שלקוחות אלומה באמת עובדים איתנו, מהרגע שבחרתם דגם ועד שנים אחרי המסירה."
            >
              מה מקבלים כשמצטרפים
            </SectionHeading>
          </Reveal>

          {/* Below lg the row breaks into a plain grid with real gaps; at lg the
              gap collapses and the separation is carried by hairlines instead.
              Runs to the container (7xl): four columns of short text is the one
              block on the page that gets straightforwardly better with width,
              since every extra pixel lands in the copy rather than in margins. */}
          <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0 max-w-7xl mx-auto">
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <motion.li
                  key={perk.title}
                  custom={i}
                  variants={perkVariants}
                  initial={reduceMotion ? "show" : "hidden"}
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  // RTL: border-s puts the hairline on each item's RIGHT edge,
                  // so skipping it on the first item keeps the line between
                  // columns only. Outer padding is trimmed so the row still
                  // measures to the container.
                  className={`text-right lg:px-8 lg:first:ps-0 lg:last:pe-0 ${
                    i > 0 ? "lg:border-s lg:border-background/20" : ""
                  }`}
                >
                  {/* Reading matter, not a card — nothing here is clickable, so
                      nothing here reacts to the pointer. */}
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-[14px] border border-background/20 bg-background/10 text-background">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </span>

                  <h3 className="font-display font-normal text-[22px] text-background mt-5 leading-snug">
                    {perk.title}
                  </h3>
                  <p className="text-[20px] leading-relaxed text-background/75 mt-3 text-pretty">
                    {perk.text}
                  </p>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── 3. Joining — a numbered spine, with the pitch alongside it ── */}
      <section className="py-14 md:py-20 bg-secondary">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start max-w-7xl mx-auto">
            <Reveal className="lg:col-span-5">
              <div className="text-right">
                {/* Charcoal, not terracotta: this heading sits on sand beige. */}
                <SectionHeading tone="charcoal" align="start">
                  שלוש דקות, בלי טפסים ובלי התחייבות
                </SectionHeading>
                <div className="w-20 h-[2px] bg-primary/55 mt-5" aria-hidden="true" />

                <p className="text-[20px] leading-relaxed text-foreground mt-6 text-pretty">
                  ההרשמה נעשית פעם אחת, ומשם החשבון פשוט זוכר אתכם, את מה שאהבתם
                  ואת הפרויקט שפתחתם איתנו.
                </p>

                {!user && (
                  <AuthGate loading={loading} className="mt-7">
                    <ShineButton to="/club/auth?mode=signup">
                      להצטרפות מיידית
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    </ShineButton>
                  </AuthGate>
                )}
              </div>
            </Reveal>

            <Reveal className="lg:col-span-7" delay={120}>
              {/* Block-level with a max-width: in RTL it settles against the
                  right (start) edge of its column on its own. 2xl rather than
                  anything narrower — each step is one line at any of these
                  widths, so a tighter cap would only be trimming bare sand off
                  the left of the column.
                  role="list" is not redundant — Tailwind's preflight sets
                  list-style:none, which makes VoiceOver drop list semantics
                  entirely, and the visible 01/02/03 is aria-hidden, so this is
                  what carries the ordering to a screen reader. */}
              <ol role="list" className="max-w-2xl">
                {steps.map((step, i) => (
                  <li key={step.n} className="flex gap-6 md:gap-8">
                    {/* Badge column, right in RTL, with the spine dropping to the next step.
                        The numeral is decorative — the <ol> already announces the order,
                        so reading "01" out loud on top of it would just double up. */}
                    <div className="flex flex-col items-center shrink-0">
                      <span
                        aria-hidden="true"
                        className="grid place-items-center w-14 h-14 rounded-full border border-primary/45 bg-background font-display text-[22px] leading-none tabular-nums text-primary shadow-soft"
                      >
                        {step.n}
                      </span>
                      {i < steps.length - 1 && (
                        <span
                          className="w-px flex-1 min-h-[36px] bg-primary/30 mt-3"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className={`text-right pt-2.5 ${i < steps.length - 1 ? "pb-8" : ""}`}>
                      <h3 className="font-display font-normal text-[22px] text-foreground leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-[20px] leading-relaxed text-foreground-soft mt-2 text-pretty">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 4. Close ── */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container-luxury">
          <Reveal>
            <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
              {/* Purely decorative here: the brand is already named by the
                  header and the heading right below, so an alt would only make
                  a screen reader say "Aluma" a third time. */}
              <img
                src={alumaLogo}
                alt=""
                aria-hidden="true"
                className="h-12 w-auto opacity-90"
                loading="lazy"
                decoding="async"
              />

              <AuthGate loading={loading} className="mt-6 flex flex-col items-center">
                <SectionHeading
                  align="center"
                  subtitle={
                    user
                      ? "אזור החברים שלכם מחכה, מועדפים, סטטוסים והזמנות במקום אחד."
                      : "הצטרפות חינם, בלי התחייבות. בכל רגע אפשר לצאת."
                  }
                >
                  {user ? "טוב לראות אתכם שוב." : "הבית שלכם ראוי לזה."}
                </SectionHeading>

                <div className="mt-7">{cta("center")}</div>
              </AuthGate>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default Club;
