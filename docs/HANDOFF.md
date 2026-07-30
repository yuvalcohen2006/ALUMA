# HANDOFF — where this work stands

**Living note for whoever picks this up** (including a different Claude on a different account).
Update this file at the end of every work chunk. It is the single source of "what now".

---

## The mission

One big pre-launch pass over the whole site: fix every real bug three audits found, unify
every screen on the approved design language, flood the site with generated media, put it
visibly above the Israeli competition, and deploy to a live preview URL.

Full plan: `C:\Users\wolft\.claude\plans\i-need-a-big-delightful-moth.md`
Setup/ops guides: `docs/SETUP.md`, `docs/NEXT-STEPS.md`

**Governing rule: one signature move per page.** Home = hero film. Story = kinetic אור.
PDP = shared-element view transition. Materials = lit bands. Designer = the live dimension line.
No gimmick stacking.

---

## STATUS as of the latest chunk

### ✅ DONE and pushed to `main`

**Phase 0 — ops + token bugs** (`50a25c2`)
- Supabase secrets set on `jzqayfllojeqivwbbuyf` (RESEND_API_KEY, SEND_EMAIL_HOOK_SECRET).
- All refs unified on the new project (`.env`, `.env.example`, `index.html` dns-prefetch).
- `bun.lockb` deleted — it was breaking the Cloudflare build (bun ran against a stale lockfile).
- `public/_redirects` (`/* /index.html 200`) — without it every deep link 404s on Pages.
- `public/_headers` — HSTS, frame-deny, nosniff, Permissions-Policy (camera=self for AR).
- `submit-contact` CORS narrowed from `*` to site + `*.pages.dev`.
- **The font-bold bug**: `.font-display` carried `font-weight:400` in `@layer utilities`, which
  Tailwind hoists past `.font-bold` — every section heading site-wide rendered regular. Fixed,
  paired with base `h1/h2` 300→400 so PageHero titles didn't go thin.
- **The phone-validation bug**: the Israeli phone regex (client + server) only matched 9 digits,
  i.e. it rejected every MOBILE number including the studio's own 050. No customer could have
  submitted the contact form. Replaced with normalize-then-match.
- `--accent` darkened 50%→38% lightness (4.0:1 → ~5.4:1), fixing ~40 AA failures.
- Named rem type tokens: `text-meta` 18 / `text-lede` 20 / `text-card` 22 / `text-section` 38.
  (`text-body` stays the 18px/1.75 prose utility in index.css — do NOT add a `body` fontSize key,
  it collides.)
- clsx/tailwind-merge split into `ui-utils` chunk — they were dragging the admin-only 360KB
  recharts bundle onto the public homepage. Verified out of the modulepreload list.
- `ui/progress` fills by width from the start edge (was emptying as you advanced in RTL);
  `ui/dialog` text-start + gap + Hebrew close label; CookieConsent's nonexistent `shadow-elegant`.
- SofaDesigner `dir="ltr"` moved onto the scroll container — `scrollLeft` ran negative under RTL,
  so the left arrow was dead and scroll-to-new-unit never fired.
- Reduced-motion guards for smooth scroll + config keyframes.
- **E2E proven live**: signup → branded Hebrew email via Resend; contact form → lead + owner
  notification. Both delivered.

**Phase 1 — global chrome** (`da00ef0`)
- Nav rebuilt on the 7-item IA + contact CTA at 18px: קולקציות · פרויקטים · חומרים · **הסטודיו**
  (tools hub) · מגזין · אודות · מועדון. "דף הבית" removed (logo is home). Radix NavigationMenu
  with `dir="rtl"` — submenus are finally keyboard-reachable.
- `/ar`, `/fabric`, `/designer`, `/thank-you` now mount `<Layout>` (they had no cookie banner and
  no accessibility widget, while `/accessibility` claimed the widget was on every page).
- AccessibilityWidget panel → Radix Sheet (it was a fake dialog: no focus trap/Esc/restore).
- Footer to 18px throughout; charcoal hovers go lighter (`hover:text-accent` was dropping
  contrast 9.7:1 → 3.2:1).
- ConversionCTA retoned terracotta slab → charcoal band, one primary CTA.
- Fabricated homepage testimonials now DEV-gated like all other demo content.
- Hebrew sweep (maqaf ־, bidi isolation) + `src/lib/whatsapp.ts` for context prefills.

**Foundations** — `.grain` utility in index.css, `ShineAction` (button twin of ShineButton).

**Media landed**: hero film (`src/assets/hero/` — 1.1MB desktop, 0.5MB mobile, 50KB poster),
sun-slider stills (`src/assets/home/light/` — morning/golden/night, scene-locked), magazine at
10 articles with covers.

**Phase 3 — the eight tool and member pages** (`18313a1`, `ccc61d0`)
`FabricConfigurator`, `SofaDesigner`, `Questionnaire`, `Auth`, `Account`, `Story`
(+ `story/kinetic-or.css`), `Club`, and `/ar` rebuilt. `ProductCell` extracted from
Collections for reuse. All four catch-up verify passes ran and landed fixes.

**Phase 4 — product page and homepage** (`bc527e2`)
- PDP rebuilt media-first: `ProductGallery` (wrapper-zoom, thumb column, phone snap-carousel,
  Radix lightbox), sticky spec panel, material chips resolving through `materials.ts`,
  `ShowroomVisit` charcoal band posting `source:"visit"`, per-product og:image.
- Shared-element view transition, paired via `productTransitionName()`. Named on the FRAME,
  never the zoom layer — a snapshot ignores ancestor clipping. The loading branch renders a
  *named skeleton*, because Router captures the incoming DOM before Supabase answers.
- Hero film: poster-first, mounted only after `window.load`, `preload="none"`, yields to a CMS
  hero / reduced-motion / saveData, and unmounts itself if autoplay is refused.
- `LightBand` (sun dragged along a real arc across the three scene-locked stills) and
  `MagazineStrip`. Category tiles now link to real `/collections?cat=` filters.

**Correctness pass** (`5f8d0bb`)
- **The production bundle had been shipping all 34 demo catalogue photos.** DEV-gating is
  tree-shaken only while nothing imports a demo module for another reason — `/ar` did (a slug
  lookup) and Questionnaire did (one collection record). Both cut loose.
  `scripts/check-demo-gate.mjs` now runs in `npm run build` and fails it if anything from a
  demo asset folder reaches `dist`. **Do not add exceptions to that script**; if a demo image
  is genuinely production UI, copy it out of the demo folder (see `assets/fabric/sofa-preview.webp`).
- **The accessibility font slider only moved some of the text.** ~190 sizes were pinned in px,
  including SectionHeading's own title — which is why `text-section` had never compiled once.
  All migrated to rem tokens; explicit `leading-*` preserved, so scale-1 rendering is unchanged.
- **`text-card` was both a fontSize key and a palette colour**, so it emitted
  `color: hsl(var(--card))` — pure white. StickyCTA's headline used it on `bg-background`:
  invisible on every desktop page. Renamed to `text-card-title`; `card` is a colour again.
- `/before-after` deleted. Its "before" images were catalogue photos of finished furniture —
  one entry's "before" was another's "after". The slider survives as a ProjectDetail module,
  RTL clip maths fixed, gated behind `project.beforeAfter` which no project sets yet.

---

## 🚧 WHAT IS BLOCKED AND WHY — read this first

### 1. Higgsfield MCP connector is DISCONNECTED (the only hard blocker)

Every `mcp__claude_ai_Higgsfield__*` call returns **`MCP server "claude.ai Higgsfield" is not connected`**.
This is a transport-level disconnect, *not* the documented 8-concurrent-job cap — retrying and pacing
do not help. A non-interactive session cannot run the OAuth flow.

**To unblock:** the user runs `/mcp` in an interactive Claude Code session (or re-authorises the
connector in claude.ai connector settings), then the generation work below can resume.
Balance when it was last reachable: **~1,000 credits**, plenty for everything outstanding.

**What is still owed once it reconnects:**

| Item | Size | Notes |
|---|---|---|
| Catalogue backfill | 26 images | 13 existing products × 2 angles (detail + lifestyle): `tamid`, `shalhevet`, `ofek`, `namal`, `ratzif`, `terrazzo`, `granit`, `omer`, `shevil`, `hof`, `tzel`, `ruach`, `gal` |
| 20 NEW products | 60 images | 3 angles each. **Hebrew copy is already drafted** — see below |
| `/ar` GLB models | 3–4 models | The whole point of the AR page. See §2 |
| Before/after pairs | 3 images | "Empty this terrace" variants of 3 project scenes, via nano_banana_pro with the scene as reference |
| Sunbrella macro re-gen | 1 image | Current one reads as coarse rope/jute, not fine acrylic weave |

⚠️ **The 20 new products' Hebrew copy** (names, tags, taglines, dimensions, materials, unique slugs)
was drafted and saved to the session scratchpad:
`…\1e179650-…\scratchpad\new-products-draft.json`.
**That path is session-scoped and will not survive.** If it's gone, re-draft it — do not skip it,
and match the existing naming spirit (nature/light/place words: מונוליט, להב, אופק, חוף…).

**Hard rule that was followed and must keep being followed:** never add a product entry whose image
import points at a file that doesn't exist — it breaks the Vite build. Generate first, wire second.

### 2. `/ar` has no models — by design, temporarily

The page used to serve three **third-party sample meshes from modelviewer.dev** (a generic sofa,
chair and table) as if they were Aluma products. That was a genuine launch blocker and they are
**deleted**. The page is fully rebuilt and ships an honest empty state instead.

To light it up: generate a clean studio cutout per product (`marketing_studio_image`, 1:1, neutral
light-grey backdrop, whole object with margin, no scene/props/text), feed that job id to
`generate_3d`, download the GLB to `public/models/<slug>.glb`, then add an entry to `arProducts`
in `src/pages/ARPreview.tsx` (slug, name, tagline, imported poster). It deliberately does NOT read
the catalogue any more — that lookup is what dragged the demo photos into production.
Sanity-check each mesh — if it's degenerate, drop that product rather than shipping something bad.
Budget guard: if `generate_3d` costs >60 credits/model, do one and reassess.
**iOS:** Quick Look needs USDZ, which we don't produce. The page already states this honestly
(3D view on iPhone, in-room placement on Android). Do not silently ship a failing AR button.

### 3. Session limits keep truncating fleets

Three separate workflows were wiped mid-run by account session limits. Everything is resumable —
`Workflow({scriptPath, resumeFromRunId})` replays completed agents from cache instantly and only
re-runs what failed. Scripts and run IDs are in the table below. If work looks half-done, **check
the filesystem before regenerating** — the interrupted runs left real, valid output on disk (14
catalogue angles, 4 material macros, 12 project scenes all survived that way).

### 4. Before/after: the module is done, the photographs are not

`/before-after` is gone as a route. The slider now lives on `ProjectDetail`, behind
`project.beforeAfter` — a field no project sets, so nothing renders today. Add one the moment a
real pair exists: `{ before, after, note }` on the project in `src/data/projects.ts`.

**Never fill the "before" slot with a substitute shot.** The deleted page did exactly that — its
"before" images were catalogue photos of finished furniture, and one entry's "before" was another
entry's "after" — which advertised transformations that never happened. No pair, no module.

The RTL maths is fixed and worth not re-breaking: `pos` is logical (measured from the inline
start edge), the reveal is a `clip-path` on a full-size image so both layers share identical
geometry, and the one conversion to a physical `left` happens at the very end for the divider and
handle. The old version over-constrained a wrapper with `inset-0` + `width`, which drops `left`
in RTL, so the reveal grew from one edge while the handle was measured from the other.

---

## ▶️ NEXT ACTIONS, in order

Everything through Phase 4 is committed and pushed. The build is green end to end:
`npx tsc --noEmit`, `npm run build` (which now includes the demo gate), and `npx eslint src/`
with no new problems — the ~37 remaining lint errors are all pre-existing `no-explicit-any`
in `pages/admin/`, `useCollectionsData`, `useFavorites`, `Auth` and two shadcn primitives.

1. **Reconnect Higgsfield and finish the media** (§1). This is the single largest remaining
   chunk and the only thing standing between the site and a catalogue that feels finished.
2. **Light up `/ar`** once models exist (§2).
3. **Add real before/after pairs** to `project.beforeAfter` as they are generated (§4).
   The module and its RTL maths are done and waiting.
4. **A real device pass at 375px** — the one thing that cannot be done from here. Check
   horizontal overflow at accessibility font scale 1.3 as well as 1.0; there is deliberately
   NO global `overflow-x: clip` guard, because hiding an RTL overflow makes the content
   unreachable instead of merely ugly. Find the element, fix the element.
5. **Lighthouse before/after on the homepage.** The hero film must not move LCP: the still
   keeps `fetchPriority="high"`, the video mounts only after `window.load` with
   `preload="none"`, and its poster is the same asset, so it should be a cache hit.
6. **Confirm the Cloudflare build goes green** and test deep links on the `.pages.dev` URL
   (`/collections/<slug>`, `/blog/<slug>`) — that is what `public/_redirects` is for.
7. **Rewrite `docs/NEXT-STEPS.md`** to the true final state, then update this file.

---

## Reusable workflow scripts (resume with `{scriptPath, resumeFromRunId}`)

| Purpose | Script | Run ID |
|---|---|---|
| Phase 1 chrome | `aluma-phase1-chrome-wf_79cbc36b-c5d.js` | `wf_79cbc36b-c5d` — done |
| Phase 3 pages | `aluma-phase3-pages-wf_0e6a93f9-9f0.js` | `wf_0e6a93f9-9f0` — done (AR was finished by hand) |
| Media factory | `aluma-media-factory-wf_bca3466a-6c0.js` | `wf_bca3466a-6c0` — **resume when Higgsfield is back** |
| Phase 4 PDP + home | `aluma-phase4-pdp-home-wf_f1934a71-39f.js` | `wf_f1934a71-39f` — check if it finished |

All under `C:\Users\wolft\.claude\projects\c--Yuvalco-private-projects-benAluma\<session>\workflows\scripts\`.
⚠️ If you edit one with a Python script on Windows, **normalize it back to LF** — CRLF makes the
Workflow tool reject it ("control characters that would be hidden in the approval dialog").

---

## Gotchas that cost time — don't rediscover these

- `duration-[600ms]` compiles to **nothing** (Tailwind drops it as ambiguous). Use `duration-600`
  (a real token added to `transitionDuration`).
- `mb-22` isn't a Tailwind step either. Verify arbitrary utilities actually emit.
- Never scale an `<img>` on hover — scale a wrapper div, or the border/radius drag with it.
- In RTL the **first** flex/grid child renders at the RIGHT. CSS transforms do NOT flip.
- Sheet/drawer should open on the same edge as its trigger. The filter drawer and its button both
  live on the right.
- Terracotta `--primary` is large-text-only on warm white (3.07:1). On sand use charcoal.
- Demo content must be DEV-gated (`import.meta.env.DEV` + dynamic import), like
  `useCollectionsData.ts` does — but **the gate is only as good as the import graph**. Any
  module-scope import of a demo data file anchors every image in it, DEV branch or not. That is
  how 34 fake product photos shipped. `npm run build` now proves it instead of assuming it.
- A `fontSize` key that collides with a **colour** name silently emits a `color` rule too
  (`text-card` → `color: hsl(var(--card))`, pure white). The config warns about `body`; `card`
  hit the same trap. Check both namespaces before adding a type token.
- Anything sized in `px` is invisible to the accessibility font slider, which scales the root
  font-size. Use the rem tokens (`text-meta` / `lede` / `card-title` / `subsection` / `section`)
  or arbitrary rem values — never `text-[18px]`.
- Resend is still in test mode — it will only deliver to `yuval.cohen006@gmail.com` until the
  domain is verified. `RESEND_FROM` and `OWNER_EMAIL` are env vars, so going live is two
  `supabase secrets set` calls and no code change.

## Open decisions for the client (already flagged, awaiting his review)

- Tab renamed "הסטודיו" (was "עשה זאת בעצמך") because 10 items don't survive 18px.
- "דף הבית" removed from the nav.
- `/before-after` route deleted, content folded into project pages (done).
- **The hero scrim over the new dusk poster.** `from-background/40 via-background/30 to-background/80`
  is a warm-white wash tuned in the client-approved readability pass against the bright daytime
  `hero-salon.jpg`. The film's poster is a dusk frame, where lightening both kills the drama and
  does little for a terracotta logo (roughly 1.4–1.6:1 at the logo's band). Not a WCAG failure —
  the logo is an `<img>` and the page's accessible title is the sr-only `h1` — but it is a visible
  change to a screen he already signed off, so it wants his eye, not a silent retune. Options: an
  inverted dark scrim for the film only, or a brighter still.
- The domain is locked until ~11 Aug (registered 12 Jun, ICANN 60-day rule, registrar Name.com,
  bought through Lovable). Nothing to do before then.
