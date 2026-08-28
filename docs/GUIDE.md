# Aluma — the setup guide

**What this is:** every remaining step to take the site from "finished code" to
"live and ready to hand over", written click by click. It assumes nothing.

**How to read it:** do Part 1 in order — each job unlocks the next. Part 2 is
filling the site with real content. Part 3 is the photography you still need
from a photographer.

**The golden rule:** if a screen doesn't look like what's written here, **stop
and ask me** rather than guessing. These websites change their layouts, and
clicking the wrong thing is much harder to undo than to avoid.

**A note on the words used below:**
- *Click* = press the left mouse button once.
- *The address bar* = the wide box at the very top of your browser window where
  web addresses appear.
- *Copy* = hold `Ctrl` and press `C`. On a Mac, `Cmd` and `C`.
- *Paste* = hold `Ctrl` and press `V`. On a Mac, `Cmd` and `V`.

---
---

# PART 1 — THE FIVE JOBS

Do these in order. About 45 minutes of work, plus a wait for the domain.

| # | Job | Time | Why it matters |
|---|---|---|---|
| 1 | Run one SQL script | 5 min | Without it, three admin screens error when you save |
| 2 | Get into the admin | 10 min | You can't add products without it |
| 3 | Turn on emails | 10 min | Without it, contact-form messages reach nobody |
| 4 | Put the site online | 10 min | Gives you a link to share |
| 5 | Connect the domain | 20 min + wait | Makes it the real alumaoutdoor.com |

---

## JOB 1 — Run one SQL script (5 minutes)

**What this does:** creates three new storage areas in the database — one for
editable texts, one for the questions and answers, and one for product colours.
Until you do this, three screens in the admin will show an error when you try
to save.

**This is safe.** It only adds new things. It cannot delete or damage anything
that already exists, and running it twice does nothing the second time.

### The steps

1. Open your browser — Chrome, Safari, Edge, any of them.
2. Click once in the **address bar** at the top. The text in it will highlight.
3. Type **`supabase.com/dashboard`** and press `Enter`.
4. Log in if it asks.
5. You'll see a list of projects. Click the one called **aluma**.
   - ⚠️ Now look at the address bar. It must contain
     **`jzqayfllojeqivwbbuyf`**. If it says something else you're in the wrong
     project — go back and choose the other one.
6. Down the **far left** of the screen is a narrow strip of small icons. Find
   the one labelled **SQL Editor** and click it.
7. Click the green **+ New query** button near the top left.
8. You now have a big empty white box. Leave it a moment.
9. **In a separate window**, open the project folder on your computer and find
   this file:

   ```
   supabase/migrations/20260801120000_cms_texts_faqs_variants.sql
   ```

   Open it with Notepad (Windows) or TextEdit (Mac).
10. Click anywhere inside that file, press `Ctrl+A` to select everything, then
    `Ctrl+C` to copy.
11. Go back to the Supabase tab, click inside the big white box, and press
    `Ctrl+V`. The box fills with text.
12. Click the green **Run** button at the bottom right, or press `Ctrl+Enter`.
13. After a moment you should see **Success. No rows returned.**

### Check it worked

1. Click **+ New query** again.
2. Paste this in:

   ```sql
   select
     (select count(*) from public.site_texts)       as texts,
     (select count(*) from public.site_faqs)        as questions,
     (select count(*) from public.product_variants) as colours;
   ```

3. Click **Run**.
4. You should see a small table reading **texts: 13**, **questions: 7**,
   **colours: 0**.

Zero colours is correct — you haven't added any yet.

**✅ Tell me: "Job 1 done, 13 and 7."**

### If something goes wrong

| Message on screen | What it means |
|---|---|
| `relation "public.has_role" does not exist` | Wrong Supabase project. Go back to step 5. |
| `permission denied` | You're logged in with an account that doesn't own this project. |
| Anything red you don't recognise | Screenshot it and send it to me. Nothing is half-broken — the script either fully works or fully doesn't. |

---

## JOB 2 — Get into the admin (10 minutes)

**What this does:** makes your account an administrator, so you can add
products, projects and photos.

### ⚠️ Read this first — it will save you half an hour

Your Supabase project requires people to **confirm their email address**
before they can log in. Email isn't switched on yet — that's Job 3.

So if you sign up with an email and password right now, you'll sit waiting for
a confirmation message that can never arrive.

**Use the Google button instead.** It skips email confirmation entirely.

### Step A — create your account

1. You need the site running on your computer. Open the project folder. Hold
   `Shift`, right-click on empty space inside the folder, and choose
   **"Open PowerShell window here"** (or "Open Terminal here" on a Mac).
2. Type this and press `Enter`:

   ```
   npm run dev
   ```

3. Wait until it prints a line containing **`localhost:8080`**.
4. Open your browser and go to **`localhost:8080`**.
5. Click the address bar and change it to **`localhost:8080/club/auth`**, then
   press `Enter`. (You can also get there by clicking **מועדון** in the menu
   and then the join button — same page.)
6. Click the **Google** button.
7. Choose **outdooraluma@gmail.com**.

You're signed in now — but not yet an admin.

#### If the Google button gives an error

It means Google sign-in hasn't been switched on for this Supabase project yet.
Setting it up properly needs a Google Cloud account and takes half an hour. You
don't need to. Do this instead — it takes two minutes:

1. Go to the Supabase tab.
2. In the left icon strip click **Authentication**.
3. Look for **Sign In / Providers** (older versions call it **Providers**), and
   open the **Email** section.
4. Find the switch called **Confirm email** and turn it **off**.
5. Click **Save**.
6. Go back to the site and sign up normally with an email and a password. You
   won't be asked to confirm anything.

⚠️ Turn **Confirm email** back **on** once Job 3 is done — otherwise anyone can
register with an email address they don't own.

### Step B — make that account an admin

1. Go back to the Supabase tab.
2. Click **SQL Editor** in the left icon strip, then **+ New query**.
3. Paste this in exactly:

   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'outdooraluma@gmail.com'
   on conflict do nothing;
   ```

4. Click **Run**.
5. It should say **Success** and mention **1 row**.

   **If it says 0 rows**, the account doesn't exist — the Google sign-in in
   Step A didn't complete. Go back and do it again.

### Step C — check it

1. Go back to the site tab.
2. Click the address bar and change it to **`localhost:8080/admin`**, then
   press `Enter`.
3. You should see a page headed **ברוכים הבאים לניהול האתר** with eight cards.

That page is your instruction manual — it explains every job inside the admin,
step by step, in Hebrew.

**✅ Tell me: "Job 2 done, I'm in /admin."**

---

## JOB 3 — Turn on emails (10 minutes)

**What this does:** when somebody fills in the contact form, the message gets
emailed to you. Without this, messages are saved in the database but **nobody
is told they arrived**.

### The detail everybody gets wrong

Until the domain is connected (Job 5), the email service runs in **test mode**.
In test mode it delivers **only to the exact address the account was created
with**.

**So create the account with `outdooraluma@gmail.com`.** If you use a personal
address, every test email goes there and the studio inbox stays empty — which
looks exactly like "the contact form is broken".

### Step A — make the account

1. Go to **`resend.com`**.
2. Click **Sign Up**, top right.
3. Sign up using **outdooraluma@gmail.com**.
4. If it asks for a region, choose **EU (Ireland)**.
5. It will push you to "Add a Domain". **Skip it.** Look for a link saying
   *"I'll do this later"*, or just click **API Keys** in the left menu. We
   can't verify a domain we don't own yet, and test emails work without one.

### Step B — create the key

1. In the left menu click **API Keys**.
2. Click **Create API Key**.
3. Fill in:
   - **Name:** `aluma`
   - **Permission:** choose **Sending access**
4. Click **Add**.
5. A long code appears starting with **`re_`**.

⚠️ **Copy it immediately.** Resend shows it once and never again. Paste it into
a note on your computer.

### Step C — give the key to the site

This is done in Supabase, not in Resend.

1. Go back to the Supabase tab.
2. In the left icon strip click **Edge Functions**.
3. Click **Secrets**. (In some versions it's under **Project Settings → Edge
   Functions → Secrets** instead — either place is the same list.)
4. Click **Add new secret** and fill in:
   - **Name:** `RESEND_API_KEY`
   - **Value:** paste the `re_...` code
5. Click **Save**.
6. Click **Add new secret** again:
   - **Name:** `OWNER_EMAIL`
   - **Value:** `outdooraluma@gmail.com`
7. Click **Save**.

Names must be typed exactly — capital letters and underscores included.

### Check it worked

1. Go to the site (`localhost:8080`) and click **שאלות ותשובות** in the menu.
2. Scroll to the bottom, click **כתבו לנו** to open the form, fill it in with
   your own details, and send.
3. Within a minute an email should arrive at outdooraluma@gmail.com.

If nothing arrives, go to **resend.com → Logs**. If the message is listed there
as blocked, it's the test-mode rule from above — you signed up with a different
address.

**✅ Tell me: "Job 3 done, email arrived."**

---

## JOB 4 — Put the site online (10 minutes)

**What this does:** gives you a real web address like `aluma-xyz.vercel.app`
that you can send to anyone. It does **not** touch alumaoutdoor.com — the old
site keeps running exactly as it is.

### ⚠️ The one thing you must not skip

All the new work lives on a branch called **`calm-rebuild`**, not on `main`.
Vercel publishes `main` by default. **If you skip step 7, you will deploy the
old version of the site and wonder why nothing changed.**

### The steps

1. Go to **`vercel.com`**.
2. Click **Sign Up**.
3. Choose **Continue with GitHub** and log in with the GitHub account that owns
   the ALUMA code.
4. Choose the **Hobby** plan — free, no card needed.
5. On the dashboard click **Add New…** then **Project**.
6. You'll see your GitHub repositories. Find **ALUMA** and click **Import**.
   - If it isn't listed, click **Adjust GitHub App Permissions** and give
     Vercel access to that one repository.
7. **⚠️ THE IMPORTANT BIT — the branch.** Look for a setting called
   **Git Branch** on the setup screen. Set it to:

   ```
   calm-rebuild
   ```

   Some versions of Vercel don't offer this until after the first deploy. If
   you can't find it now, carry on, and immediately after deploying go to
   **Settings → Git → Production Branch**, change it to `calm-rebuild`, then go
   to **Deployments → ⋯ → Redeploy**.

8. **Leave everything else alone.** The build settings come from a file already
   in the project. If the screen shows "Vite", "npm run build" and "dist",
   that's correct.
9. Find **Environment Variables** and expand it. Add these three, one at a
   time — type the name in the left box, paste the value in the right box,
   click **Add**:

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://jzqayfllojeqivwbbuyf.supabase.co` |
   | `VITE_SUPABASE_PROJECT_ID` | `jzqayfllojeqivwbbuyf` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | the long `eyJ…` key — it's in the `.env` file in the project folder |

   All three are safe to store here. They're public values that get sent to
   every visitor's browser anyway.

10. Click **Deploy**.
11. Wait about two minutes while text scrolls past.
12. You'll get an address ending in **`.vercel.app`**. Click it.

### After this, it updates itself

Every time code is pushed to `calm-rebuild`, Vercel rebuilds and republishes
within about two minutes. You don't have to do anything.

**✅ Send me the `.vercel.app` address.**

### If something looks wrong

| What you see | What it means |
|---|---|
| A completely blank white page | The three environment variables in step 9 are missing or mistyped. Fix them, then **Deployments → ⋯ → Redeploy** — variables only take effect on a **new build**. |
| It looks like the old version of the site | Step 7. The production branch is still `main`. |
| Home page works but `/collections` gives a 404 | The `vercel.json` file wasn't picked up. Tell me. |
| No products or projects anywhere | Expected — the database is empty. That's Part 2. |

---

## JOB 5 — Connect the domain (20 minutes, then a wait)

**✅ This is now unblocked.** The domain was registered on 12 June 2026, and
ICANN blocks transfers for 60 days after registration. That expired on
**11 August**. It is now **28 August**, so you can go ahead.

### ⚠️ Before you touch anything

**Write down every DNS record the domain currently has.** If you lose them,
email to that domain stops working, and reconstructing them is genuinely
painful.

1. Log in wherever the domain lives now (Lovable).
2. Find the DNS settings for **alumaoutdoor.com**.
3. **Screenshot every row.** All of them — A, CNAME, MX, TXT.
4. Save those screenshots somewhere you won't lose them.

### Step A — get permission to move it

Whoever administers the Lovable workspace needs to either:

- **Release it (best).** Ask them to unlock the domain and send you the **EPP
  code** — also called an authorisation or transfer code. It looks like a short
  jumble of letters and symbols.
- **Or delegate DNS.** They keep ownership but point the domain where you say.
  Faster, but you don't own it.

If there's no self-service option, open a support ticket asking for "domain
unlock and EPP/auth code for alumaoutdoor.com". Under ICANN rules they must
provide it.

### Step B — transfer it to name.com

1. Go to **`name.com`**.
2. Click **Sign Up**. Use **outdooraluma@gmail.com**.
3. Verify the email they send you.
4. Find **Transfers** in the menu.
5. Type **alumaoutdoor.com** and start the transfer.
6. Paste in the **EPP code** from Step A.
7. Pay. A transfer includes an extra year of registration, so it isn't a wasted
   fee.
8. You'll get a confirmation email — click the link in it to approve.
9. **Now wait.** Transfers take up to 5–7 days. Nothing to do meanwhile.

### Step C — point it at the site

Once name.com says the transfer is complete:

1. Go to **vercel.com** and open your project.
2. Click **Settings**, then **Domains**.
3. Type **alumaoutdoor.com** and click **Add**.
4. Vercel shows you one or two DNS records to create.
5. Go to name.com, open the domain, find **DNS Records**, and add exactly what
   Vercel showed you.
6. **Also re-create every record from your screenshots** — especially anything
   starting with `MX` or mentioning `notify`. Those are email.
7. Back in Vercel, wait for the domain to turn green. Can take up to an hour.

### Step D — switch email to the real address

1. Go to **resend.com** → **Domains** → **Add Domain**.
2. Enter **`notify.alumaoutdoor.com`** — the `notify.` part matters. Keeping
   email on a subdomain means a future spam problem can never damage the main
   domain's reputation.
3. Resend shows DNS records. Add them at name.com.
4. Click **Verify**.
5. Tell me it's verified and I'll run one command to switch the sender over.

**✅ Tell me: "Domain moved" and "Resend verified".**

---
---

# PART 2 — FILLING THE SITE

Everything here happens inside the admin. Go to your site address, add
**`/admin`** to the end, and press `Enter`.

That page is itself a guide — eight cards, each explaining one job in Hebrew.
This section is the short version.

### 1. Products — the site is empty without these

1. In the admin menu click **קולקציות ומוצרים**.
2. Create a **collection** first — a family like "סלונים". Name and photo.
3. Inside it, add a **product**: name, one-line description, main photo.
4. Make sure the **פורסם** switch is on, and save. If it's off, nothing you
   entered appears on the site.

**Order matters:** the homepage shows the first 3 collections and first 6
products. Whatever you add first is what visitors see.

### 2. Colours for a product

The feature where clicking a colour dot changes the product photo.

1. Open a product you've **already saved** — the option doesn't appear until
   the product exists.
2. Scroll to **גימורים**.
3. Click **גימור חדש**.
4. Type the colour name, pick the dot colour, and upload a photo of that
   product **in that colour**.
5. Repeat for each colour.

### 3. Projects

Menu → **פרויקטים**. Name, location, description, photos. The homepage shows
three.

### 4. Reviews

Menu → **המלצות לקוחות**. The homepage section stays **invisible** until at
least one review is published — deliberately, so an empty site doesn't show an
empty box.

⚠️ Only real quotes from real customers who agreed to be quoted.

### 5. Texts

Menu → **טקסטים באתר**. Every editable sentence, labelled by where it appears.
If you clear a box the site returns to its original wording — you cannot break
anything from here.

### 6. Questions and answers

Menu → **שאלות ותשובות**. Edit, add, reorder. Unticking **מפורסם** hides one.

---
---

# PART 3 — THE PHOTOGRAPHY YOU STILL NEED

The site works with AI-generated placeholder images, but they aren't your
furniture. This is what to hand a photographer.

## The rules that matter most

Give the photographer this list word for word:

- **One identical camera setup for every product.** Same camera, same lens,
  same height, same distance. Tape the tripod legs to the floor.
- **Camera height 120cm**, measured to the middle of the lens.
- **Camera perfectly level** — not tilted down. Use a spirit level.
- **Lens 85–100mm equivalent.** Never wide-angle; it bends straight lines.
- **Aperture f/8–f/11** so the whole piece is sharp.
- **Soft even light** from a large softbox upper-left, plus fill. No hard
  shadows. Identical for every product.
- **Pure white background, lit brighter than the product.** This is what lets
  the retoucher cut cleanly through the gaps in rope and wicker.
- A **colour checker card** shot at the start of each product.

## Per product

| | Shot | Which products |
|---|---|---|
| 1 | Three-quarter from the front-**left**, turned about 35° | All |
| 2 | Three-quarter from the front-**right** | All seating and loungers |
| 3 | Straight-on front | All |
| 4 | Close-up details — weave, grain, stitching | All, 3 or 4 each |

**Quality:** RAW capture, minimum 4000 pixels on the long side. Delivered as
cut-outs at 2400 pixels, PNG with transparency.

**Cut-out rules — say these explicitly:**
- Every gap between slats, rope and wicker must be **see-through**, not filled.
- Soft 1-pixel edge, **no white glow** around the product.
- Feet and legs complete, not trimmed off.
- Test: place the cut-out on a green background and on a terracotta one. If you
  can see a white outline, reject it.

## The information sheet — as important as the photos

One row per product:

**Product name · Width (cm) · Depth (cm) · Height (cm) · Seat height (cm) ·
Available colours · Category**

Without exact centimetres the site can't size things correctly.

## Colour variants

Photograph **one** version of each product. Fabric colours can be recoloured
digitally, which is far cheaper than reshooting. But **do photograph
separately** when the frame material changes — teak versus aluminium versus
rope genuinely look different.

---
---

# 📬 WHAT TO SEND ME

Copy this into a message and fill it in as you go. You don't need it all at
once.

```
JOB 1  SQL script run?              "13 and 7" / something else
JOB 2  Can you reach /admin?        yes / no
JOB 3  Test email arrived?          yes / no
JOB 4  Your Vercel address:         https://..........vercel.app
JOB 5  Domain moved to name.com?    yes / not yet
JOB 5  notify. subdomain verified?  yes / not yet
```

**Never send me:** the Supabase `service_role` key, or any database password.
The `anon` key is fine — it's designed to be public and already ships inside
the website's code.

---

# Two things I could not finish in code

Being straight with you so nothing surprises you in front of the customer.

**The AR feature shows generic furniture.** The "view it in your space" tool
loads sample 3D models from Google — a generic sofa, chair and table, not your
products. That isn't a bug I can fix: real 3D models have to be commissioned
from a studio, roughly $250–500 per product and 2–3 weeks. The page now says
plainly that the models are demonstrations. **If you'd rather it didn't appear
at all until then, say so and I'll hide it** — that may be the safer choice for
a handover.

**The English site is partly translated.** The menu, the homepage and the Q&A
page are done. Other pages still show Hebrew when someone switches to English.
Tell me which you want: I finish the translations, or I hide the language
switcher until they're done.
