# What to do next — click by click

Written to be followed without knowing anything about DNS, hosting or email.
Nothing here can break the live site.

If a screen doesn't look like what's written here, stop and ask rather than
guessing — these services change their layouts.

---

## Where things actually stand

**Blocks 1, 2 and 3 below are DONE.** Resend is live, the Supabase project is
`jzqayfllojeqivwbbuyf` with both secrets set, the auth email hook is on, and the
site builds and deploys on Cloudflare Pages. Email was proven end to end: a real
signup produced a branded Hebrew email, and a real contact-form submission
produced both a lead row and an owner notification. They are kept below as a
record of what was configured, and to redo if anything is ever lost.

**Only two things are left, and one of them is just waiting for a date.**

### 1. The domain, from ~11 August — see BLOCK 4

alumaoutdoor.com is still served by Lovable and stays there, untouched, until we
deliberately switch. It was registered on 12 June through Lovable and ICANN
forbids moving a domain for 60 days, so nothing before ~11 August will work.

### 2. Photographs — this is the real remaining work

The catalogue, the magazine and the project pages currently run on
**generated placeholder images**, and the site is honest about it: none of them
are in the published build, and `npm run build` now fails outright if any ever
sneak in. What that means in practice:

- In production the catalogue shows whatever is actually in the database. If
  that is empty, the pages say so plainly rather than inventing furniture.
- Locally (`npm run dev`) you see 20 demo products so the layouts can be judged
  against realistic content.

So the site is finished; the *content* is what it is waiting on. Three things
would each visibly lift it, in order of impact:

1. **Real product photography** — the single biggest one. Three angles per
   piece: the hero shot, a detail, and one in a real space.
2. **Real customer quotes.** The homepage testimonials are invented and are
   hidden in production for that reason. Two or three real ones turn that
   section back on.
3. **Before/after pairs.** Project pages have a working before/after slider that
   appears the moment a project has a genuine "before" photograph. There is
   deliberately no substitute: showing a stock photo as a customer's "before"
   would be inventing a transformation.

---

# BLOCK 1 — Resend (≈5 minutes)

**What this gets you:** the ability to send real emails — signup confirmations,
password resets, and a notification when someone fills in the contact form.

### 1.1 Make the account

1. Open **resend.com**
2. Click **Sign up** (top right)
3. Sign up with **yuval.cohen006@gmail.com**
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

# BLOCK 4 — after ~11 August: the domain  ← THE ONE THAT IS STILL OPEN

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

# What I still need from you

- [x] Resend API key — received and set
- [x] Supabase **anon/public** key — received and set
- [x] Auth hook secret — received and set
- [ ] **Your `.pages.dev` URL** — so deep links can be verified against the real
      host (`/collections/<slug>` and `/blog/<slug>` must load directly, not
      just by clicking through; that is what `public/_redirects` is for)
- [ ] Confirmation the Resend sending domain is verified, after ~11 August

**Never send:** the Supabase `service_role` key, or the database password.
Those are the two that can actually cause damage. Everything above is either
public by design or scoped to sending mail.

---

# Meanwhile: looking at the site locally

```bash
npm run dev
```

Then open **http://localhost:8080**.

Worth looking at — every page has been rebuilt since you last saw it:

| Page | What's there now |
|---|---|
| `/` | Hero film over the still (poster-first, so it never slows the first paint), the "אלומה, על שם האור" sun-slider, a magazine strip, category tiles that link to real filters |
| `/collections/<any product>` | Rebuilt product page: gallery with lightbox, sticky spec panel, clickable material chips, showroom-booking band. The photo flies from the grid into the page on Chrome and Edge |
| `/materials` | Dark, small cards |
| `/collections` | 20 demo products, filter drawer on the right |
| `/projects` | Numbered editorial index; project pages gained a before/after slider that appears once a real pair exists |
| `/story` | "אור" thickens as you scroll |
| `/ar` | Rebuilt. Honest empty state until we have our own 3D models — it used to show three sample sofas from Google's demo site as if they were ours |
| `/diy`, `/blog`, `/faq`, `/contact`, `/club`, `/questionnaire` | All rebuilt |

Two things to try that are easy to miss:

- **The accessibility widget's font slider** (bottom corner) now moves *all* the
  text, including every button. It previously moved only some of it, which
  mattered because the site publishes an accessibility statement promising it.
- **A phone, or a narrow browser window.** This is the one thing that could not
  be checked from here, and it is where problems hide in Hebrew layouts.

The 20 products are placeholder content for judging layout — they're not real
Aluma products and they never appear anywhere but your own machine.
