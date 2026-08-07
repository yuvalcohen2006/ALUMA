# Aluma redesign — living execution sheet

> **If you are a Claude session picking this up: read `## STATUS SUMMARY` at the
> very bottom FIRST.** It tells you where things stand in one paragraph. Then
> read only the phase you're about to work on. Do not re-read the whole file.

---

## How to use this file

1. **Tick items as you finish them**: `- [ ]` → `- [x]`, and append the date +
   short commit ref, e.g. `- [x] Fix PageHero RTL (2026-07-31, a1b2c3d)`.
2. **Discoveries become new unchecked items** in the relevant phase. If you find
   a bug mid-phase that isn't yours to fix now, add it — don't leave it in your
   head.
3. **Before you end a session, rewrite `## STATUS SUMMARY`.** This is the
   contract that stops the next session re-deriving everything. It should say:
   what phase we're in, what just landed, what's next, what's blocked.
4. **Blocked on the human?** Add it to `## WAITING ON THE OWNER` and keep going
   on something else. Never sit idle waiting.
5. Owner-facing instructions live in **`docs/GUIDE.md`**, not here. This file is
   for the build; that file is for the human.

**Ground rules that apply to every phase** (agreed with the owner, don't
re-litigate):

- **One divider system, one radius, one type scale.** Every page must feel like
  the same site. (Phase 3 builds the system; everything after uses it.)
- **Logical CSS properties only** in new/touched code: `ms-/me-/ps-/pe-/
  text-start/inset-inline-*`. Physical `left/right/ml/mr/text-left` are how the
  RTL bugs got in. Use `rtl:` variants only for genuine exceptions: `translateX`
  animations, shadows with an x-offset, directional icons (`rtl:-scale-x-100`),
  and `scrollLeft` (which goes negative in RTL).
- **Light backgrounds get no glow.** Card chrome law: no chrome by default; at
  most `border: 1px rgba(0,0,0,0.08)` **XOR** `shadow: 0 2px 12px rgba(0,0,0,0.06)`.
  Hover = image `scale(1.03)` + title underline. **Never** shadow-on-hover.
- **Never publish invented customer content.** Placeholder reviews are fine on a
  preview URL, never on the real domain.

---

## PHASE 1 — Stabilise: branch, email, the two headline bugs ✅

- [x] Delete the remote branch `rebuild/launch-plan` (2026-07-31). Tip was
      `63634d5`; recoverable from GitHub for ~90 days if ever needed.
- [x] **RTL root fix** — `src/components/PageHero.tsx` `items-end` → `items-start`.
      In a *column* flex the cross axis is the inline axis, so under `dir="rtl"`
      `items-end` resolves to the LEFT. This one word pushed the title, its
      hairline rule and the filter button to the wrong side of **all 14
      interior pages**.
- [x] `src/components/ui/dialog.tsx` — `sm:text-left` → `sm:text-start`;
      `space-x-2` → `gap-2` (space-x needs `space-x-reverse` in RTL);
      close button `right-4` → `end-4` (it was overlapping RTL titles).
- [x] `src/components/AccessibilityWidget.tsx` — panel opened on the opposite
      side from its own trigger (`justify-start` = right in RTL, button on the
      left). Now `justify-end`, button `end-6`, dead `bottom-24` removed.
- [x] `src/components/Header.tsx` — mobile logo had `order-last`, flipping the
      brand mark to the left below `lg` while desktop kept it right. Now
      `me-auto` on the logo, hamburger takes the far edge.
- [x] **Homepage CSS root fix** — `.font-display` in `src/index.css` set
      `font-weight: 400`. Tailwind emits user utilities *after* its own, so this
      silently beat every `font-bold`/`font-medium`/`tracking-*` on the same
      element — **every section title on the site rendered at 400 instead of
      700**. Moved the rule into `@layer base`, where it still out-specifies the
      bare `h1`/`h2` element rules (0,1,0 vs 0,0,1) so headings look unchanged,
      but weight/tracking utilities now win.
- [x] `tailwind.config.ts` — `container.screens` listed only `2xl`, which
      **replaces** the default map rather than extending it, leaving the
      container with no max-width below 1400px (every 1280–1399px laptop ran
      edge-to-edge). All five breakpoints restored.
- [x] Undefined classes: `shadow-elegant` → `shadow-soft` (CookieConsent),
      `prose-luxury` removed (Accessibility) — both rendered nothing.
- [x] z-stack collision: cookie banner (z-60) covered the WhatsApp FAB (z-50)
      *and* shared its corner. Now FABs z-40 on opposite corners
      (WhatsApp `start-6`, a11y `end-6`), banner z-50 at `md:bottom-24`.
- [x] **All email → `outdooraluma@gmail.com`**: `src/config/site.ts` is the
      single source; the 6 hardcoded copies (`Footer` ×3, `Accessibility`,
      `Privacy`, `Index` JSON-LD, `Contact` SEO string) now read `SITE.email`.
      `public/llms.txt` updated too.
- [x] `docs/GUIDE.md` created — owner-facing manual setup + content upload +
      asset shopping list.
- [x] `docs/ROADMAP.md` created (this file).
- [ ] `npx supabase secrets set OWNER_EMAIL=outdooraluma@gmail.com` — **blocked**,
      needs the correct project ref (see WAITING ON THE OWNER #1). The edge
      functions already *default* to outdooraluma@gmail.com; the deployed secret
      currently overrides it to a personal address (`docs/SETUP.md:328`).
- [ ] End-to-end email test: submit the contact form → confirm arrival at
      outdooraluma@gmail.com. **Blocked** on the Resend key.

---

## PHASE 2 — Cleanup sweep ✅

- [x] Deleted `src/assets/story-sunlight-sofa.jpg` (referenced nowhere).
- [x] Deleted dead CSS: `scroll-nudge` keyframes + `.scroll-cue` (unused —
      `Hero.tsx` uses `animate-chevron-blink`), the `--cream` token and its
      Tailwind `cream` colour.
- [x] Deleted the two broken Lovable asset stubs — both pointed at
      `/__l5e/assets-v1/…` CDN paths that **404 in production**.
      - AR page: that was its `poster`; now empty (model-viewer handles it).
      - Fabric page: that was the *entire* base photo, so the page was showing
        six tinted rectangles floating over a broken-image icon. Replaced with a
        real sofa photo plus a large true-colour swatch and an honest line
        saying on-product previews come once the product photos exist. The six
        hand-positioned `mixBlendMode` rectangles are gone — they were calibrated
        to a photo that no longer exists.
- [x] Removed `/before-after` (page, component, data). Route kept as an in-app
      `<Navigate>` → `/projects`; pruned from `sitemap.xml`.
- [x] **Favourites removed** — button, hook, provider, both call sites, and the
      club-dashboard tab (keeping the tab would have left one that can never
      gain entries). DB table deliberately left in place.
- [x] **Demo-data fork inverted.** It used to discard live Supabase data in dev
      *unconditionally* unless `?live=1` was in the URL — meaning you could
      upload real products and keep seeing the 20 fake ones with nothing to
      explain why. Now live-first everywhere; placeholder catalogue and magazine
      are opt-in via `VITE_USE_DEMO_DATA=1`, documented in `.env.example`.
      ⚠️ **Side effect:** with no valid anon key in `.env`, `/collections` now
      renders *empty* instead of showing fake products. That is the honest
      signal — see WAITING ON THE OWNER #2.
- [x] `/auth` and `/account` are now `<Navigate>` aliases.
- [ ] ~~Mark testimonials `verified: false`~~ — **dropped deliberately.** Phase 5
      makes the band read `site_reviews` and fall back to the placeholders while
      that table is empty, so the DB *is* the switch. A flag nothing reads would
      be exactly the dead code this phase removes. The file already carries a
      prominent DO-NOT-SHIP banner.

---

## PHASE 3 — Design foundation ✅

- [x] `src/components/SectionRule.tsx` — the one divider system, plus tokens
      `--rule-on-light/-tinted/-dark` and `--rule-accent(-on-dark)` in
      `index.css`, and a `.section-pad` rhythm utility.
- [x] `SectionHeading` now draws a rule under **every** heading, not only those
      that happen to have a subtitle — which is why most of the home page showed
      no rule at all. The variant follows the heading rather than the call site
      (centred → 48×1px accent mark, start-aligned → full-width hairline) and
      the surface is inferred from the existing colour props, so the site can't
      drift back into a mix of bar styles. `divider={false}` still works as an
      escape hatch.
- [x] `PageHero`'s title-width rule now reads the same `--rule-accent` token
      instead of its own `bg-primary/50`, so there is one rule vocabulary.
- [ ] Move legacy `py-*` sections onto `.section-pad` as each page is rebuilt.
- [ ] Audit stray hardcoded radii / arbitrary `text-[..px]` and normalise.

<details><summary>Original spec (kept for reference)</summary>

- `src/components/SectionRule.tsx` — the one divider system:
      - **Hairline variant** (90% of uses): flex row, title at inline-start,
        optional "view all" at inline-end, `padding-block-end: 18px`,
        `border-block-end: 1px`, `margin-block-end: 48px` (28px mobile).
        Tone-mapped to the background it sits on:
        light `rgba(0,0,0,0.10)` · dark `rgba(255,255,255,0.14)` · sand `rgba(0,0,0,0.09)`.
        (0.08 disappears on cheap screens; 0.14+ on light starts to look like a table.)
      - **Accent variant** (centred hero titles only, ≤2 per page): **48×1px**,
        brand accent, 20px above / 32px below. Not 2px, not 4px — that's the
        theme-template look.
- Tokens in `index.css`: `--rule-on-light/-dark/-tinted`;
  `.section-pad { padding-block: clamp(56px, 9vw, 120px) }`.
- `SectionHeading.tsx` composes `SectionRule`; keep the old `divider` prop
  working so untouched pages don't regress.

</details>

**Deviation from the spec, and why:** the hairline shipped as a plain rule
rather than the flex "title + view all" row. The row belongs to the *heading*,
and `SectionHeading` already owns that layout — building it into the rule too
would have meant two components fighting over the same box. When a section
needs a trailing "view all" link, add it to `SectionHeading`, not here.

---

## PHASE 4 — i18n plumbing ✅ (switcher stays hidden)

- [x] Installed `i18next`, `react-i18next`, `i18next-browser-languagedetector`.
- [x] `src/i18n/index.ts` — both catalogues imported eagerly (a few KB each; an
      HTTP backend would add a round trip and a flash of raw keys to save
      nothing). **Language comes from the URL, not a detector** — `/en/…` is
      English, everything else Hebrew — so a shared link always opens in the
      language it was written in, and it matches what `index.html` reads.
- [x] `src/routes.tsx` — the public route table, extracted with **relative**
      paths and mounted twice in `App.tsx` under `LangShell` (`/en` first, or
      the Hebrew catch-all would swallow it). Admin stays outside the tree.
- [x] `index.html` — inline pre-mount script sets `lang`/`dir` for `/en`.
- [x] `SEO.tsx` — per-language canonical, `og:locale`, and hreflang
      `he-IL`/`en`/`x-default`, all gated on `SITE.enableEnglish` so crawlers
      aren't pointed at a half-translated tree.
- [x] `useLocalizedPath` / `localizePath` + `LanguageSwitcher` (globe + names in
      their own script, **no flags**, real `<a href>`, 44px hit area, links to
      the *same page* in the other language). Header and Footer migrated to
      `t()` + localised links; switcher slotted into both, gated off.
- [x] **34 tests passing**, including 21 that match the real route config: both
      trees resolve, `/enquiries` is not mistaken for English, the catch-all
      still fires, and no child path is absolute (an absolute one would silently
      make `/en` unreachable).

⚠️ **Known and intentional:** only Header, Footer and SEO speak `t()` so far.
Every other page still has hardcoded Hebrew and hardcoded `to="/…"` links, so
inside `/en` those links jump back to the Hebrew tree. That is exactly why
`SITE.enableEnglish` is `false` — nobody can reach `/en` in the UI. Phase 14
sweeps the rest and only then flips the flag.

---

## PHASE 5 — Homepage restructure ✅ (one item deferred)

**Shipped:** hero → **CategoryMosaic** → ConsultCTA → ReviewsBand → ClubCard →
footer. `AboutBrief`, `ProjectsGrid`, `CategoryIcons`, `Newsletter`,
`Testimonials`, `testimonials-column` and `MaterialsBrief` all deleted — every
one was orphaned by the new composition. Homepage JS fell from 226KB to 216KB
and the framer-motion rail is gone from the critical path.

- [x] **`CategoryMosaic`** — replaces a rail of eight square icons that squashed
      to ~73px each at 1024px, where the label wrapped to three lines and the
      furniture was unreadable. Tile widths are arranged so every desktop row
      sums to exactly four columns (2+1+1, 1+1+2, 2+2); rows align without
      masonry maths because grid items stretch to their row height, so the
      aspect ratios only set each tile's natural proportion. Label over the
      photo on a scrim, image (never the card) scales 1.04 on hover,
      reduced-motion respected, arrows flip with `ltr:-scale-x-100`.
- [x] **`ReviewsBand`** — 3 columns of plain typography on a tinted panel; no
      cards, stars, avatars or giant quote glyphs. Reads `site_reviews`, falls
      back to the flagged placeholders while empty.
- [x] **`site_reviews` migration** — RLS: public reads published rows only,
      admins read and write everything.
- [x] **`ClubCard`** — underline field, one input, 17px (16px is the iOS
      zoom-on-focus threshold and the zoom does not undo itself), arrow submit
      at `end-0`, inline success instead of a toast.
- [x] **`ConsultCTA`** — quiet band, honest copy: a person gets back to you.
- [ ] **Deferred: `/admin/reviews` CRUD screen.** The table and RLS exist and
      the band reads them, so reviews are enterable *today* via the Supabase
      Table Editor — `docs/GUIDE.md` has the click-by-click. A friendlier admin
      screen (clone `AdminBlog`) is the remaining nicety, not a blocker.
- [ ] **Category taxonomy needs reconciling.** The eight marketing categories
      (מערכות ישיבה, שולחנות אש, …) do not map onto the CMS collection slugs,
      so every tile currently links to the unfiltered `/collections`. Linking to
      `?cat=<unknown>` would land visitors on an *empty* results page, which is
      worse. Set each category's `cat` field in `CategoryMosaic.tsx` once the
      real collections exist.

<details><summary>Original spec (kept for reference)</summary>

Client's verdict: **categories are the product.** Order becomes hero →
categories → reviews → consultation CTA → club card → footer. Materials,
projects and the story brief all come off the homepage.

- [ ] **`CategoryMosaic.tsx`** — the star of the page. Deterministic two-tier
      grid: standard tiles `aspect-[4/5]`, feature tiles `col-span-2 aspect-[8/5]`.
      (Two 4:5 tiles + gap ≈ 8:5, so rows always align — no masonry, no gaps.)
      1 col mobile / 2 tablet / 4 desktop; gaps 12/16/24px; `max-w-[1440px]`.
      Label **over** the image on a bottom scrim
      `linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,.15) 35%, transparent 65%)`
      — label-over-image reads editorial/luxury, label-under reads retail.
      Hover: **image** scales 1.04 (never the card) 600ms
      `cubic-bezier(0.22,1,0.36,1)` + scrim deepens to .68;
      `prefers-reduced-motion` → opacity only. Labels via `inset-inline-start`,
      arrows `rtl:-scale-x-100`. Links to `/collections?cat=…`.
      Absorb the category list from `CategoryIcons.tsx`, then delete it.
- [ ] **`site_reviews` table + `/admin/reviews` screen** (clone the AdminBlog
      pattern). Non-technical staff must be able to enter reviews like any other
      content.
- [ ] **`ReviewsBand.tsx`** — 3-col quote band on a tinted panel `#F7F5F2`.
      **No cards, no stars, no avatars, no giant quotation marks** — that's the
      Shopify-reviews-app look. Quote 18px/1.65 (cap ~180 chars), 40×1px rule at
      `currentColor/20`, name 13px uppercase +0.08em, meta 13px/55%.
      Reads `site_reviews` live; falls back to the flagged placeholders while
      empty, so entering 3 real reviews swaps them automatically.
- [ ] **`ConsultCTA`** — slim band → `/consult`.
- [ ] **`ClubCard.tsx`** — rework of Newsletter to the underline-input pattern:
      transparent background, `border-block-end: 1px`, height 48px,
      **font-size 17px** (16px is the iOS zoom-on-focus threshold), arrow submit
      at `inset-inline-end` with `rtl:-scale-x-100`, centred `max-w-[520px]`,
      **one field only**, inline success state (not a toast). Keeps the existing
      `newsletter_subscribers` insert and its 23505-as-success handling.
- Recompose `Index.tsx`; delete `AboutBrief` + `ProjectsGrid`;
  `MaterialsBrief` dies in Phase 7. Apply `SectionRule` per background tone.
- Verify CLS < 0.1 — every mosaic image needs an explicit aspect box.

</details>

**Note on the "two 4:5 tiles + gap ≈ 8:5" claim in the spec:** it is only
approximate — with a 24px gap the wide tile is ~15px taller than two standard
ones. It does not matter, because grid items stretch to their row height by
default, so the row takes the max and every tile fills its cell. No masonry, no
manual row sizing.

**`MaterialsBrief` was deleted here, not in Phase 7** — the new composition
orphaned it immediately, and the Journal's materials strip is a different thing
entirely (small light square tiles, no glow). It is in git history if needed.

---

## PHASE 6 — About (`/story` → `/about`) ✅

- [x] `src/components/about/TeamPortraits.tsx` — the wordmark and the three line
      portraits extracted **verbatim first**, before anything was restructured
      around them. Still one bottom-edge 10px mask, no radial. Gained a caption
      naming עידן · רועי · בן in reading order (overlaying names on the drawings
      is fragile at every width).
- [x] `src/pages/About.tsx` in the researched order: hero statement over a
      furniture photo (not the team photo) → the letter → three alternating
      editorial chapters → three numbered values, no icons → craft teaser into
      the material pages → the portraits → proof numbers → dual CTA.
- [x] Route, in-app `<Navigate>`, and a real 301 in `public/_redirects` (which
      was previously just the SPA catch-all — all the 301s live above it now).
      `Story.tsx` deleted; sitemap, footer and 404 suggestions repointed.
- [x] Navbar reordered toward the client's target: home · collections ·
      build-your-own · projects · materials · magazine · Q&A · club · **about** ·
      contact. Materials + magazine merge into "שווה לדעת" in Phase 7.
- [x] 36 tests, including that `/about` resolves and `/story` still *matches*
      (rendering the redirect) rather than 404ing.

⚠️ **Two content holes, both deliberate and both flagged in `docs/GUIDE.md`:**
1. **The letter is the brand's own existing words, reformatted** — nothing is
   invented, but it's ~70 words against a 120–180 target and doesn't say why
   the business exists. Only the owner can write that.
2. **The proof-numbers band renders nothing** because `PROOF` is empty.
   Inventing "500 families" is the same category of lie as the fabricated
   reviews. It appears the moment three real figures are filled in.

Also unresolved and asked in the guide: whether Aluma is a family business and
whether Idan/Roy/Ben are the founders. Neither is claimed on the page.

<details><summary>Original spec (kept for reference)</summary>

- [ ] **Extract the preserved elements FIRST** into
      `src/components/about/TeamPortraits.tsx`, before restructuring anything:
      the logo (`aluma-logo.png`, h-58/77px) and the three line portraits
      (`story-portrait-idan/roy/-.png`, `w-1/3 aspect-square`,
      `mix-blend-multiply`, bottom-edge 10px `maskImage` fade).
      ⚠️ **Do not reintroduce a radial mask** — an earlier one clipped the
      drawing (see the comment at `Story.tsx:81`).
- [ ] New `About.tsx` in this order: hero statement (text over a *furniture*
      photo, **not** the team photo) → **first-person letter, 120–180 words,
      signed** → story as 3 alternating editorial splits anchored by years
      (**the splits ARE the timeline** — a literal timeline widget is a mobile
      liability) → 3–4 numbered values `01/02/03`, **no icons** (icon rows are
      the #1 tell of a template about page) → craft teaser linking to `/journal`
      → **TeamPortraits, full-bleed, with a caption naming people in order**
      (overlaying names on faces is fragile and RTL-hostile) → **exactly 3**
      proof numbers → CTA band.
- Route + 301 from `/story`; nav label "אודות"; delete `Story.tsx`.

</details>

**Deviation:** the chapters carry thematic labels (השם / הגישה / הייצור) rather
than years, because nobody has supplied any dates. Swap in years when they exist
— the layout already works as a timeline.

---

## PHASE 7 — "שווה לדעת" (`/journal`) ✅ — materials + magazine merged

- [x] `src/pages/Journal.tsx`, **light mode end to end**: PageHero → materials
      strip → filter chips → featured article (60/40, no card chrome) → 3-col
      feed at `aspect-[3/2]`.
- [x] **The materials strip sits ABOVE the feed, not inside it.** Materials are
      evergreen and articles are chronological; interleaved, the Sunbrella
      explainer sinks below the fold on the day a third article is published and
      never resurfaces. Small square tiles, exactly as asked.
- [x] **All three glow layers gone** — `MaterialBand.tsx` (the box-shadow
      backlight, the radial `wash`, and the blurred-photo interior ground) and
      `accent.ts` (which existed *only* to lift accent colours for the dark
      background) are deleted along with the old dark index. A coloured glow on
      white reads as a printing error.
- [x] Chips, not tabs — chips wrap and scroll on a phone. No "featured" post
      while a filter is active: promoting one out of a filtered set is arbitrary.
- [x] `MaterialDetail` needed no conversion — it was already light; only its
      back-link moved to `/journal`. **The detail pages stay live** as the
      strip's targets; only the index was retired.
- [x] Redirects at both layers, including the splat `/blog/* → /journal/:splat`
      (a `<Navigate>` can't interpolate a param, so `LegacyBlogPostRedirect`
      does it in-app). These are the site's most-linked URLs — dumping them all
      on the index would lose the article the visitor clicked.
- [x] Nav: חומרים + מגזין collapse into one **שווה לדעת** entry keeping the four
      material pages as its submenu. Footer, sitemap and 404 links repointed.
- [x] `Blog.tsx` (626 lines) and `Materials.tsx` deleted. 42 tests, including
      one asserting `/materials/:slug` is still reachable — if a redirect ever
      swallows it, every tile in the strip breaks.

<details><summary>Original spec (kept for reference)</summary>

Owner's brief: casual, understandable, hints that there's more depth behind what
you're buying. **Light mode.**

- [ ] `Journal.tsx`: header + filter chips (`?topic=` URLs so results are
      shareable) → **featured** newest article (60/40 split, no card chrome) →
      **materials strip** (4–6 small `aspect-square` tiles, persistent, above
      the feed) → article feed, 3-col, `aspect-[3/2]`, gaps 40/56px.
      > Why a separate strip rather than mixing: materials are evergreen,
      > articles are chronological. Interleaved, the teak explainer sinks below
      > the fold forever.
- [ ] Materials cards: **much smaller, square photos, zero glow.** Delete all
      three glow layers in `MaterialBand.tsx` (`glow()` box-shadow, the `wash`
      radial bleed, and the blurred-photo interior ground) and restyle
      `MaterialDetail.tsx` light to match.
- [ ] `BlogPost.tsx` → `JournalPost.tsx` at `/journal/:slug`.
- [ ] Redirects: `/materials`, `/blog` → `/journal`; **`/blog/* → /journal/:splat 301`**
      (must sit above the `/*` catch-all in `public/_redirects`).
      `/materials/:slug` **stays live** — it's the materials strip's target.
- Delete `Materials.tsx`, `Blog.tsx`, `MaterialsBrief.tsx`.
- Nav: drop חומרים + מגזין, add **שווה לדעת** (submenu = the 4 material pages).

</details>

**Deviations:** `BlogPost.tsx` was left where it is and simply mounted at
`/journal/:slug` rather than renamed — the rename is churn with no reader
benefit, and it keeps the diff readable. Filter chips hold state locally instead
of in `?topic=`; shareable filtered URLs are worth having, but the existing
`useFilterParams` hook is built around the drawer's multi-select model and
bending it to single-select chips was more risk than the feature is worth right
now. Noted as a small follow-up.

---

## PHASE 8 — Collections polish + Projects wiring ✅

- [ ] Collections: give each collection block a hero/support hierarchy — first
      product `aspect-[8/5]`, the rest `aspect-[4/5]` (same grid maths as the
      mosaic). `SectionRule` headers. Confirm `?cat=` is honoured (the mosaic and
      consult results both link that way).
- [ ] Projects: query **`site_projects`** with the static `src/data/projects.ts`
      as empty-table fallback. The table and its full admin CRUD already exist
      but **no public page reads them** — editing projects in the CMS currently
      changes nothing. Write a small mapper matching what AdminProjects writes.

---

## PHASE 9 — Navigation finalisation + redirect/sitemap sweep ✅

- [ ] Final navbar (RTL, right→left): **דף הבית · קולקציות · עשה זאת בעצמך ·
      פרויקטים · שווה לדעת · שאלות ותשובות · מועדון · אודות · צרו קשר** ·
      [switcher, still gated]. `/consult` is deliberately **not** in the main
      nav — it lives on the contact page, the homepage CTA and the footer.
- [ ] `public/_redirects`: full audited list, **all 301s above** `/* /index.html 200`.
- [ ] Regenerate `public/sitemap.xml` (currently stale: lists `/before-after`,
      missing `/club`, `/diy`, detail routes). Sanity-check robots.txt + llms.txt.

---

## PHASE 10 — Build-Your-Own restructure + honest consultation ✅

- [ ] DIY hub → **3 stations** (`/diy/scene`, `/diy/fabric`, `/diy/ar`); relayout
      the plank grid, which currently has 01 and 04 spanning two columns.
- [ ] **Wrap all station pages in `<Layout>`.** `SofaDesigner`, `FabricConfigurator`
      and `ARPreview` hand-roll their own Header/Footer and use the old
      `pt-32` / uppercase-eyebrow styling — they're visibly from an earlier era
      than the rest of the site.
- [ ] **Questionnaire → `/consult` ("ייעוץ אישי")**, moved OUT of Build-Your-Own
      (it was never a "build your own" thing) and reframed honestly as a
      lead-collector: *leave your details and a designer gets back to you with a
      tailored recommendation.*
      **Delete `recommendFor()`** — it recommends five collections
      (Pool / Soft Lines / Mediterranean / Skyline / Signature) that **do not
      exist anywhere in the codebase**, and ignores three of the fields it
      collects. Keep the `questionnaire_responses` insert and AdminLeads intact.
      Surface it from the Contact page and the homepage CTA. 301 from
      `/questionnaire`.
- [ ] AR page: move `model-viewer` from a runtime CDN `<script>` to an npm
      dependency; keep the honest "these are demo models" labelling.
- [ ] Fabric interim: a clean Sunbrella swatch explorer from `src/data/sunbrella.ts`
      — no broken base photo, no fake percentage rectangles.

---

## PHASE 11 — Scene builder v1 ✅ (v1 shipped; polish deferred)

**Shipped.** `/diy/scene` is a photographic scene builder. `SofaDesigner` is
deleted — its 1-D strip used raw HTML5 drag events, which don't fire on touch,
so the feature was desktop-only.

- [x] `src/lib/sceneGeometry.ts` + **18 tests** — the linear horizon model,
      clamps, depth sort, rotation snapping, shadow geometry. The tests pin
      linearity specifically, because an eased curve looks plausible and is
      wrong.
- [x] `src/components/scene/SceneCanvas.tsx` — 4 layers (backdrop / shadows /
      items / glaze+UI), ground-contact offsets, `dragBoundFunc` clamped to the
      floor band, `Konva.hitOnDragEnabled = true`, rotation-only transformer
      with `forceUpdate()` after attach, `crossOrigin` via `useImage(url,
      "anonymous")`, commit-on-dragend.
- [x] `src/pages/SceneBuilder.tsx` — backdrop picker, catalogue, variant chips,
      snapshot undo/redo in refs (50 cap), localStorage autosave, full keyboard
      map, screen-reader mirror list, WhatsApp summary CTA.
- [x] `sceneItems.ts` / `sceneBackdrops.ts` — **variants are an open list**, so
      a product with twenty fabrics needs data, not code.
- [x] Konva code-split: 284KB in its own chunk, main bundle unchanged at 216KB.

**Deferred from the spec, deliberately:**
- [ ] **Magnetic alignment guides.** Worth having, but they interact with the
      drag path and the drag path is the thing that must not break on touch.
      Add once the real cut-outs are in and the basics are confirmed on device.
- [ ] **PNG/JPEG export + Web Share.** `stageRef` is already plumbed through for
      it. Blocked in practice on real assets — exporting a shareable image of
      placeholder furniture is not worth shipping.
- [ ] **Sprite / Backdrop Calibrator admin tools.** Only three sprites and three
      backdrops exist; hand-authored numbers are fine at this size. Build these
      *before* the ~85 real sprites arrive, not after.
- [ ] **Foreground plate per backdrop** (so items can pass behind a near
      planter) — needs purpose-shot backdrops first.

⚠️ **Everything visible is a placeholder and says so in the UI.** The backdrops
are product photos that already contain furniture, which is exactly what a real
backdrop must not; their calibration numbers are eyeballed. Real plates come
with a 1-metre rod shot at three marked spots, which turns those numbers from
estimates into measurements. See `docs/GUIDE.md` Part 3.

<details><summary>Original spec (kept for reference)</summary>

**Model:** fixed, pre-calibrated backdrop photos; product sprites auto-scaled by
where they're placed, auto z-sorted, with soft contact shadows.
User-photo upload is explicitly **out of scope for v1** — reconstructing camera
pose from an arbitrary phone photo is what IKEA needed a computer-vision lab to
do, and a bad attempt looks broken.

- [ ] Install `konva` + `react-konva`; keep the route lazy (~150KB must stay out
      of the homepage bundle).
- [ ] **The core realism formula.** On-screen size is **linear in distance below
      the horizon** — this is real pinhole-camera geometry, not a fudge:
      ```
      pixelHeight = realHeightM × pxPerMetreAtRef × (yBase − yHorizon) / (yRef − yHorizon)
      ```
      Store per backdrop: `{yHorizon, yRef, pxPerMetreAtRef, placeablePolygon,
      glazeColor, lightDir}`. Clamp scale to [0.35, 1.9]; clamp dragging to the
      placeable polygon via `dragBoundFunc` (so nothing lands in the pool or the
      sky). **No free scaling** — scale is owned by ground position.
- [ ] **Ground-contact anchor per sprite**, set as Konva `offsetX/offsetY`, so
      `node.x/y` *is* the point where the item touches the floor and rotation
      pivots there. This single decision removes the float/sink, drag-offset and
      rotate-around-wrong-origin bug classes. **Highest-severity thing to get
      right.**
- [ ] **Never mirror sprites** — flipping a 3/4 product also flips its baked
      lighting, and Konva has known negative-scale transformer bugs. Ship
      separate left/right sprites.
- [ ] Z-order **derived, never user-managed**: sort by `yBase` ascending;
      `moveToTop()` during drag, re-sort on `dragend`.
- [ ] **Exactly 4 layers**: backdrop (cached once, `listening=false`) / shadows
      (`listening=false`) / items (the only interactive one) / UI. Do **not**
      `cache()` image nodes — it's a bitmap copy of a bitmap: double memory, and
      blurry when zoomed.
- [ ] Shadows: one pre-blurred radial PNG stretched per item —
      `radiusX = 0.46 × footprint`, `radiusY = 0.13 × footprint`, warm-black
      `rgba(20,18,14,0.30)` (pure black reads digital), offset 2–4px along the
      backdrop's light direction. **Never** `shadowBlur` on the product image —
      it shadows the alpha silhouette, which on a slatted lounger is a striped smear.
- [ ] Per-backdrop "scene glaze": full-canvas rect above the items in the
      backdrop's ambient colour, `soft-light`, **4–7% opacity**. Above 7% and
      products go muddy.
- [ ] Transformer: **rotation only** (`enabledAnchors={[]}`), 15° snap on Shift,
      hard snap within 3° of cardinals, `anchorSize: 22` for touch.
      Magnetic alignment guides at a 5px threshold **divided by stage scale**;
      precompute snap targets at `dragstart` (recomputing every frame is what
      makes snapping feel sticky).
- [ ] `Konva.hitOnDragEnabled = true` — without it touch events stop firing
      mid-drag on mobile. `touch-action: none` on the container.
- [ ] **No freeform pinch-zoom in v1** — fit-to-width plus Zoom in/out/Fit
      buttons. Removes ~40% of the gesture bug surface, and nobody pinch-zooms a
      patio scene.
- [ ] State: normalised document (`itemsById` + `itemOrder`, with a `version`
      field) / ephemeral interaction / viewport. Mutate Konva refs during drag,
      commit to React on `dragend` only (setState at 60Hz drops frames).
      **Undo/redo = state snapshots held in refs** (Konva's docs explicitly warn
      against serialisation-based undo), 50-step cap, coalesce repeated nudges
      within 500ms.
- [ ] Stable `key={item.id}` — array-index keys make items swap identities on
      z-reorder.
- [ ] Images: 600/1200/1800px AVIF+WebP picked by DPR × on-canvas size.
      **Set `crossOrigin` BEFORE `src`** (order matters; setting it after
      silently does nothing) or `toDataURL` throws a tainted-canvas error *only
      in production*. `await img.decode()` before first paint.
- [ ] Export: `stage.toBlob({pixelRatio: 2, mimeType: 'image/jpeg', quality: 0.92})`
      — PNG of a photographic scene at 2× is 6–12MB, JPEG is ~500KB and looks
      identical. Hide the UI layer first, add a branded footer bar, offer the
      Web Share API on mobile.
- [ ] A11y: a visually-hidden focusable list mirroring the items (canvas content
      isn't in the accessibility tree), canvas-drawn focus ring (2px white + 2px
      dark, works on any backdrop), arrow-key nudge, `[`/`]` rotate, `aria-live`
      announcements.
- [ ] **Internal tooling — build these, they pay for themselves**: a *Sprite
      Calibrator* (load PNG → click the ground-contact point → drag footprint
      width → save JSON) and a *Backdrop Calibrator* (drag the horizon line +
      a reference rod). Hand-authoring anchors for ~85 sprites in a spreadsheet
      will produce errors.
- [ ] `src/data/sceneItems.ts` — **unbounded `variants[]` per item**, so any
      number of colours/finishes works without a code change.
- [ ] Delete `SofaDesigner.tsx` once absorbed (its 4 sofa units become the first
      scene items; its 1-D strip and touch-less HTML5 drag do not survive).

</details>

**Regression tests still to write** (each is a bug this design is built to avoid):
anchor-not-at-ground-point · crossOrigin-after-src · per-frame snap recompute ·
array-index keys · two-finger touch during an item drag · dragmove→setState ·
`Konva.pixelRatio = 1` shipped · undo captured during drag · unclamped scale ·
backdrop swapped without re-calibration.

---

## PHASE 12 — AR (preview now, real models later)

- [ ] Keep `<model-viewer>`; **`ar-scale="fixed"` is mandatory** — the default
      lets users pinch-resize, which destroys the entire "will it fit?" value.
- [ ] `src/data/arModels.ts` manifest; models in a Supabase `ar-models` bucket,
      not the repo. AR-capability detection with a graceful desktop orbit fallback.
- [ ] Current models are **Khronos demo assets** (a generic sofa, chair, table)
      and 3 of the 4 have no `.usdz`, so **iOS Quick Look is broken for them**.
      Keep the honest labelling until real models land.
- [ ] Real assets = an owner purchase, spec'd in `docs/GUIDE.md` Part 3.4.
      **AI image-to-3D and phone scans are for reference only, never for
      customers** — they hallucinate the unseen back, fill wicker gaps solid, and
      produce proportional rather than metric scale.

---

## PHASE 13 — AI colour recolour pipeline (armed, awaiting photos)

- [ ] **Masked inpainting, never global img2img.** Global img2img at a denoise
      strength high enough to change a fabric also drifts the frame geometry and
      shadows — and you lose the "it's the same photo" claim that makes a swatch
      trustworthy.
      Pipeline: canonical capture → cushion mask authored **once per photo**
      (stored alpha PNG) → inpaint inside the mask only, prompt naming *only*
      the delta and explicitly locking folds/seams/weave/highlights/shadows →
      **composite the result back over the untouched original** with a 2–4px
      feather, so every pixel outside the mask is byte-identical → SSIM gate
      outside the mask (~0 or the job fails).
- [ ] Storage `recolor/masks/`, `recolor/variants/{photoId}/{fabricId}.webp`;
      `recolor_variants` table; `scripts/recolor.md` operator guide.
      **Generate lazily and cache** — the full matrix is 400+ images.
- [ ] `FabricVisualizer.tsx` replaces the interim explorer: photo + swatch strip,
      showing the cached variant or a "coming soon" state per swatch.
- [ ] Frame materials (teak / aluminium / rope) are **photographed, not
      recoloured** — they change silhouette and sheen.

---

## PHASE 14 — English completion + switcher launch

- [ ] Sweep the remaining legacy pages into `t()`: FAQ, Contact, Club,
      Auth/Account, legal pages, ThankYou, NotFound.
- [ ] Fill and review all `en/*` catalogs; per-page SEO titles/descriptions;
      `og:locale` alternates; sitemap gains `/en/*`.
- [ ] Flip `SITE.enableEnglish = true`.
- [ ] Full English LTR walkthrough; verify no dir-flash on a cold `/en` load.

---

## PHASE 15 — Launch checklist

- [ ] Real reviews entered (placeholders gone)
- [ ] About-page facts real
- [ ] Photos playbook run (below)
- [ ] Resend domain verified, `RESEND_FROM` flipped to the real sender
- [ ] Redirect crawl green; sitemap + hreflang validated
- [ ] Lighthouse: CLS < 0.1, LCP within budget
- [ ] **Then** attach `alumaoutdoor.com` to Cloudflare Pages

---

## 📸 PLAYBOOK — when the real product photos arrive

Run in this order.

1. **Check the shoot against `docs/GUIDE.md` Part 3.1** before accepting it.
   Specifically: is every wicker/rope gap transparent? Composite a cut-out on
   mid-green and mid-terracotta — any halo or filled gap is a reject.
2. **Upload** via `/admin/collections` → collections, then products, cover +
   gallery. Images land in the `site-collections` bucket as permanent public URLs.
3. **Confirm `VITE_USE_DEMO_DATA` is unset** in Cloudflare Pages env (Phase 2
   inverted the fork; if this is set you'll still see fake products).
4. **Swap the category mosaic imagery** — `CategoryMosaic.tsx` currently points
   at recycled collection webps.
5. **Re-cut the scene-builder sprites** from the new photos: `remove_background`,
   then run each through the Sprite Calibrator to set its ground anchor.
   Update `src/data/sceneItems.ts` with real cm dimensions from the owner's
   spreadsheet.
6. **Author the recolour masks** and run `scripts/recolor.md` per fabric.
7. **Commission the 3 hero GLB+USDZ models** (GUIDE.md Part 3.4) and populate
   `arModels.ts`.
8. **Swap `public/og-image.jpg`**, re-run Lighthouse, re-check CLS.

---

## ⏳ WAITING ON THE OWNER

Full instructions for each are in **`docs/GUIDE.md` Part 1**.

1. ✅ **RESOLVED 2026-07-31 — the live project is `jzqayfllojeqivwbbuyf`.**
   The other ref, `yvxynsonjmcppaxflmvz`, is in an account the owner cannot even
   open; it is not ours. `.env`, `.env.example` and `index.html` are repointed.
2. ✅ **RESOLVED — anon key in place and verified** against the live project.
2b. ✅ **RESOLVED — repair migration run and verified.** `site_reviews` now
   exists; `site_projects` went 401 → 200. (`contact_leads` still rejects anon,
   which is correct.) All other tables exist and are empty, as expected.
2c. **⛔ Cloudflare Pages env vars** — the deployed site keeps its own copy of
   `VITE_SUPABASE_*` and cannot be inspected from here. Must read `jzqay…`, and
   env changes only take effect on a **new build**.

**Old-project audit (2026-07-31), so nobody re-does it:** every attachment
point was checked. Edge functions (`submit-contact`, `auth-email-hook`,
`invite-admin`) are all deployed on `jzqay…` and executing current code —
`submit-contact` returns its own zod error for an empty body, versus 404 for a
name that doesn't exist. All four storage buckets exist there. Every table is
empty, so no old URLs are stored in any row, and no source file references the
old ref. One landmine was found and neutralised: migration
`20260625060348_*.sql` hardcoded a `blog_posts.cover_image_url` pointing into
the OLD project's `blog-images` bucket — a no-op today, but it would have fired
the first time an article used that slug and served a published image off a
project we don't control.
3. **⛔ Admin role row** — needed before any upload will be accepted.
4. **⛔ Resend account under `outdooraluma@gmail.com`** + API key. (Test mode
   only delivers to the account-owner address, so the account email itself
   matters.)
5. **3+ real customer reviews** — launch blocker; the current ones are invented.
6. **About-page facts** — founding year, the family's own words, 3 real numbers.
7. **Domain transfer to name.com** — not before ~11 Aug 2026 (ICANN 60-day lock).
8. **The asset shopping list** (GUIDE.md Part 3) — photos, dimensions
   spreadsheet, backdrops, 3D models.

---

## 💡 DEFERRED IDEAS (not scheduled, don't do these unprompted)

- Scene builder: user-uploaded backdrop photo with a manual 4-point ground
  calibration UI ("beta" quality at best).
- Scene builder: `saved_scenes` Supabase table + shareable layout URLs.
- Top-down "plan view" toggle for the scene builder (accurate footprints for the
  "will it fit" question).
- Admin screen listing `newsletter_subscribers` (currently write-only from the
  app's point of view — nothing reads it back).
- Drop the now-unused `product_favorites` table (left in place deliberately;
  dropping it is destructive and buys nothing).
- A real `info@alumaoutdoor.com` mailbox once the domain lands, replacing the
  gmail address in `SITE.email`.
- Consolidate the three duplicate `WhatsAppIcon` SVG definitions.

---
---

## STATUS SUMMARY

*Last updated: 2026-08-01 — round five: RTL fix + about rebuild*

**The RTL bug was systemic, not cosmetic.** Collection titles used `text-end`,
which in RTL resolves to the **LEFT** — the same trap as the original PageHero
`items-end` bug. Fixed, and then swept: `text-right` → `text-start` across 23
files (identical rendering in Hebrew, correct under `/en`), plus the last
physical paddings/borders in the footer, skip link and CTA icons. The scrim
under collection titles is direction-aware via an `rtl:` gradient variant.
**Rule for anyone touching this codebase: `end` is not "right".**

Also shipped:
- Collection titles much larger (clamp ceiling 110→170px index, 120→180px page).
- Tiles: one button each; the two wide tiles share a fixed 320px width so their
  buttons measure identically. Hot/popular flags removed.
- Club input `dir="ltr"` → `dir="auto"` — the forced LTR threw the Hebrew
  placeholder to the wrong edge.
- Nav "new" badge is absolutely positioned; inline, it widened the button and
  pushed every neighbour along. Journal + DIY dropdowns removed.
- Q&A: the contact form is collapsed behind the same plus-row the questions
  use; `/faq#contact` opens it on arrival.
- **About rebuilt from research** (Vitsœ, DEDON, Minotti, Tribù, Herman Miller,
  Muuto): no hero photograph (the most premium page in that set opens on type
  alone, and this site's home page is already full-bleed photography); an
  opening line with a refusal in it; a **"what we don't do" list where a stat
  strip would go**, since there are no numbers worth printing; 3 photographs;
  terracotta used exactly once. Portraits captioned with what each person does,
  not a title. ⚠️ Their parent must keep an explicit `bg-background` and **no
  `Reveal` wrapper** — `.reveal` sets `transform` + `will-change`, which create
  a stacking context that makes `mix-blend-multiply` composite against
  transparency and render the drawings as white boxes.

**Open on the owner:** deploy to Vercel (guide is written) · `/admin` via Google
sign-in · the Resend key. **Still Hebrew-only under `/en`:** journal,
collections, projects, about, DIY pages, legal.

---

*Earlier:*

*Last updated: 2026-08-01 — round four: the IA rebuild*

**The site's structure changed, not just its styling.** All shipped.

- **Navbar** is the owner's order (given left-to-right, so the array is
  reversed for RTL): collections · שווה לדעת · עשה זאת בעצמך *(new badge)* ·
  שאלות ותשובות · מועדון · אודות. No home entry — the logo does that job.
- **Catalogue is three levels now.** `/collections/:slug` used to be a
  *product*, which left collections homeless. Now: `/collections` (index, one
  wide named band + one row per range) → `/collections/:slug` (the range in
  full, new `CollectionPage.tsx`) → `/products/:slug` (the piece). Filter rail
  deleted. `ProductCard` is shared, exported from `CollectionPage`.
- **Build-your-own = 2 tools** (fabric, AR). `SofaDesigner` and `sofaUnits.ts`
  deleted. The questionnaire lives on at `/questionnaire` — it feeds AdminLeads
  — but is no longer a station.
- **Contact merged into `/faq`** (`Contact` + `ShowroomBand` render under the
  questions; `/contact` redirects; links point at `/faq#contact`).
- **שווה לדעת** = materials + projects. The magazine feed is gone; `/journal/:slug`
  still routes for any existing article.
- **Home tiles**: outlined pill CTAs that fill terracotta on hover (Apple's
  two-CTA pattern, our palette), 1 on narrow / 2 on wide, "hot" + "popular"
  flags on the first two, taglines −6px. **The tile is no longer a link** — the
  buttons are, because two buttons need two destinations and nested anchors are
  invalid markup.
- **Club field** rebuilt as input + labelled button.
- **Vercel**: `vercel.json` committed (build config + full redirect map +
  SPA rewrite). `public/_redirects` kept for Cloudflare; harmless on Vercel.
  Click-by-click deploy steps are in `docs/GUIDE.md`.
- Every internal link audited against the route table. 53 tests.

**Open on the owner:** deploy to Vercel and share the link · `/admin` via Google
sign-in · the Resend key. **Still Hebrew-only under `/en`:** journal,
collections, projects, about, DIY pages, legal.

---

*Earlier:*

*Last updated: 2026-07-31 night — round three, shipped*

**All owner notes from round three are in**, each pushed separately:

- **Photography round three**: coffee table set with espresso + cookies; bar
  stools re-shot as three simple identical silhouettes (the old set read as an
  impossible object); bar + dining night rows moved purple → deep charcoal
  (fire table untouched, by order); parasol canopy pinned low and to the side,
  clear of the headline zone; dining chair got a throw and olive-branch
  shadows; club background is now a peach dawn over an infinity pool.
- **Journal**: material bands are the homepage tile language at half height,
  2-up, no fade — `MaterialBand` and `accent.ts` deleted for good this time.
- **Club tile**: frosted-pill input (the underline vanished on a bright sky),
  filled round submit, 12px seam below as well as above.
- **About**: materials strip removed (it duplicated the journal).
- **FAQ**: rebuilt on Apple's marketing-FAQ pattern — 720px flat accordion,
  terracotta category labels, leading-edge plus (direction-neutral, so nothing
  mirrors in RTL), 0fr→1fr answers, no search, scroll-spy index deleted.
- **Contact**: channels-first (Apple's own contact page has no form at all),
  calm hairline tiles with the phone number as the typography, underline form
  fields, charcoal pill submit. All form logic untouched.
- **English is ON** (`SITE.enableEnglish = true`): nav, footer, home page and
  Q&A fully translate; FAQ copy moved into he/en catalogs and its JSON-LD
  regenerates per language. **Remaining Hebrew-only pages under /en**: journal,
  collections (DB content), projects, story, contact, DIY pages, legal —
  migrate next.
- **Projects**: three minimal alignments only — folio numeral demoted to a
  terracotta eyebrow, titles up to the homepage tile scale (32/40 semibold),
  photo card chrome dropped for the tiles' plain rounded treatment.

---

*Earlier:*

*Last updated: 2026-07-31 evening — owner-directed round two, shipped*

**The owner approved the rolled-back baseline and directed this round himself.**
All shipped and pushed:

- **Hero split parallax** — background climbs out at 0.2×scroll while the
  wordmark drifts the other way; image got extra height for the travel.
- **Category photography regenerated to a day/night plan**: morning rows take
  charcoal ink, night rows (fire table, bar + dining) take white; every prompt
  reserved a clean upper-middle sky for the type. 12px seam added under the
  hero; the לצפייה line removed.
- **Reviews cut entirely** (owner's call; `site_reviews` table stays — real
  quotes can earn the section back). **Club card is now the ninth tile**, same
  geometry, over a purpose-generated image with an empty upper two-thirds.
- **הסיפור שלנו → אודות**, moved near the nav's end; the protected
  paragraphs/wordmark/portraits untouched, but the page grounded with the
  four real materials and the showroom band. No invented content.
- **Collections rebuilt on the Apple lineup pattern** (research-verified):
  editorial band per collection, uniform square tiles on tinted panels, no
  chrome, no filters (DEDON/Tribù ship none), sticky anchor chips, unequal
  rhythm for grouping. Filter drawer gone; `#slug` links scroll after data
  loads. `Materials.tsx` (orphaned by the revert) deleted.

**Open asks on the owner:** Cloudflare env vars confirmation, `/admin` via
Google sign-in, the Resend key.

---

*Earlier that day:*

*Last updated: 2026-07-31 — redesign rolled back at the owner's request*

### What happened

Phases 5–11 redesigned pages the owner had already approved. He rejected the
result and asked for a rollback. **Phases 6, 8, 9, 10 and 11 are reverted.**
The lesson, recorded so the next session doesn't repeat it: *phases that fixed
defects were wanted; phases that restyled working pages were not.* Do not
redesign an approved page unless asked for that page by name.

### Live state of `main`

**Kept — the technical work:**
- Phase 1 bug fixes (the `PageHero` RTL root cause, the `.font-display` cascade
  bug, container max-widths, z-stack, undefined classes)
- Phase 2 cleanup — favourites removed (owner asked), dead code, `/before-after`
- Phase 3 `SectionRule` tokens; Phase 4 i18n + `/en` tree (switcher still gated)
- Projects wired to `site_projects`; database repair; Supabase repointed at
  `jzqayfllojeqivwbbuyf`
- **Deploy fix: Vite 6 + Node pinned** — Cloudflare rejected the Vite 5 build

**Kept — by explicit request:**
- **`/journal` ("שווה לדעת")**, materials + magazine merged. Its materials
  section is now the ORIGINAL full-width band layout converted to light: the
  glow, the radial wash and the blurred tinted interior are gone, since all
  three existed only to give a charcoal page depth.
- **Apple-geometry category tiles on the home page**, with new photography.
  No section heading (Apple has none); fixed tile heights, not `vh`; 12px seams.

**Reverted:**
- `/about` → back to `/story`; `About.tsx` and `TeamPortraits` deleted
- Collections lead-tile hierarchy → back to the uniform grid
- Build-Your-Own → 4 stations at `/designer` `/fabric` `/ar` `/questionnaire`;
  scene builder deleted, `SofaDesigner` restored, konva uninstalled
- Nav order and `SectionHeading` back to their previous behaviour
- Home reviews + newsletter → the original `Testimonials` marquee and
  `Newsletter` card. `ReviewsBand`, `ClubCard`, `ConsultCTA` deleted.

**Recoverable if ever wanted:** the scene builder and its 18 geometry tests are
in history at `9733584`; the About page at `e2873c3`.

### Data behaviour, corrected twice — get this right

Placeholder catalogue/magazine content now **fills an empty page and steps aside
the moment one real row exists**. The original code discarded live data in dev;
the first fix over-corrected to opt-in-only, which made an empty database render
an empty shop that looked broken. `VITE_USE_DEMO_DATA=0` forces the empty state.

### Next

Owner is reviewing. Outstanding from him: Cloudflare env vars confirmed,
`/admin` access (**use Google sign-in** — the project requires email
confirmation and email isn't wired yet), and the Resend key.

---

*The phase notes above are kept for their reasoning, but phases 6, 8, 9, 10 and
11 no longer describe the live site.*
