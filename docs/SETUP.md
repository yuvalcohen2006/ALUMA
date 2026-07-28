# Aluma — setup & architecture

The single source of truth for how this project is put together and how to get
it running. Replaces the older scattered notes (`GUIDE.md`, `ASSESSMENT.md`,
`nightfixes.md`, `.lovable/plan.md`), which were historical status reports and
have been removed — they live in git history if ever needed.

---

## 1. The architecture, in one table

Three services. Nothing else.

| Layer | Service | Responsibility |
|---|---|---|
| Frontend | **React + TypeScript + Vite** → static build → **Cloudflare Pages** | The site. Builds to `dist/`, served at alumaoutdoor.com |
| Backend | **Supabase** (project `jzqayfllojeqivwbbuyf`) | Postgres (products, collections, blog, projects, leads, orders), Auth (customers + admin), Storage (all photos) |
| Email | **Resend** | Password resets, signup confirmations, contact-form notifications — sent from your own domain |

No Lovable. No other third parties. If something isn't in that table, it isn't
part of how the site runs.

### Running cost

| Item | Cost |
|---|---|
| Supabase Pro | **$25/mo** |
| Resend | **$0** (free tier: 3,000 emails/mo, 100/day, 1 domain) |
| Cloudflare Pages | **$0** |
| Domain renewal | ~$12–15/year |
| **Total** | **≈ $25/month** |

Why Pro and not Supabase's free tier: free projects **pause after 7 days of
inactivity**. Unacceptable for a client's live site.

Why photo storage isn't a cost worry: 100 products × 5 photos × 400 KB ≈ 200 MB.
Pro includes 100 GB file storage and 250 GB egress. You'd need roughly 80,000
page views a month to approach the egress cap.

Resend only becomes $20/mo if you start sending newsletter campaigns to a large
list. Transactional email for a site this size stays comfortably free.

---

## 2. What YOU need to do (manual setup)

Four blocks. They're independent — do them in any order. Everything else is code
and is being handled separately.

### Block A — Resend (email)

**Goal: an API key starting `re_`, and alumaoutdoor.com verified as a sender.**

1. Go to **resend.com** → **Sign up** (GitHub / Google / email — any is fine).
2. When asked to pick a **region**, choose **EU (Ireland)** — closest to Israel,
   best delivery times, and keeps EU data residency.
3. In the left sidebar click **Domains** → **Add Domain**.
4. Enter **`notify.alumaoutdoor.com`** (exactly that — a subdomain, not the root
   domain, and no `https://`).

   > **Why a subdomain:** the root `alumaoutdoor.com` is going to point at
   > Cloudflare Pages for the website. Keeping email DNS on `notify.` avoids any
   > clash there, leaves you free to add Google Workspace email on
   > `@alumaoutdoor.com` later, and means a spam problem could never damage your
   > main domain's reputation. It's what the code already expects.
5. Resend now shows you a table of **DNS records** — typically 3–4 rows
   (an `MX`, one or two `TXT` for SPF/DKIM, sometimes a `_dmarc` `TXT`).
   **Leave this page open.**
6. Go to wherever alumaoutdoor.com's DNS is managed (your domain registrar, or
   Cloudflare if the domain is already there) and add each record **exactly** as
   shown — name, type, value, and priority. Copy/paste; do not retype, the DKIM
   value is a very long string and one wrong character breaks it.
   - If your registrar auto-appends the domain name, enter just the `send` or
     `resend._domainkey` part, not the full `send.alumaoutdoor.com`.
7. Back in Resend, click **Verify**. It usually goes green in a few minutes;
   DNS can occasionally take up to an hour. You can carry on meanwhile.
8. Sidebar → **API Keys** → **Create API Key**.
   - Name: `aluma-production`
   - Permission: **Sending access** (not Full access — it only needs to send)
   - Domain: `notify.alumaoutdoor.com`
9. **Copy the key immediately** — it starts `re_` and is shown **once only**.
   Paste it somewhere safe.

**→ Send me: the API key (`re_...`).**

---

### Block B — Supabase dashboard (buckets + keys + auth hook)

Open **supabase.com/dashboard** → project **aluma** (`jzqayfllojeqivwbbuyf`).
This is the NEW project — make sure you're not in the old one.

#### B1. Get the anon key

1. **Project Settings** (gear, bottom left) → **API**.
2. Under **Project API keys**, copy the key labelled **`anon`** / **`public`**.
   - This one is *designed* to be public and ships to the browser — it is safe
     to send to me.
   - Do **NOT** send the `service_role` key. That one is a full-access
     master key and must never leave the dashboard.

**→ Send me: the `anon` / `public` key.**

#### B2. Storage buckets — ✅ already done, nothing to click

The four photo buckets (`site-projects`, `site-hero`, `blog-images`,
`site-collections`) now exist and are public. They're created by migration
`20260728090100_storage_buckets.sql`, so any future project gets them from
`db push` alone — they used to exist only because someone made them by hand,
which is why a fresh project had the access rules but not the buckets.

#### B3. Configure the auth email hook

The function is **already deployed** — you can do this now.

1. **Authentication** → **Hooks** (left sidebar).
2. Find **Send Email Hook** → **Enable**.
3. Type: **HTTPS**.
4. URL: `https://jzqayfllojeqivwbbuyf.supabase.co/functions/v1/auth-email-hook`
5. Click **Generate secret**. A value appears starting `v1,whsec_...`.
6. **Copy that whole secret**, including the `v1,whsec_` prefix.

**→ Send me: the hook secret (`v1,whsec_...`).**

---

### Block C — Cloudflare Pages (hosting)

**Goal: the site building automatically from GitHub and served at alumaoutdoor.com.**

Do this once I've confirmed the code changes are committed and pushed.

1. Sign in at **dash.cloudflare.com** (create a free account if needed).
2. Left sidebar → **Workers & Pages** → **Create** → **Pages** tab →
   **Connect to Git**.
3. Authorise Cloudflare to access GitHub, then pick the repo
   **`yuvalcohen2006/ALUMA`**.
4. **Build settings:**
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: leave blank
5. **Environment variables** — click *Add variable* three times. These are the
   same values from Block B1:
   ```
   VITE_SUPABASE_URL              https://jzqayfllojeqivwbbuyf.supabase.co
   VITE_SUPABASE_PROJECT_ID       jzqayfllojeqivwbbuyf
   VITE_SUPABASE_PUBLISHABLE_KEY  <the anon key from B1>
   ```
   These are build-time variables and all three are safe to store here.
6. **Save and Deploy.** First build takes ~2 minutes. You'll get a
   `*.pages.dev` URL — check the site loads there before going further.
7. **Custom domain:** in the new Pages project → **Custom domains** →
   **Set up a custom domain** → `alumaoutdoor.com`. Cloudflare tells you which
   DNS records to change.
   - If alumaoutdoor.com's DNS is *already* on Cloudflare, this is one click.
   - If it's at another registrar, Cloudflare will ask you to either point
     nameservers at Cloudflare (recommended — makes Block A's records easier to
     manage too) or add a `CNAME`.

> **Careful:** if you move nameservers to Cloudflare, any DNS records you added
> in Block A must be re-created in Cloudflare's DNS panel, or email verification
> will break. Easiest order: move DNS to Cloudflare **first**, then do Block A's
> records there.

---

### Block D — where the old site is served from

Nobody currently knows where alumaoutdoor.com points (there's no deploy config
in this repo). Before pointing the domain at Cloudflare, check what's serving it
today so you don't take the live site down mid-switch. If it turns out to be
Lovable's hosting, that's the last Lovable dependency and this migration removes it.

---

## 3. What to send me, in one list

- [ ] Resend API key — `re_...` (Block A)
- [ ] Supabase **anon/public** key (Block B1)
- [ ] Auth hook secret — `v1,whsec_...` (Block B3)

Never send: the Supabase `service_role` key, or your database password.

### Google sign-in — one extra decision

The "Continue with Google" button on `/club/auth` used to run through Lovable's
auth service. It now uses Supabase's own Google OAuth, which needs credentials
from Google before it will work:

1. **console.cloud.google.com** → create a project (or reuse one).
2. **APIs & Services** → **Credentials** → **Create Credentials** →
   **OAuth client ID** → type **Web application**.
3. Authorised redirect URI:
   `https://jzqayfllojeqivwbbuyf.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client secret**.
5. Supabase dashboard → **Authentication** → **Providers** → **Google** →
   enable, paste both, save.

If you'd rather not deal with this now, say so and I'll hide the Google button —
email and password signup works without it. Right now the button is visible but
will error until the above is done.

---

## 4. What I'm changing in code

- **`supabase/functions/auth-email-hook`** — replaces Lovable's webhook
  verification (`@lovable.dev/webhooks-js`) with the standard
  `standardwebhooks` library that Supabase's own auth hook uses, and sends via
  Resend instead of queuing.
- **`supabase/functions/process-email-queue`** — removed. The queue it drained
  is going away.
- **New migration** — cleanly drops the queue machinery Lovable built: the
  `pgmq` queues and dead-letter queues, `pg_cron`/`pg_net` scheduling, the
  vault secret, and the `email_queue_wake` / `email_queue_dispatch` functions
  (which were never in a migration and are what broke the original `db push`).
- **Email templates** — unchanged. They're built with `@react-email/components`,
  which is made by Resend, so they already work natively.
- **`src/lib/admin-storage.ts`** — currently stores 1-year **signed** URLs,
  meaning every product photo would break exactly a year after upload. Switching
  to public-bucket URLs: permanent, and cheaper because they cache on the CDN.

### Why the email queue is being removed

Lovable built an elaborate pipeline — message queues, dead-letter queues, a
cron job polling every 5 seconds, a vault-stored key. For a site sending a few
dozen emails a day this is over-engineered, and two of its pieces were never
captured in a migration so they can't be reproduced on a fresh project. Sending
directly through Resend from the auth hook is what Supabase documents, removes
six moving parts, and gets password-reset emails to people faster. The
`email_send_log` audit table stays.

---

## 5. Local development

```bash
npm install
cp .env.example .env    # PowerShell: copy .env.example .env
npm run dev             # → http://localhost:8080
```

`.env` needs all three `VITE_SUPABASE_*` values or the app won't mount.

**Collections page in dev:** while the new database is empty, the collections
page falls back to a placeholder catalogue (`src/data/demoCollections.ts`) —
20 invented products across 5 categories, used to check the layout and filters.
Real database rows always take priority, and production never shows it. Force it
on against a populated database with `/collections?demo=1`. Delete that file and
its dynamic import in `src/hooks/useCollectionsData.ts` to remove it entirely.

---

## 6. Reference

**Supabase project:** `jzqayfllojeqivwbbuyf` (name `aluma`, region `eu-central-1`)
**Old project being retired:** `yvxynsonjmcppaxflmvz`

**Edge function secrets** (set via `npx supabase secrets set KEY=value`):

| Secret | Purpose |
|---|---|
| `RESEND_API_KEY` | Sending email |
| `SEND_EMAIL_HOOK_SECRET` | Verifying auth-hook requests really came from Supabase |

All `SUPABASE_*` secrets are auto-provisioned by the platform — you don't set those.

**Migrations:** `supabase/migrations/`, applied with `npx supabase db push`.
**Edge functions:** `supabase/functions/`, deployed with
`npx supabase functions deploy <name>`.

**Known issue, pre-existing:** the admin panel has ~14 `any`-typed values that
trip the linter. Not introduced by recent work; worth cleaning up eventually.
