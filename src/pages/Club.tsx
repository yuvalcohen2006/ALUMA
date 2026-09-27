import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
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
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import DirectionalArrow from "@/components/DirectionalArrow";

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
 * the title → a single charcoal band carrying the four benefits as a
 * hairline-separated ledger row → a tinted band with the one call to join.
 *
 * Vertical rhythm is one scale, `py-14 md:py-20`, on every band — the colour
 * change at each seam is what separates the sections, so the padding only has
 * to hold content off the edge rather than announce the break. Blocks keep
 * their own air; the space that isn't there is the empty screen between them.
 * Matches the density the Blog page runs at.
 */

/** Icons and order live here; the words live in the catalogue. */
const PERKS = [
  { icon: ClipboardCheck, key: "tracking" },
  { icon: Heart, key: "favorites" },
  { icon: Sparkles, key: "early" },
  { icon: ShieldCheck, key: "vip" },
] as const;

const TERMS = ["free", "leave", "noSpam"] as const;

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
  const { t } = useTranslation("club");
  const { to } = useLocalizedPath();
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
        <ShineButton to={to("/club/dashboard")}>
          {t("dashboard")}
          <DirectionalArrow className="w-4 h-4" animate={false} />
        </ShineButton>
      ) : (
        <>
          {/* Joining happens in the club section of the home page, the same
              one-field sign-up visitors already use there. This went to the
              account sign-up screen, which answered with an error. */}
          <ShineButton to={`${to("/")}#club`}>
            {t("join")}
            <DirectionalArrow className="w-4 h-4" animate={false} />
          </ShineButton>
          <Link
            to={to("/club/auth")}
            className="link-underline text-small text-foreground-soft hover:text-accent transition-smooth"
          >
            {t("alreadyMember")}
          </Link>
        </>
      )}
    </div>
  );

  return (
    <Layout>
      <SEO
        title={t("seo.title")}
        description={t("seo.description")}
        path="/club"
      />

      <PageHero title={t("title")} />

      {/* ── 1. The one dark band: benefits as a hairline-separated ledger row ──
          It starts right where the hero ends, so the white under the title is
          the hero's own bottom padding, the same as the gap above it. */}
      <section className="py-14 md:py-20 bg-foreground text-background">
        <div className="container-luxury">
          <Reveal className="flex flex-col items-center mb-10 md:mb-14">
            <SectionHeading
              light
              align="center"
              subtitle={t("perksSubtitle")}
              subtitleClassName="lg:max-w-none lg:whitespace-nowrap"
            >
              {t("perksTitle")}
            </SectionHeading>
          </Reveal>

          {/* Below lg the row breaks into a plain grid with real gaps; at lg the
              gap collapses and the separation is carried by hairlines instead.
              Runs to the container (7xl): four columns of short text is the one
              block on the page that gets straightforwardly better with width,
              since every extra pixel lands in the copy rather than in margins. */}
          <ul role="list" className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0 max-w-7xl mx-auto">
            {PERKS.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <motion.li
                  key={perk.key}
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
                    {t(`perks.${perk.key}.title`)}
                  </h3>
                  <p className="text-small leading-relaxed text-background/75 mt-3 text-pretty">
                    {t(`perks.${perk.key}.desc`)}
                  </p>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── 2. Joining — the only ask on the page ── */}
      <section className="border-y border-border py-14 md:py-20 bg-secondary">
        <div className="container-luxury">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="text-start">
                {/* Charcoal, not terracotta: 3.1:1 on this band is under AA. */}
                <SectionHeading tone="charcoal" align="start" className="lg:whitespace-nowrap">
                  {t("joinTitle")}
                </SectionHeading>

                <p className="text-small leading-relaxed text-foreground-soft mt-6 text-pretty">
                  {t("joinBody")}</p>

                {/* The promises sit next to the button rather than in a
                    panel of their own — they are what makes the click easy,
                    so they belong within a glance of it. */}
                {!user && (
                  <ul role="list" className="mt-7 space-y-3">
                    {TERMS.map((term) => (
                      <li key={term} className="flex items-start gap-3">
                        <Check
                          className="w-[18px] h-[18px] mt-1 shrink-0 text-primary"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        />
                        <span className="text-small leading-relaxed text-foreground">{t(`terms.${term}`)}</span>
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

          </div>
        </div>
      </section>

    </Layout>
  );
};

export default Club;
