# Aluma — what's left

The site is live at **https://alumaoutdoor.com** with the furniture on it.
Checked against the live site and the live database on 6 September.

| | |
|---|---|
| Domain | ✅ live, and `www` now redirects to it |
| Vercel publishing the right branch | ✅ |
| Collections | ✅ **6**, all visible |
| Products | ✅ **47**, all visible, every photo loading |
| Contact-form emails | ✅ arriving |
| Sign-in on the real domain | ⚠️ **Job 1 — 2 minutes** |
| Projects, reviews, colours | ⚠️ **Job 2 — still empty** |
| Email from the real domain | ⚠️ **Job 3 — setting up fresh** |

---
---

# JOB 1 — Finish the sign-in setup (2 minutes)

Google sign-in still sends people to the old preview address. The site now
catches that and carries them home, so it works — but the round trip is
avoidable and the setting should just be right.

1. **supabase.com/dashboard** → the **aluma** project.
   - ⚠️ The address bar must contain **`jzqayfllojeqivwbbuyf`**.
2. Left icon strip → **Authentication** → **URL Configuration**.
3. **Site URL** — change it to:

   ```
   https://alumaoutdoor.com
   ```

4. **Redirect URLs** → **Add URL**:

   ```
   https://alumaoutdoor.com/**
   ```

5. Leave the existing entries alone. Extra ones do no harm.
6. **Save.**

### Check it worked

Open **alumaoutdoor.com/admin/login**, sign in with Google, and watch the
address bar. You should stay on alumaoutdoor.com the whole way.

**✅ Tell me: "Job 1 done."**

---
---

# JOB 2 — The three things still empty

Everything below is content only. Nothing here is technical.

Go to **alumaoutdoor.com/admin**.

## Projects — 0 so far

**פרויקטים** → the dashed **מוצר חדש** tile. Name, location, description,
photos. The home page shows three.

Photos: **⁦2000 × 1333⁩**, landscape. Portrait phone shots get cropped here.

## Reviews — 0 so far

**המלצות לקוחות**. The section stays invisible on the site until there is at
least one, so an empty site never shows an empty box. Real quotes only, from
customers who agreed to be quoted.

## Colours — 0 so far

This is the one worth doing, because it is the feature customers notice.

Open any product → scroll to **צבעים**. Each colour needs a photo of *that
piece in that colour*, shot from the same angle as the main photo — otherwise
the furniture jumps when someone switches. **⁦1600 × 1600⁩**, square.

A new product already starts with white, so there is nothing to set up.

## While you are in there

Every screen works the same way now:

- A row is a **button** — click anywhere on it to open the thing.
- **Edit** and **delete** appear on the right when you point at a row.
- The **dashed tile** adds a new one, and sits in the same grid as the things
  it makes.
- The **drag handle** on the left of each row sets the order on the site.

**✅ Tell me when the projects and colours are in** — I will do a final pass
against real content.

---
---

# JOB 3 — Email from your own domain

Written against Resend's current documentation, September 2026. Their setup
changed this year, so anything you read elsewhere may be out of date.

**Start fresh.** Delete the old Resend account or just ignore it — you will
create a new API key at the end either way, and the old one stops working the
moment we swap it.

## Before you start — one thing to know

Until the domain is verified, Resend is in **test mode** and delivers **only to
the address you signed up with**. So if you register with your personal email,
test sends land there, not in the studio inbox. That restriction disappears the
moment the domain verifies — so signing up personally is fine, it just means
the halfway point looks odd.

Where the site's own messages land is a separate setting (`OWNER_EMAIL` in
Supabase, currently outdooraluma@gmail.com) and it does not change.

---

## Step A — the account (2 minutes)

1. Go to **resend.com** → **Sign Up**.
2. Use whichever email you like. Verify it when they email you.

## Step B — add the domain (5 minutes)

1. In the left menu click **Domains**, then **Add Domain**.
2. Type the subdomain — **not** the bare domain:

   ```
   notify.alumaoutdoor.com
   ```

   Resend's own recommendation: *"We recommend sending your emails from one or
   more subdomains instead of your root domain to isolate your sending
   reputation."* If our mail ever gets marked as spam, it can never damage
   alumaoutdoor.com itself.
3. It asks for a **region**. Choose the one closest to your customers —
   **eu-west-1 (Ireland)** for Israel.
4. If it offers a **custom Return-Path**, skip it. The default is fine.
5. Click **Add**.

You now get a table of DNS records. **Leave this tab open.**

## Step C — put those records into Namecheap (10 minutes)

⚠️ **Copy and paste every value.** Resend's most common support case is a DKIM
key typed by hand with a character missing.

1. New tab → **namecheap.com** → **Domain List** → **MANAGE** next to
   alumaoutdoor.com → the **Advanced DNS** tab.
2. For each row Resend shows, click **ADD NEW RECORD**.

**The one thing Namecheap does differently:** the **Host** field wants only the
part *before* `.alumaoutdoor.com`. Resend shows the whole name; you type the
front of it.

| Resend shows | You type in Host |
|---|---|
| `notify.alumaoutdoor.com` | `notify` |
| `send.notify.alumaoutdoor.com` | `send.notify` |
| `resend._domainkey.alumaoutdoor.com` | `resend._domainkey` |

You will get two or three records. Which ones depends on when the domain was
created — newer domains get **CNAME** records, older ones get **TXT and MX**.
Add whatever Resend actually shows you.

**If one of them is an MX record**, Namecheap has a gotcha: the **priority**
column has no label. It is the empty box after Value. Put **10** in it.

Set **TTL** to **Automatic** on every record, and click the **green tick** to
save each one.

## Step D — verify

1. Back in Resend, click **Verify**.
2. Their stated timing: *"often verify within 15 minutes"*, and DNS *"can
   occasionally take up to 72 hours"*. If it fails, wait and press **Restart
   verification** — it is almost always propagation, not a mistake.

## Step E — the key

Only once the domain shows **Verified**:

1. Left menu → **API Keys** → **Create API Key**.
2. **Name:** `aluma`. **Permission:** **Sending access**.
3. Click **Add**. Copy the `re_...` code immediately — Resend shows it once.

**✅ Send me the `re_...` key and I will swap it in.**

## Step F — DMARC, after it all works

Not required for verification, and not urgent. Once mail is flowing, add one
more TXT record at Namecheap:

- **Host:** `_dmarc`
- **Value:** `v=DMARC1; p=none; rua=mailto:outdooraluma@gmail.com;`

`p=none` only watches and reports. Resend: *"It's a best practice to use
quarantine or reject, but only do this once you know your messages are
delivering."* Tell me when it has been running a couple of weeks and we can
tighten it.

---
---

# Photo sizes

Every upload box states its own size, but here is the whole set:

| Photo | Make it | Shape |
|---|---|---|
| Home page main image | ⁦2400 × 1350⁩ | landscape |
| Collection image | ⁦1600 × 1600⁩ | square |
| Product photo | ⁦1600 × 1600⁩ | square |
| Product in a colour | ⁦1600 × 1600⁩ | square, same angle as the main photo |
| Project photo | ⁦2000 × 1333⁩ | landscape |
| Article photo | ⁦1600 × 1067⁩ | landscape |

Up to 8MB each, JPG or PNG. HEIC needs converting first.

**How to check a photo's size:** right-click → **Properties** → **Details** on
Windows; click once and press **Cmd+I** on a Mac. Look for "Dimensions".

**The two that catch people out:**
- The home page image is cropped much taller on a phone — keep the subject
  centred, away from the left and right edges.
- A collection image is shown as a square tile *and* as a wide banner. Leave
  air around the furniture or the wide crop cuts it.

---

# 📬 WHAT TO SEND ME

```
JOB 1  Supabase Site URL updated?     yes / no
JOB 2  Projects added?                yes / not yet
JOB 2  Colours on any product?        yes / not yet
JOB 3  Resend domain verified?        yes / not yet
JOB 3  New API key:                   re_...
```

**Never send me** the Supabase `service_role` key or any database password.
The `anon` key is fine — it is public by design and already ships inside the
website.

---

# Two things I could not fix in code

**The AR feature shows generic furniture.** "View it in your space" loads
sample 3D models from Google — a generic sofa, chair and table, not your
products. Real models have to be commissioned, roughly $250–500 per product
and 2–3 weeks. The page says plainly that they are demonstrations. **Say the
word and I will hide it** until real ones exist.

**The English site is partly translated.** The pages a customer walks through
are done — home, collections, product pages, projects, the journal, materials,
the club, About, 404 and thank-you. Still Hebrew under `/en`: the
questionnaire, the build-your-own pages, the club account screens, and the
legal and accessibility statements. I would leave the legal ones in Hebrew in
any case — they are legally meaningful documents for an Israeli business, and
a translation of mine is not the same document.
