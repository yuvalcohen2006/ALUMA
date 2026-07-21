# Aluma — Project Assessment & Cleanup Plan

_Prepared as the starting point for our redesign work. The **dead-code cleanup below (step 7) has been executed and build-verified**; everything else is still "here's what you have and here's what I'd do."_

## ✅ Done this session — cleanup (build passes)

- **`git init` + safety snapshot** committed first (this wasn't a git repo — now it is, so everything's revertible).
- **Removed 59 dead files**: 32 unused shadcn/ui components, the unused Radix toast system, orphaned components (`BackToTop`, `Breadcrumbs`, `FeatureIcons`, `TrustBar`, stale `Collections/FAQ/Materials/Story` duplicates), the dead `AdminCustomers` twin, legacy `data/collections.ts`, the Vite-starter `App.css`, and unused assets.
- **Removed 27 unused npm packages** (9 libs + 18 `@radix-ui`) from `package.json`.
- **Renamed** `vite_react_shadcn_ts@0.0.0` → `aluma-outdoor@0.1.0`; detached `sonner` from the dead `next-themes`; `.gitignore`'d `.env`.
- **`npm run build` passes** (`✓ built in 7.1s`). `src/` went 172 → 133 files.
- _Note:_ lockfiles were stale after the dep removal — a fresh `npm install` was run to reconcile.

---


---

## TL;DR

**What it is:** A Hebrew (RTL) marketing + e‑commerce‑adjacent website for **Aluma**, a luxury outdoor‑furniture brand (salons, dining sets, tables — aluminium, Sunbrella fabric, porcelain‑granite). Built in **Lovable** on Vite + React + TypeScript + Tailwind + shadcn/ui, with a **real Supabase backend** (auth, a full admin CMS, email pipeline, analytics) and some "special" 3D/AR/configurator features.

**Honest grade: 5/10.** This is meaningfully above a bare recolored template — the auth, the CMS, the RLS security model, and the email/contact pipeline are genuinely built and genuinely work. But it's dragged down by: **one production‑breaking bug (admins are likely locked out of the CMS)**, a systemic "swallow every error" pattern that hides failures, a pile of **fabricated trust content** that's a real legal/marketing liability, cookie‑consent that does nothing, and a lot of **dead weight** (≈67% of the UI library and ~20 npm packages are unused). The *foundation* is a generated template with brand paint on top; the *effort layered on it* is real but uneven.

**The good news for you:** the bones are solid enough that this is worth polishing, not rebuilding. Most problems are fixable in a focused pass.

---

## ✅ Round 2 — fixes applied (build passes at every step)

> ⚠️ **Two new DB migrations must be applied** (`supabase db push` / Lovable) for the admin fix and the newsletter to work live:
> `20260721120000_fix_admin_access.sql` and `20260721120100_newsletter_subscribers.sql`. Until then the admin check and newsletter behave as before.

**Broke → fixed**
- **Admin lockout** — `useIsAdmin` now reads `user_roles` directly (not the revoked `has_role` RPC); migration re-grants `has_role` execute (RLS policies need it) and adds the missing "admins read all profiles" policy → the CMS people-screens will list everyone, not just you.
- **Dead lead-drop links** — the two fake `972000000000` WhatsApp buttons (Sofa Designer, Fabric Configurator) now use the real number; footer's dead `href="#"` socials hide until real URLs are set.
- **Address contradiction** — Story now says Yatzitz like every other page; all contact facts now live in one `src/config/site.ts`.
- **Google OAuth** — now returns you to the intended page (e.g. `/club/dashboard`), not the homepage.
- **False 404s** — CollectionDetail shows a retry state on a fetch error instead of a permanent-looking 404; Account + favorites now surface real errors instead of silently looking empty.
- **AdminDashboard** — the "total views" card shows the real all-time count (was a duplicate); removed the broken "custom" range pill.

**Privacy / honesty**
- **Meta Pixel no longer fires before consent.** It loads at runtime only after opt-in; the cookie banner is now authoritative and gates both the pixel and first-party analytics.
- **Newsletter is real** — writes to a `newsletter_subscribers` table instead of faking success.
- **Removed the fabricated 5-star testimonials** from the homepage (component kept + marked, for real reviews later).

**Design tokens (honesty, ~no visual change)**
- Removed the dead dark-mode palette and all unused/mislabeled tokens; the "green shadow under a terracotta box" and the lying `--gold`/`--espresso` aliases are gone.

**Perf / SEO**
- Vendor code-splitting dropped the initial JS bundle **651 kB → 204 kB**.
- Fixed the JSON-LD logo (`favicon.ico`→`.png`), added real phone/address to LocalBusiness, replaced the invalid `price:"0"`/InStock Offer with PreOrder, removed the mislabeling static canonical, and made `robots.txt` disallow `/admin`,`/account`,`/auth`,`/club/dashboard`.

**Still needs YOU (can't fake it) / deferred to our design pass**
- Real project photography + genuine before/after photos (both are currently recycled catalog renders — flagged, not shipped as new fabrication).
- Real social URLs (wire into `src/config/site.ts`) and real testimonials.
- The subjective visual redesign (typography, palette direction, spacing) — that's our next conversation.
- Pre-existing lint debt (~51 `no-explicit-any` in generated admin code) and no real test suite — left as-is; not visible, and a mass retype is risky.

---

## What's actually good (so this is balanced)

- **The Supabase backend is the strongest part.** It uses the *correct* secure pattern: a separate `user_roles` table + a `SECURITY DEFINER has_role()` function, with RLS on every sensitive table. **A user cannot make themselves an admin.** That's better than most hand‑built apps.
- **The admin CMS is real**, not fake local state — every section does real CRUD to Supabase and uploads images to Storage with signed URLs.
- **Auth + the customer "Club" work** — email/password + Google OAuth, and the "save favorites as a guest → sync to your account on login" flow genuinely functions.
- **Edge functions are properly secured** (`invite-admin` verifies the caller is an admin before doing anything; the email queue requires a JWT).
- **The Hebrew copy is native and brand‑specific** — not lorem, not machine‑translated. RTL is handled properly (even the phone numbers are correctly forced LTR).
- **Solid SEO/a11y scaffolding**, code‑splitting, an ErrorBoundary, scroll‑reveal animations that respect `prefers-reduced-motion`.

---

## Top priority fixes (in order)

### 1. 🔴 The admin panel is probably locked out in production — fix first
Migration `20260716052325` (line 13) revokes `EXECUTE` on `has_role()` from `authenticated`, but [`useIsAdmin.ts:23`](src/hooks/useIsAdmin.ts#L23) still calls it via `supabase.rpc("has_role", ...)` as the logged‑in user. That call now returns permission‑denied → `isAdmin=false` → **`AdminGuard` blocks every real admin.** RLS still protects the data (so nothing leaks), but nobody can *operate* the site.
**Fix:** in `useIsAdmin`, stop RPC‑calling `has_role`; instead query your own row (`user_roles` where `user_id = me AND role = 'admin'` — the existing "Users view own roles" policy allows this), or expose a granted `is_admin()` RPC. First verify whether that migration actually reached the live DB.

### 2. 🔴 Add an "admin can read all profiles" policy
`profiles` only has owner‑scoped RLS and **no admin‑read policy**, yet Club/Customers/Orders/Team screens all `select` from `profiles`. Result: your customer list shows **only yourself**, and order/customer names resolve to blank/UUID. Add:
`create policy "Admins read all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));`

### 3. 🟠 Stop swallowing Supabase errors (systemic)
Nearly every data read (`useCollectionsData`, `Account`, `useFavorites`, `Blog`, `CollectionDetail`, every admin `load()`) destructures only `{ data }` and ignores `{ error }`. A permissions failure, a network blip, and a genuinely empty table all render **identically** as "nothing here." This is *why* bugs #1 and #2 are invisible. Adopt one shared query wrapper that surfaces a distinct error/retry state.

### 4. 🟠 Remove or replace fabricated trust content (legal/trust risk)
For a real commercial brand this is not cosmetic — it's a false‑advertising exposure:
- **Fake testimonials** — 3 invented named customers, all forced to 5 stars ([`Testimonials.tsx`](src/components/home/Testimonials.tsx)).
- **Fake Before/After** — the "before" photos are admittedly polished after‑shots of other projects (the data file's own comment says so — [`beforeAfter.ts`](src/data/beforeAfter.ts)).
- **Fake portfolio** — all 6 "projects" in named affluent towns are built from recycled catalog renders ([`projects.ts`](src/data/projects.ts)).
- **Fake stats** — "1,500+ customers", "10+/24/7/VIP".
- **Fake newsletter** — fakes a success toast, saves to `localStorage`, sends nothing anywhere ([`Newsletter.tsx`](src/components/home/Newsletter.tsx)).

### 5. 🟠 Two dead placeholder WhatsApp numbers drop your hottest leads
The Sofa Designer and Fabric Configurator "get a quote" buttons link to `wa.me/972000000000` (a fake number) — while the real number `972504519062` sits right next to them in `ConversionCTA`. Every user who designs a sofa and taps "quote" reaches nothing. Also the footer's Instagram/Facebook links point to `#`.

### 6. 🟠 Cookie consent is theater + the pixel fires before consent
The Meta Pixel fires `PageView` in `index.html` on load, **before** any consent. The cookie banner writes `accepted`/`declined` to `localStorage` — **which nothing ever reads.** Under EU ePrivacy/GDPR this needs real opt‑in gating. Make consent authoritative and gate the pixel + first‑party visitor tracking on it.

### 7. 🟡 Dead‑code / dependency cleanup (see below)

---

## Why it "looks AI‑generated" (the tells)

These are the things that read as templated/auto‑generated rather than authored:

- **`package.json` is still named `vite_react_shadcn_ts` @ `0.0.0`**, and **`src/App.css` is the untouched Vite starter** (spinning logo, centered 1280px box) — never even opened.
- **The color tokens lie.** `--gold`, `--espresso`, `--primary` and `--ring` are all the *identical* terracotta value. `--gradient-gold` is terracotta‑to‑terracotta (not a gradient, not gold). `--shadow-gold` casts the **green** accent. `--cream`/`--sand` duplicate `--background`/`--secondary`. Names were invented to sound premium, never reconciled with values.
- **A full dark‑mode palette exists but is dead** — it's a leftover amber theme that doesn't match the brand, never activated (no ThemeProvider, no toggle).
- **No real typographic hierarchy** — `font-display` and `font-sans` are the *same* Heebo stack; "luxury" is expressed only through font‑weight.
- **Duplicated/fabricated content clusters** — the fake testimonial towns mirror the fake project towns (one prompt made both to look mutually corroborating).
- **Boilerplate comment** `/* Luxury outdoor furniture design system */`, plus `shadow-luxury` / `container-luxury` naming.
- **Two parallel toast systems** both mounted; only one (`sonner`) is used.
- **A cookie banner and a `expect(true).toBe(true)` test** — compliance‑shaped and test‑shaped UI with nothing behind them.

---

## Dead code to discard (verified by grep) — ✅ removed & build-verified

> This list has been executed (see "Done this session" above). Kept here as the record of what was removed.

- **33 of 49 shadcn `ui/` components are never used** (~67%): alert, alert-dialog, aspect-ratio, avatar, breadcrumb, calendar, carousel, chart, checkbox, collapsible, command, context-menu, drawer, dropdown-menu, form, hover-card, input-otp, menubar, navigation-menu, pagination, popover, radio-group, resizable, scroll-area, separator, sheet, sidebar, skeleton, slider, table, toggle, toggle-group (+ `ui/use-toast.ts`).
- **~9 top‑level deps + ~15 Radix packages** exist only to feed those dead components: `@hookform/resolvers`, `react-hook-form`, `react-day-picker`, `date-fns`, `cmdk`, `vaul`, `input-otp`, `react-resizable-panels`, `next-themes`.
- **The Radix toast system** (`toast.tsx`, `toaster.tsx`, `hooks/use-toast.ts`, `ui/use-toast.ts`, `@radix-ui/react-toast`) — mounted but never fed; app uses `sonner`.
- **Orphaned components** (defined, never rendered): `BackToTop`, `Breadcrumbs`, `NavLink`, `home/FeatureIcons`, `home/TrustBar`, plus stale duplicates `components/Collections.tsx`, `components/FAQ.tsx`, `components/Materials.tsx`, `components/Story.tsx`.
- **`AdminCustomers.tsx`** (222 lines) — a near‑verbatim twin of `AdminClub`; its route redirects away, so it's never mounted.
- **`src/data/collections.ts`** (~186 lines) — legacy, superseded by the Supabase CMS; nothing imports it.
- **`src/App.css`**, **`src/hooks/use-mobile.tsx`** (only used by dead sidebar), the dead `.dark` palette + `gradient-hero` + `gold-soft` tokens.
- **Unused assets**: `aluma-u-mark.png/.svg`, `fabric-base-sofa.jpg`, `public/placeholder.svg`, `src/assets/blog/aluminum-profiles.jpg`, and the `public/blog/*.jpg` set (blog covers come from Supabase storage).

---

## Feature reality check

| Feature | Status |
|---|---|
| Questionnaire | ✅ Real — persists to Supabase, admin can read/export |
| Contact form | ✅ Real — honeypot + rate‑limit + edge function + email pipeline |
| Collections / Blog | ✅ Real — DB‑backed CMS with published flags |
| Customer Club / Favorites | ✅ Real — works, but happy‑path only (no password reset, optimistic writes don't roll back) |
| Sofa Designer | ⚠️ Decorative — a single‑row arranger; "corner" units have no geometric meaning; quote button broken; nothing persists |
| Fabric Configurator | ⚠️ Decorative — flat color‑multiply on one static image; patterns/textures collapse to a solid tint; quote button broken |
| AR Preview | ⚠️ Demo — loads generic Khronos sample models off a CDN; two "products" are the same file; iOS AR broken for 3 of 4 |
| Before/After | ⚠️ Fabricated — well‑built slider, fake "before" photos |
| Projects / Materials / FAQ | ⚠️ Hardcoded — still static TS files, not in the CMS |

---

## What's missing for production

- **Restore admin access** (#1, #2) and **make errors visible** (#3) — everything else is moot if you can't run the site.
- **Real content**: genuine testimonials, real project photography, real before/after, a working newsletter backend.
- **Consent that actually gates tracking** + honest privacy disclosure.
- **SSR/prerendering** — it's a client‑rendered SPA, so social/link previews and non‑JS crawlers see only the homepage's metadata for every page.
- **A real test suite + CI** (currently one placeholder test) and a dead‑code/dep linter (`knip`/`depcheck`) so this doesn't rot again.
- **One source of truth for brand facts** — the showroom address contradicts itself (Pardes Hanna vs. Yatzitz across pages), and the phone number is duplicated/faked in places.
- **A coherent design system** (see below).

---

## Design‑system notes (for our next phase)

This is where you said you'll drive with prompts, so treating it lightly for now — but the foundation to fix before styling:

1. **Rebuild the tokens honestly** — every named token should hold a distinct, correct value (a real espresso brown, a real gold if you want one, or delete the fake aliases). Fix `shadow-gold`'s green tint.
2. **Give it real typography** — a genuine display/editorial face distinct from the Heebo UI font, so "luxury" is expressed in type, not just weight.
3. **Decide dark mode** — implement it properly (brand‑derived palette + toggle) or delete it.
4. **Promote repeated patterns into real components** — one branded `Button`/CTA variant, a shared `PageHero`, `ContactCTA`, `RelatedGrid` (these hero/CTA blocks are copy‑pasted across ~11 pages), one `RtlCarousel`, one `WhatsAppIcon` + `wa.me` builder.
5. **Fix the radius scale** — `rounded-sm` currently computes to literally 0px.

---

## Suggested order of work

1. ✅ **Clean:** `git init` + delete dead code/deps/assets (#7). — **done, build passes.**
2. **Unblock:** fix admin lockout (#1) + profiles RLS (#2) + error handling (#3). _(This is the "make it actually work" step.)_
3. **De‑risk:** pull/replace fabricated content (#4), fix the dead phone numbers (#5), make consent real (#6).
4. **Redesign:** rebuild the design‑system foundation, then iterate on visuals with your prompts.
