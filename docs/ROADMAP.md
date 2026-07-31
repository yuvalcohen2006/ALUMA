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

## PHASE 6 — About (`/story` → `/about`)

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
- [ ] Route + 301 from `/story`; nav label "אודות"; delete `Story.tsx`.
- [ ] ⚠️ Real letter facts and years needed from the owner — see WAITING ON THE OWNER.

---

## PHASE 7 — "שווה לדעת" (`/journal`) — materials + magazine merged

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
- [ ] Delete `Materials.tsx`, `Blog.tsx`, `MaterialsBrief.tsx`.
- [ ] Nav: drop חומרים + מגזין, add **שווה לדעת** (submenu = the 4 material pages).

---

## PHASE 8 — Collections polish + Projects wiring

- [ ] Collections: give each collection block a hero/support hierarchy — first
      product `aspect-[8/5]`, the rest `aspect-[4/5]` (same grid maths as the
      mosaic). `SectionRule` headers. Confirm `?cat=` is honoured (the mosaic and
      consult results both link that way).
- [ ] Projects: query **`site_projects`** with the static `src/data/projects.ts`
      as empty-table fallback. The table and its full admin CRUD already exist
      but **no public page reads them** — editing projects in the CMS currently
      changes nothing. Write a small mapper matching what AdminProjects writes.

---

## PHASE 9 — Navigation finalisation + redirect/sitemap sweep

- [ ] Final navbar (RTL, right→left): **דף הבית · קולקציות · עשה זאת בעצמך ·
      פרויקטים · שווה לדעת · שאלות ותשובות · מועדון · אודות · צרו קשר** ·
      [switcher, still gated]. `/consult` is deliberately **not** in the main
      nav — it lives on the contact page, the homepage CTA and the footer.
- [ ] `public/_redirects`: full audited list, **all 301s above** `/* /index.html 200`.
- [ ] Regenerate `public/sitemap.xml` (currently stale: lists `/before-after`,
      missing `/club`, `/diy`, detail routes). Sanity-check robots.txt + llms.txt.

---

## PHASE 10 — Build-Your-Own restructure + honest consultation

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

## PHASE 11 — Scene builder v1 (the flagship)

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

**Regression tests to write** (each is a bug this design is built to avoid):
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

1. **⛔ Which Supabase project is real** — `jzqayfllojeqivwbbuyf` (docs +
   `config.toml`) vs `yvxynsonjmcppaxflmvz` (`.env` + `index.html`). Both hosts
   are alive and both reject unauthenticated probes, so this **cannot be
   determined from the code** — a human must open the dashboard and see which
   one has the tables. **Nothing that touches the database can be trusted until
   this is answered; do not "fix" the ref by guessing.**
2. **⛔ The Supabase anon key** — `.env` still holds the literal placeholder, so
   every database call fails locally.
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

*Last updated: 2026-07-31 — Phases 1–5 complete*

**Phases 1–3 are merged to `main` and pushed.** Phases 4–5 are on branch
`redesign/phase-4-i18n`.

- **Phase 4 (i18n plumbing).** Route table extracted to `src/routes.tsx` with
  relative paths and mounted twice — `/` for Hebrew, `/en` for English — under
  `LangShell`. Language is read from the URL, not a browser detector. Switcher
  built (globe + own-script names, no flags, real anchors) but **gated off**:
  only Header/Footer/SEO speak `t()` so far, so `/en` still leaks into Hebrew
  pages. 21 routing tests lock the structure.
- **Phase 5 (homepage).** hero → **CategoryMosaic** → ConsultCTA → ReviewsBand
  → ClubCard → footer. Seven orphaned components deleted; homepage JS 226→216KB.
  `site_reviews` table added so reviews are real content — the fabricated
  placeholders retire themselves the moment three real rows exist.

**Next up: Phase 6 (About page).** Extract `TeamPortraits` verbatim *first*,
then rebuild around it. Needs real facts from the owner (founding year, the
family's own words, 3 proof numbers) — build the structure with clearly-marked
placeholders and flag them.

---

*Earlier summary (Phases 1–3):*

**Where we are:** Phases 1, 2 and 3 are done and committed on branch
`redesign/phase-1-stabilize` (3 commits). `npm run build`, `npx tsc --noEmit`
and `npm run test` are all clean after each.

- **Phase 1 (stabilise).** The experimental `rebuild/launch-plan` branch is
  deleted from GitHub. Both headline bugs were single-line root causes: the RTL
  misalignment across all 14 interior pages was `items-end` in `PageHero.tsx`
  (in a *column* flex the cross axis is the inline axis, so it resolved to the
  left, taking the title, its rule and the filter button with it), and the
  un-bolded headings were `.font-display` setting `font-weight: 400` as a
  utility — emitted after Tailwind's own, so it beat every `font-bold` on the
  site. Moving it to `@layer base` fixes it with no visual change to headings.
  Also: the container had no max-width below 1400px, `shadow-elegant` and
  `prose-luxury` referenced nothing, the cookie banner covered the WhatsApp FAB,
  and several smaller RTL defects. All email now resolves from `SITE.email` =
  **outdooraluma@gmail.com**.
- **Phase 2 (cleanup).** Favourites removed end-to-end, `/before-after` retired,
  both dead Lovable asset stubs deleted (one *was* the fabric page's entire base
  photo — that page now shows a real sofa and a true-colour swatch instead of
  tinted rectangles over a broken image), and the demo-data fork **inverted** so
  live Supabase data is the default and the fake catalogue is opt-in.
- **Phase 3 (design foundation).** `SectionRule` + rule tokens + `.section-pad`.
  `SectionHeading` now draws a correctly-toned rule under every heading, and
  `PageHero` reads the same accent token, so there is one rule vocabulary.

**What's next: Phase 4 (i18n plumbing).** It must land before the page rebuilds
so each rebuilt page is authored with `t()` keys once instead of twice. Start
with the pure-move commit that extracts the route table out of `App.tsx`.
Phase 5 (homepage restructure — the category mosaic) is the first visible win
and the client's headline request.

**What's blocked:** two Phase-1 items only — setting the `OWNER_EMAIL` secret
and the end-to-end email test. Both need the owner (see **WAITING ON THE
OWNER**). Nothing in Phases 4–9 depends on them.

⚠️ **Read before touching anything database-shaped:** the Supabase project-ref
conflict was deliberately **not** resolved by guessing. Both candidate projects
are live and both reject unauthenticated probes, so there is no way to tell from
the code which one holds the tables. Picking one blindly risks pointing the site
at an empty database and silently losing uploads. A human must look — the
two-minute procedure is `docs/GUIDE.md` → Blocker 1.
