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
            className="link-underline text-small text-foreground-soft hover:text-accent transition-smooth"
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

      {/* ── 1. The one dark band: benefits as a hairline-separated ledger row ──
          The hero closes tight (pb-4), which was fine when a white section
          followed it. A colour change needs air before it or the hero reads as
          clipped, and the margin shows the page's own background. */}
      <section className="mt-10 md:mt-16 py-14 md:py-20 bg-foreground text-background">
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
                  className={`text-start lg:px-8 lg:first:ps-0 lg:last:pe-0 ${
                    i > 0 ? "lg:border-s lg:border-background/20" : ""
                  }`}
                >
                  {/* Reading matter, not a card — nothing here is clickable, so
                      nothing here reacts to the pointer. */}
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-sm border border-background/20 bg-background/10 text-background">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </span>

                  <h3 className="font-display font-normal text-body text-background mt-5 leading-snug">
                    {perk.title}
                  </h3>
                  <p className="text-small leading-relaxed text-background/75 mt-3 text-pretty">
                    {perk.text}
                  </p>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── 2. Joining — a numbered spine, and the only ask on the page ── */}
      <section className="py-14 md:py-20 bg-secondary">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start max-w-7xl mx-auto">
            <Reveal className="lg:col-span-5">
              <div className="text-start">
                {/* Charcoal, not terracotta: this heading sits on sand beige. */}
                <SectionHeading tone="charcoal" align="start">
                  שלוש דקות, בלי טפסים ובלי התחייבות
                </SectionHeading>
                <div className="w-20 h-[2px] bg-foreground/15 mt-5" aria-hidden="true" />

                <p className="text-small leading-relaxed text-foreground-soft mt-6 text-pretty">
                  ההרשמה נעשית פעם אחת, ומשם החשבון פשוט זוכר אתכם, את מה שאהבתם
                  ואת הפרויקט שפתחתם איתנו.
                </p>

                {/* The promises sit next to the button rather than in a
                    panel of their own — they are what makes the click easy,
                    so they belong within a glance of it. */}
                {!user && (
                  <ul className="mt-7 space-y-3">
                    {terms.map((t) => (
                      <li key={t} className="flex items-start gap-3">
                        <Check
                          className="w-[18px] h-[18px] mt-1 shrink-0 text-primary"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        />
                        <span className="text-small leading-relaxed text-foreground">{t}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* The page's single call to action. It used to appear three
                    times over four sections, which read as nagging rather
                    than as an offer. */}
                <AuthGate loading={loading} className="mt-8">
                  {cta("start")}
                </AuthGate>
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
                        className="grid place-items-center w-12 h-12 rounded-full border border-foreground/15 bg-background font-display text-small text-foreground/50"
                      >
                        {step.n}
                      </span>
                      {i < steps.length - 1 && (
                        <span
                          className="w-px flex-1 min-h-[36px] bg-foreground/15 mt-3"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className={`text-start pt-2.5 ${i < steps.length - 1 ? "pb-8" : ""}`}>
                      <h3 className="font-display font-normal text-body text-foreground leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-small leading-relaxed text-foreground-soft mt-2 text-pretty">
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

    </Layout>
  );
};

export default Club;
