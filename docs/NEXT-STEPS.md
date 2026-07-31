# What to do next — click by click

> ⚠️ **Superseded by [`GUIDE.md`](GUIDE.md).** That file covers the same ground
> in more detail, plus content uploading and the photo/asset shopping list, and
> it is the one being kept up to date. This file is retained only because the
> Cloudflare and Resend walkthroughs below are still accurate.

Written to be followed without knowing anything about DNS, hosting or email.
Do the blocks in order. Nothing here can break the live site.

If a screen doesn't look like what's written here, stop and ask rather than
guessing — these services change their layouts.

---

## The situation in four sentences

The website's code lives in this folder and on GitHub. The database, logins and
photos live on Supabase. Emails will be sent by a service called Resend. The
live site at alumaoutdoor.com is *still* running on Lovable's servers and will
keep running there, untouched, until we deliberately switch it over.

**The domain is stuck until ~11 August.** It was registered on 12 June through
Lovable, and ICANN forbids moving a domain for 60 days after registration.
Nothing you do before then can change that, so we work around it.

---

# BLOCK 1 — Resend (≈5 minutes)

**What this gets you:** the ability to send real emails — signup confirmations,
password resets, and a notification when someone fills in the contact form.

### 1.1 Make the account

1. Open **resend.com**
2. Click **Sign up** (top right)
3. Sign up with **outdooraluma@gmail.com**
   - ⚠️ This specific address matters. Until we own the domain, Resend will only
     deliver test emails to the address the account was created with. Use a
     different one and no test email will arrive anywhere.
4. If it asks you to choose a region, pick **EU (Ireland)**
5. If it asks "what do you want to do", pick anything — it doesn't change setup

### 1.2 Skip the domain step

Resend will push you to "Add a Domain". **Skip it.** There's a link like
*"I'll do this later"* or you can just click **Domains** away in the sidebar.
We can't verify a domain we don't control yet. Test emails work without it.

### 1.3 Create the API key

1. In the left sidebar click **API Keys**
2. Click **Create API Key**
3. Fill in:
   - **Name:** `aluma-dev`
   - **Permission:** choose **Sending access**
   - **Domain:** leave as whatever it defaults to
4. Click **Add**
5. A long key appears starting with **`re_`**

⚠️ **Copy it now.** Resend shows it exactly once and never again. Paste it into
a note, then send it to me.

**→ SEND ME: the `re_...` key**

---

# BLOCK 2 — Supabase (≈5 minutes)

Go to **supabase.com/dashboard** and open the project called **aluma**.

> Double-check you're in the right one. The correct project reference is
> `jzqayfllojeqivwbbuyf`. There's an older project — don't touch it.

### 2.1 Get the public key

1. Bottom-left, click the **gear icon** (Project Settings)
2. In that menu click **API**
3. Find the section **Project API keys**
4. There are two keys. You want the one labelled **`anon`** and **`public`**.
   Click the copy icon next to it.

⚠️ The other key says **`service_role`** and is usually hidden behind a "Reveal"
button. **Never copy or send that one to anybody, including me.** It bypasses
every security rule in your database. The `anon` key is designed to be public —
it's already visible in your website's code — so it's safe to send.

**→ SEND ME: the `anon` / `public` key**

### 2.2 Turn on the email hook

This is what makes Supabase use your branded Hebrew emails instead of its own
plain English ones.

1. In the far-left icon bar, click **Authentication** (the little person icon)
2. In the menu that appears, click **Hooks**
3. Find the row called **Send Email Hook**
4. Click **Enable** (or the toggle next to it)
5. A form appears. Fill it in:
   - **Type:** choose **HTTPS**
   - **URL:** paste exactly this:
     ```
     https://jzqayfllojeqivwbbuyf.supabase.co/functions/v1/auth-email-hook
     ```
6. Click **Generate secret**
7. A value appears starting with **`v1,whsec_`** — copy the **whole thing**,
   including the `v1,whsec_` bit at the front
8. Click **Save** / **Create**

**→ SEND ME: the `v1,whsec_...` secret**

### 2.3 Nothing else here

Storage buckets, database tables and the backend functions are all already
done. You don't need to touch them.

---

# BLOCK 3 — Cloudflare Pages (≈10 minutes)

**What this gets you:** a real, live, shareable web address for the new site —
something like `aluma-4k2.pages.dev` — that you can send your client. The old
site at alumaoutdoor.com carries on completely unaffected.

### 3.1 Account

1. Open **dash.cloudflare.com**
2. Sign up / log in (free — no card needed for this)

### 3.2 Connect the repository

1. In the left sidebar find **Workers & Pages** (also labelled "Compute" in some
   layouts)
2. Click **Create**
3. Choose the **Pages** tab
4. Click **Connect to Git**
5. Click **Connect GitHub**, and authorise Cloudflare when GitHub asks
   - When GitHub asks which repositories, you can pick **only** `ALUMA` rather
     than granting access to everything
6. Back in Cloudflare, select the repo **`yuvalcohen2006/ALUMA`**
7. Click **Begin setup**

### 3.3 Build settings

Fill the form in exactly:

| Field | Value |
|---|---|
| Project name | `aluma` (or anything — it becomes part of the URL) |
| Production branch | `main` |
| Framework preset | **Vite** |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *leave empty* |

### 3.4 Environment variables

Still on the same page, find **Environment variables** and expand it. Click
**Add variable** three times and enter these:

| Variable name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://jzqayfllojeqivwbbuyf.supabase.co` |
| `VITE_SUPABASE_PROJECT_ID` | `jzqayfllojeqivwbbuyf` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | *the anon key from step 2.1* |

All three are safe to store here — they're public values that ship to the
browser anyway.

### 3.5 Deploy

1. Click **Save and Deploy**
2. Wait ~2 minutes. You'll see a build log scrolling.
3. When it finishes you get a URL ending in **`.pages.dev`** — open it.

**→ SEND ME: that `.pages.dev` URL**

### 3.6 Do NOT do the custom domain step

Cloudflare will invite you to add a custom domain. **Skip it.** That's for after
11 August, and doing it now would point alumaoutdoor.com at a site we haven't
finished reviewing.

---

# BLOCK 4 — after ~11 August: the domain

Don't attempt any of this before then; ICANN will simply refuse.

### Step 1 — get control

You need whoever administers the Lovable workspace to either:

- **(preferred) Release it.** Ask them to unlock the domain and send you the
  **EPP / authorisation code**. Then you can transfer it to a registrar in your
  client's own name. Cloudflare Registrar is a good target — it sells domains at
  cost and puts DNS and hosting in one place.
- **(faster) Delegate DNS.** Ask them to point the domain at custom nameservers
  and give you the Cloudflare ones. Lovable still owns the registration, but you
  control all the records.

### Step 2 — verify the sending domain in Resend

1. Resend → **Domains** → **Add Domain**
2. Enter **`notify.alumaoutdoor.com`** — the subdomain, not the bare domain
   - Why a subdomain: the bare domain will point at your website. Keeping email
     on `notify.` avoids any clash, and means a future spam problem can never
     damage the main domain's reputation.
3. Resend shows a table of DNS records. Add each one wherever DNS now lives.
4. Click **Verify**

### Step 3 — flip the sender

Tell me it's verified and I run:

```bash
npx supabase secrets set RESEND_FROM="Aluma <noreply@notify.alumaoutdoor.com>"
npx supabase secrets unset OWNER_EMAIL
```

That's it. No code change — the sender address is already a setting.

### Step 4 — point the domain at the new site

Cloudflare Pages → your project → **Custom domains** → **Set up a custom
domain** → `alumaoutdoor.com`. This is the moment the live site actually
switches. Do it only when you're happy with what's on the `.pages.dev` URL.

---

# What to send me, all together

- [ ] Resend API key — `re_...`
- [ ] Supabase **anon/public** key
- [ ] Auth hook secret — `v1,whsec_...`
- [ ] Your `.pages.dev` URL

**Never send:** the Supabase `service_role` key, or the database password.

---

# Meanwhile: looking at the site locally

```bash
npm run dev
```

Then open **http://localhost:8080**.

Worth looking at, since none of it has been seen in a browser yet:

| Page | What's new |
|---|---|
| `/` | New buttons, white scroll chevrons, category hover-focus, Hebrew wordmark |
| `/materials` | Rebuilt dark, small cards |
| `/collections` | All 20 generated products, working filter drawer |
| `/projects` | Numbered editorial index |
| `/diy` | Brand-new page |
| `/blog`, `/faq`, `/contact`, `/club` | All rebuilt |

The 20 products are placeholder content for judging layout — they're not real
Aluma products and they only appear in local development.
