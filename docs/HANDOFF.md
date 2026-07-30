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

## ▶️ NEXT ACTIONS, in order

1. **Commit the above.** Build and tsc are clean; verify once more then commit + push.
2. **`/ar` rebuild** — the only Phase 3 page not done. Its build agent was blocked by a transient
   safety-classifier error; just retry. Task spec is in the Phase 3 workflow script (see below).
   ⚠️ **Launch blocker inside it**: `/ar` currently ships third-party demo meshes from
   modelviewer.dev. Must be replaced with GLBs generated from our own product renders
   (Higgsfield `generate_3d`), max 3-4 hero products, each sanity-checked. If a mesh is bad,
   drop that product — never ship a generic sofa. iOS needs USDZ for real AR placement; if we
   don't convert, say so honestly in-UI (3D view on iPhone, AR on Android).
3. **Re-run the 4 verify agents** that died on the session limit: questionnaire, fabric,
   account, designer. Resume the Phase 3 workflow (cached builds replay instantly).
4. **Finish the media factory** — catalogue is ~34/100 images. Resume that workflow.
   Then the 3 before/after pairs (generate "empty this terrace" variants from project scenes).
5. **PDP rebuild** (`CollectionDetail.tsx`) — needs the full catalogue first. Spec: media-first
   split, gallery + lightbox, sticky spec panel, materials as chips linking to `/materials/:slug`,
   charcoal showroom-visit band riding `submit-contact` with `source:"visit"`, "complete the set"
   cross-sell using the extracted `ProductCell`, and the shared-element View Transition paired
   with the Collections grid (`viewTransition` on the Link + matching `view-transition-name`).
6. **Phase 4 — homepage integration**: hero film (poster-first, `preload="none"`, src attached
   after `load`, parallax off while playing, CMS custom image still wins), the "אלומה. על שם האור"
   sun-slider band between AboutBrief and CategoryIcons, a "מהמגזין" 3-up strip, magnetic CTAs.
7. **Hardening + deploy**: tsc/eslint/build, 375px no-overflow (incl. a11y scale 1.3), AA on new
   work, Lighthouse before/after, then push and confirm the Cloudflare Pages build goes green.
8. **Rewrite `docs/NEXT-STEPS.md`** to the true final state.

---

## Reusable workflow scripts (resume with `{scriptPath, resumeFromRunId}`)

| Purpose | Script | Run ID |
|---|---|---|
| Phase 1 chrome | `aluma-phase1-chrome-wf_79cbc36b-c5d.js` | `wf_79cbc36b-c5d` (done) |
| Phase 3 pages | `aluma-phase3-pages-wf_0e6a93f9-9f0.js` | `wf_0e6a93f9-9f0` |
| Media factory | `aluma-media-factory-wf_bca3466a-6c0.js` | `wf_bca3466a-6c0` |

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
