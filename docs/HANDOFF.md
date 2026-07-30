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

### 🟡 UNCOMMITTED but done and verified (tsc + build clean) — COMMIT THESE

Phase 3 pages, 7 of 8: `FabricConfigurator`, `SofaDesigner`, `Questionnaire`, `Auth`,
`Account` (+ `src/components/ProductCell.tsx` extracted from Collections), `Story`
(+ `src/components/story/kinetic-or.css`), `Club`.
Plus partial media: 14 catalogue backfill images, 4 materials macros, 12 project scenes,
and `src/data/projects.ts` gallery rewiring.

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
`generate_3d`, download the GLB to `public/models/<slug>.glb`, then add the slug to `AR_SLUGS` in
`src/pages/ARPreview.tsx`. Everything else (name, blurb, poster) resolves from the catalogue.
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

### 4. Not blocked, just not done yet

`/before-after` still exists as a route and is still absent from the nav. The plan says fold its
slider into `ProjectDetail` as a module and delete the standalone route. Its RTL clip math is
broken and must be fixed while moving: use `inset-y-0` + start-edge + `width`, **not** `inset-0` +
`width` (an over-constrained box drops `left` in RTL, so the reveal grows from the wrong side while
the handle is measured from the other).

---

## ▶️ NEXT ACTIONS, in order

**A workflow was in flight when this note was last updated** (`wf_f1934a71-39f`, "phase4-pdp-home"):
PDP rebuild, homepage integration, the Collections view-transition half, and catch-up verification
of Questionnaire/Fabric/Account/Designer. **Check whether its output landed before redoing any of
it** — `git log` and `git status`, then resume the workflow if agents failed.

1. **Verify + commit whatever that workflow produced.** `npx tsc --noEmit`, `npm run build`,
   `npx eslint` on the touched files, then commit and push.
2. **Reconnect Higgsfield and finish the media** (see §1 above). This is the largest remaining
   chunk and the only thing gating a genuinely finished-feeling catalogue.
3. **Light up `/ar`** once models exist (see §2).
4. **Fold `/before-after` into ProjectDetail** and delete the route (see §4).
5. **Hardening pass** — do this yourself, not via a fleet, and actually reason about each:
   - `npx tsc --noEmit`, `npm run build`, `npx eslint src/` (the only pre-existing errors are
     ~14 `no-explicit-any` in admin/`useCollectionsData`/`Auth` — do not count those as new).
   - 375px: no horizontal overflow anywhere, including at accessibility font scale 1.3.
   - AA contrast on everything new (accent was darkened to `14 50% 38%`, ~5.4:1 on warm white).
   - Lighthouse before/after on the homepage — the hero video must not regress LCP.
   - Confirm demo content still cannot reach production: `npm run build` then
     `ls dist/assets/*.webp` should show **no** demo catalogue/blog images.
6. **Push and confirm the Cloudflare Pages build goes green.** `_redirects` is committed, so deep
   links should work — test `/collections/monolit` and `/blog/<slug>` on the `.pages.dev` URL.
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
  `useCollectionsData.ts` does. Verified: 0 demo webp files reach `dist/`.
- Resend is still in test mode — it will only deliver to `yuval.cohen006@gmail.com` until the
  domain is verified. `RESEND_FROM` and `OWNER_EMAIL` are env vars, so going live is two
  `supabase secrets set` calls and no code change.

## Open decisions for the client (already flagged, awaiting his review)

- Tab renamed "הסטודיו" (was "עשה זאת בעצמך") because 10 items don't survive 18px.
- "דף הבית" removed from the nav.
- `/before-after` route to be deleted, content folded into project pages (RTL clip math needs
  fixing when it moves: `inset-y-0` + start-edge + width, not `inset-0` + width).
- The domain is locked until ~11 Aug (registered 12 Jun, ICANN 60-day rule, registrar Name.com,
  bought through Lovable). Nothing to do before then.
