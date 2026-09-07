# Aluma — what's left for you to do

Five jobs. Do them in order — the first one unblocks the rest.

Every menu name below was checked against these consoles on **7 September 2026**.
Where something has changed recently, or where I could not check it myself, it
says so.

| | |
|---|---|
| **Job 1** | Run one database script · **5 min** · ⚠️ everything else waits on this |
| **Job 2** | Fix the sign-in address · 2 min |
| **Job 3** | Fill in the new fields · 20 min |
| **Job 4** | Add the missing content · your own pace |
| **Job 5** | Email from your own domain · 20 min + waiting |

---

# JOB 1 — Run one database script

This adds English names, the product labels, and the home-page picker. Until
you do it, those parts of the admin will not work.

### Get the script

The file is in the project, at:

```
supabase/migrations/20260907120000_english_names_emblems_highlights.sql
```

Open it in any text editor (Notepad is fine), press **Ctrl+A** to select all,
then **Ctrl+C** to copy.

### Run it

1. Go to **supabase.com/dashboard** and sign in. Click the **aluma** project.
   - ⚠️ The address bar must contain **`jzqayfllojeqivwbbuyf`**.

2. **Look at the far-left edge of the window.** It is a narrow strip of icons
   with **no words**. The words only appear when you move the mouse onto it.
   This catches everyone.

   If you would rather the words stayed put: click the small panel icon at the
   very **bottom** of that strip and choose **Expanded**.

3. Hover the strip and click **SQL Editor** — the **second** item down.
   (*Table Editor* is first.)

4. It opens straight into an empty editor. Click in the big empty box and
   **paste** (Ctrl+V).

5. Click the green **Run** button, bottom right. (Ctrl+Enter does the same.)

   ⚠️ If the button says **Run selected**, some text is highlighted and it will
   only run that part. Click once in the box to clear the highlight first.

### What success looks like

One short line appears at the bottom:

> **Success. No rows returned**

**That is success.** "No rows" means "there was no table of results to show
you" — not "nothing happened". This is the single most common false alarm.

**A failure looks completely different:** a red line starting with `Error:`,
with a copy icon next to it. If you see that, nothing was changed — copy it and
send it to me.

### ⚠️ A warning WILL appear first — this is expected

Before it runs, Supabase shows a box titled **Potential issue detected** saying
**"This query includes destructive operations"**, with **Cancel** and
**Run query**.

**Click "Run query".** I checked the script against what Supabase looks for,
and it trips the warning on two harmless lines: it re-creates a permission rule
(the word *drop*), and it removes one unused row of website text (the word
*delete*). It does not delete any of your furniture, photos or customers.

If a **different** pop-up appears, click **Cancel** and send me a screenshot.

### Check it worked

Hover the left strip → **Table Editor** (the top item) → click
**site_collection_products**.

Look along the very top row of headings and **scroll all the way right** — new
columns are added at the end, so they start off-screen. You should find
**name_en** and **emblem**.

**✅ Tell me: "Job 1 done."**

---

# JOB 2 — Fix the sign-in address (2 minutes)

Google sign-in still sends people to the old preview address. The site catches
it and carries them home, so it works — but it should just be right.

1. Same dashboard, same project.
2. Left strip → **Authentication**.
3. In the menu that opens, scroll to the grey heading **Configuration** —
   headings are labels, not buttons — and click **URL Configuration**.
4. First box, **Site URL**. Set it to exactly:

   ```
   https://alumaoutdoor.com
   ```

5. Click **Save changes** (bottom right of that white card). It stays greyed
   out until you actually change the text. A green *Successfully updated site
   URL* confirms it.

6. Scroll to the second section, **Redirect URLs**, and click **Add URL** above
   the list on the right.

7. In the dialog, type:

   ```
   https://alumaoutdoor.com/**
   ```

8. Click **Save URLs**.

Leave everything already in the list alone.

> **Changed recently:** older guides call this box *Additional Redirect URLs*
> and say to type into it directly. It is a pop-up dialog now.

**Check it:** open **alumaoutdoor.com/admin/login**, sign in with Google, and
watch the address bar. You should stay on alumaoutdoor.com the whole way.

**✅ Tell me: "Job 2 done."**

---

# JOB 3 — Fill in the new fields (20 minutes)

All of this is in **alumaoutdoor.com/admin**. None of it works before Job 1.

## Pick the three products for the home page

**מוצרים נבחרים** in the sidebar. Click three photos. The number on each shows
the order they appear in. Click a chosen one again to remove it. **שמירה** to
save.

Until you pick, the site chooses three for you.

## English names

Every collection and product now has an English name field beside the Hebrew
one. **You cannot publish without both.**

- **Collections:** קולקציות ומוצרים → the pencil on a collection → **השם באנגלית**
- **Products:** click a collection → click a product → **השם באנגלית**

There are 47 products. They stay live in the meantime — the rule only bites
when you next edit one, and the English site falls back to the Hebrew name
until then. So do them when you have a quiet hour, not tonight.

## Labels on products

On any product page there is a **תווית** dropdown: *מבוקש*, *חם עכשיו*, *חדש*,
or none.

Two things worth knowing:

- **The site shows at most one label per row.** That is deliberate — a label on
  half the products means nothing.
- **"חדש" sets itself.** The five most recently added pieces get it
  automatically. You only need this dropdown to override that.

My honest opinion on **חם עכשיו**: it is the one that reads like a discount
shop, and it is a claim you would have to be able to stand behind. Yours to
decide — say the word and I will remove it from the list.

## The crop tool

Any photo you upload now opens a window first: **drag it to choose what goes in
the frame, scroll to zoom.** Everything outside the frame goes grey.

On the right you see **every shape the site will really use it in**. A product
photo gets cut three different ways, so check all three before saving — that is
what stops a chair losing its legs on the home page.

---

# JOB 4 — The content that is still empty

## Projects — I put six placeholders in

They have photographs and text now, but they are **invented examples**, not
your work. Replace them when you have real ones. **פרויקטים** in the sidebar.

## Reviews — 0 so far

**המלצות לקוחות**. The section stays invisible until there is at least one, so
an empty site never shows an empty box. Real quotes only, from customers who
agreed to be quoted.

## Colours — 0 so far

This is the one worth doing, because customers notice it.

Open any product → **צבעים**. Each colour needs a photo of *that piece in that
colour*, from the same angle as the main photo — otherwise the furniture jumps
when someone switches. A new product starts with white already set up.

---

# JOB 5 — Email from your own domain

⚠️ **Resend changed their setup in August 2026.** Any other guide you find —
including Resend's own Namecheap page — will tell you to add an **MX** record
and two **TXT** records. A domain you add today probably gets **CNAME** records
instead.

**So: do not follow a record list from anywhere, including me. Copy exactly
what Resend's own screen shows you.**

## A — The account

Go to **resend.com** and sign up. Any email address is fine.

**Know this before you start:** until the domain is verified you can only send
to the address you signed up with, and only from `resend.dev`. That is normal.
It goes away the moment the domain verifies.

## B — Add the domain

1. **Domains** in the left menu → **Add Domain**.
2. Type the **subdomain**, not the bare domain:

   ```
   notify.alumaoutdoor.com
   ```

   Resend's own advice — a subdomain keeps any spam problem away from
   alumaoutdoor.com itself.
3. **Region:** choose **Ireland (eu-west-1)**.
4. If it offers a **custom Return-Path**, leave it alone.
5. Click **Add**.

You land on a **Records** tab. **Leave this open.**

## C — Put those records into Namecheap

⚠️ **Copy and paste every value.** A DKIM key typed by hand with one character
missing is Resend's most common support case.

1. **namecheap.com** → **Sign In** → **Domain List** in the left sidebar.
2. Find alumaoutdoor.com, click **MANAGE** at the far right of its row.
3. Click the **Advanced DNS** tab.
4. Scroll **past** the *DNS TEMPLATES* section to **HOST RECORDS**.

**First, delete the two parking records** if they are still there — they will
fight with what you are adding:
- a **URL Redirect Record** on host `@`
- a **CNAME Record** on host `www` pointing at `parkingpage.namecheap.com`

Delete them with the bin icon at the end of each row.

5. Click **ADD NEW RECORD** — it is the red circle-plus **below** the existing
   rows, not above them.

**The one thing Namecheap does differently:** the **Host** field takes only the
part *before* `.alumaoutdoor.com`.

| Resend shows | You type in Host |
|---|---|
| `notify.alumaoutdoor.com` | `notify` |
| `send.notify.alumaoutdoor.com` | `send.notify` |
| `resend._domainkey.alumaoutdoor.com` | `resend._domainkey` |

6. Leave **TTL** on **Automatic**.
7. Click the **green tick** at the end of the row, then **SAVE ALL CHANGES**
   below the table. People miss the second one.

### If — and only if — Resend gives you an MX record

**MX records are not in that table at all.** This is where my previous guide
was wrong.

Scroll further down the same page to **MAIL SETTINGS**, open its dropdown and
choose **Custom MX**. Only then can you add the row.

The **priority** goes in the **blank unlabelled column between Value and TTL**.
Type `10` there. Save that section with its own **SAVE CHANGES** button.

## D — Verify

Back in Resend, click **Verify DNS Records**.

Usually under 15 minutes. It can take up to 72 hours. If it fails, wait and
press **Restart verification** — it is nearly always propagation, not a
mistake.

## E — The key

Only once the domain says **Verified**:

1. **API Keys** → **Create API Key**.
2. Name it `aluma`. Permission: **Sending access**.
3. **Copy the `re_...` code immediately.** Resend shows it once and never
   again.

**✅ Send me the `re_...` key and I will put it in.**

## F — Later, once mail is flowing

Add one more TXT record at Namecheap. Not urgent, and not needed for anything
to work:

- **Host:** `_dmarc`
- **Value:** `v=DMARC1; p=none; rua=mailto:outdooraluma@gmail.com;`

`p=none` only watches and reports. Tell me when it has been running a couple of
weeks and we can tighten it.

---

# Photo sizes

Every upload box states its own size, and the crop tool shows you the result —
so this is only for shooting or choosing photos in advance.

| Photo | Make it | Shape |
|---|---|---|
| Home page main image | ⁦2400 × 1350⁩ | landscape |
| Collection image | ⁦1500 × 2000⁩ | **portrait** |
| Product photo | ⁦1600 × 1600⁩ | square |
| Product in a colour | ⁦1600 × 1600⁩ | square, same angle as the main photo |
| Project photo | ⁦2000 × 1333⁩ | landscape |
| Article photo | ⁦1600 × 1067⁩ | landscape |

Up to 8MB, JPG or PNG. HEIC from an iPhone is now refused rather than uploading
broken — convert it first.

**How to check a photo's size:** right-click → **Properties** → **Details** on
Windows; click once and press **Cmd+I** on a Mac.

**The two that catch people out:**
- The home page image is cropped much taller on a phone. The crop tool shows
  you the phone version — check it.
- A collection image is **portrait**, not square. That changed: the site shows
  it tall in two places and never as a square.

---

# 📬 WHAT TO SEND ME

```
JOB 1  Database script run?            yes / no
JOB 2  Sign-in address updated?        yes / no
JOB 3  Three home products picked?     yes / not yet
JOB 3  English names started?          yes / not yet
JOB 4  Real projects, reviews, colours? yes / not yet
JOB 5  Resend domain verified?         yes / not yet
JOB 5  New API key:                    re_...
```

**Never send me** the Supabase `service_role` key or any database password.
The `anon` key is fine — it is public by design and already inside the website.

---

# Three things I could not fix in code

**The projects are placeholders.** Six invented case studies with generated
photographs, so the page is not empty while you gather real ones. Nothing on
that page describes work Aluma actually did.

**The AR feature shows generic furniture.** "View it in your space" loads
sample 3D models from Google — a generic sofa, chair and table, not your
pieces. Real models cost roughly $250–500 each and take 2–3 weeks. The page
says plainly that they are demonstrations. **Say the word and I will hide it.**

**The English site is partly translated.** The pages a customer walks through
are done — home, collections, products, projects, journal, materials, club,
About, 404, thank-you. Still Hebrew under `/en`: the questionnaire, the
build-your-own pages, the club account screens, and the legal pages. I would
leave the legal ones in Hebrew regardless — they are legally meaningful
documents for an Israeli business, and a translation of mine is not the same
document.
