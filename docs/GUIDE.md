# Aluma — what's left

**Where you are:** the database is set up and you're inside `/admin`. Verified
against the live project on 30 August — 13 texts, 7 questions, both settings
rows present, every table reachable. Nothing is broken.

**What's left:** three jobs. About 40 minutes of clicking, plus a wait for the
domain.

| # | Job | Time | Why it matters |
|---|---|---|---|
| 1 | Turn on emails | 10 min | Without it, contact-form messages reach nobody |
| 2 | Put the site online | 10 min | Gives you a link to share |
| 3 | Connect the domain | 20 min + wait | Makes it the real alumaoutdoor.com |

Then Part 2 is filling the site with content, and Part 3 is the photography
you still need from a photographer.

**The golden rule:** if a screen doesn't look like what's written here, **stop
and ask me** rather than guessing.

---
---

# JOB 1 — Turn on emails (10 minutes)

**What this does:** when somebody fills in the contact form, the message gets
emailed to you. Right now messages are saved in the database but **nobody is
told they arrived**.

## The detail everybody gets wrong

Until the domain is connected (Job 3), the email service runs in **test mode**.
In test mode it delivers **only to the exact address the account was created
with**.

**So create the account with `outdooraluma@gmail.com`.** If you use a personal
address, every test email goes there and the studio inbox stays empty — which
looks exactly like "the contact form is broken".

## Step A — make the account

1. Open your browser and go to **`resend.com`**.
2. Click **Sign Up**, top right.
3. Sign up using **outdooraluma@gmail.com**.
4. If it asks for a region, choose **EU (Ireland)**.
5. It will push you to "Add a Domain". **Skip it.** Look for a link saying
   *"I'll do this later"*, or just click **API Keys** in the left menu. We
   can't verify a domain we don't own yet, and test emails work without one.

## Step B — create the key

1. In the left menu click **API Keys**.
2. Click **Create API Key**.
3. Fill in:
   - **Name:** `aluma`
   - **Permission:** choose **Sending access**
4. Click **Add**.
5. A long code appears starting with **`re_`**.

⚠️ **Copy it immediately.** Resend shows it once and never again. Paste it into
a note on your computer.

## Step C — give the key to the site

This part happens in Supabase, not in Resend.

1. Go to **`supabase.com/dashboard`** and open the **aluma** project.
   - ⚠️ The address bar must contain **`jzqayfllojeqivwbbuyf`**. If it says
     something else, you're in the wrong project.
2. In the narrow strip of icons down the **far left**, click **Edge Functions**.
3. Click **Secrets**. (Some versions put it under **Project Settings → Edge
   Functions → Secrets** instead — same list either way.)
4. Click **Add new secret**:
   - **Name:** `RESEND_API_KEY`
   - **Value:** paste the `re_...` code
5. Click **Save**.
6. Click **Add new secret** again:
   - **Name:** `OWNER_EMAIL`
   - **Value:** `outdooraluma@gmail.com`
7. Click **Save**.

Names must be typed exactly — capitals and underscores included.

## Check it worked

1. Go to the site and click **שאלות ותשובות** in the menu.
2. Scroll to the bottom, click **כתבו לנו** to open the form, fill it in with
   your own details, and send.
3. Within a minute an email should arrive at outdooraluma@gmail.com.

If nothing arrives, go to **resend.com → Logs**. If the message is listed there
as blocked, it's the test-mode rule above — you signed up with a different
address.

## One thing to do afterwards

Back in Job 2 of the old guide you may have turned **Confirm email** off in
Supabase so you could sign up without waiting for a confirmation message. Now
that email works, turn it back on:

1. Supabase → **Authentication** → **Sign In / Providers** → **Email**.
2. Switch **Confirm email** back **on**, and Save.

If you signed in with Google and never touched that setting, ignore this.

**✅ Tell me: "Job 1 done, email arrived."**

---
---

# JOB 2 — Put the site online (10 minutes)

**What this does:** gives you a real web address like `aluma-xyz.vercel.app`
that you can send to anyone. It does **not** touch alumaoutdoor.com — the old
site keeps running exactly as it is.

## ⚠️ The one thing you must not skip

All the new work lives on a branch called **`calm-rebuild`**, not on `main`.
Vercel publishes `main` by default. **If you skip step 7, you will deploy the
old version of the site and wonder why nothing changed.**

## The steps

1. Go to **`vercel.com`**.
2. Click **Sign Up**.
3. Choose **Continue with GitHub** and log in with the GitHub account that owns
   the ALUMA code.
4. Choose the **Hobby** plan — free, no card needed.
5. On the dashboard click **Add New…** then **Project**.
6. Find **ALUMA** in the repository list and click **Import**.
   - If it isn't listed, click **Adjust GitHub App Permissions** and give
     Vercel access to that one repository.
7. **⚠️ THE IMPORTANT BIT — the branch.** Find the setting called **Git
   Branch** on the setup screen and set it to:

   ```
   calm-rebuild
   ```

   Some versions of Vercel don't offer this until after the first deploy. If
   you can't find it now, carry on, and immediately after deploying go to
   **Settings → Git → Production Branch**, change it to `calm-rebuild`, then
   **Deployments → ⋯ → Redeploy**.

8. **Leave the build settings alone.** They come from a file already in the
   project. If the screen shows "Vite", "npm run build" and "dist", it's right.
9. Find **Environment Variables** and add these three — type the name in the
   left box, paste the value in the right box, click **Add**:

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

## After this, it updates itself

Every time code is pushed to `calm-rebuild`, Vercel rebuilds and republishes
within about two minutes. You don't have to do anything.

**✅ Send me the `.vercel.app` address.**

## If something looks wrong

| What you see | What it means |
|---|---|
| A completely blank white page | The three variables in step 9 are missing or mistyped. Fix them, then **Deployments → ⋯ → Redeploy** — variables only take effect on a **new build**. |
| It looks like the old version of the site | Step 7. The production branch is still `main`. |
| Home page works but `/collections` gives a 404 | The `vercel.json` file wasn't picked up. Tell me. |
| No products or projects anywhere | Expected — the database is empty. That's Part 2. |

---
---

# JOB 3 — Connect the domain (20 minutes, then a wait)

**✅ This is unblocked.** The domain was registered on 12 June, and ICANN blocks
transfers for 60 days after registration. That expired on **11 August**.

## ⚠️ Before you touch anything

**Write down every DNS record the domain currently has.** If you lose them,
email to that domain stops working, and reconstructing them is genuinely
painful.

1. Log in wherever the domain lives now (Lovable).
2. Find the DNS settings for **alumaoutdoor.com**.
3. **Screenshot every row.** All of them — A, CNAME, MX, TXT.
4. Save those screenshots somewhere you won't lose them.

## Step A — get permission to move it

Whoever administers the Lovable workspace needs to either:

- **Release it (best).** Ask them to unlock the domain and send you the **EPP
  code** — also called an authorisation or transfer code. It looks like a short
  jumble of letters and symbols.
- **Or delegate DNS.** They keep ownership but point the domain where you say.
  Faster, but you don't own it.

If there's no self-service option, open a support ticket asking for "domain
unlock and EPP/auth code for alumaoutdoor.com". Under ICANN rules they must
provide it.

## Step B — transfer it to name.com

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

## Step C — point it at the site

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

## Step D — switch email to the real address

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

Everything here happens inside `/admin`.

**Two ways in now:**
- **`/admin/login`** — email and password, the panel's own door.
- The **Google** button on that same screen, which is how you got in the first
  time.

If you signed in with Google and want a password of your own, go to
**הגדרות → הסיסמה שלכם**, type one twice, save. No email needed. From then on
the email-and-password form works.

Nobody without an admin account can get in. Even if someone reached the
screens, the database itself refuses to hand them anything or let them change
anything — the permission check lives there, not in the page.

## The landing screen is the manual

Going to **`/admin`** gives you a card per screen: what it's for, what you can
do in it, and — the useful bit — **what you'd go looking for there and not
find**. Start there rather than here.

The short version, in the order worth doing:

### 1. Products — the site is empty without these

**קולקציות ומוצרים.** Create a **collection** first (a family like "סלונים"),
then add **products** inside it. Make sure the **פורסם** switch is on, or
nothing appears.

**Order matters:** the homepage shows the first 3 collections and first 6
products.

### 2. Colours for a product

Open a product you've **already saved** — the option doesn't exist until the
product does. Scroll to **גימורים**, click **גימור חדש**, name the colour, pick
the dot colour, upload a photo of that product **in that colour**.

Clicking that dot on the site now swaps the main photograph to it. (That was
broken until last week — it swapped the list but not the picture on screen.)

### 3. Projects

**פרויקטים.** Name, location, description, photos. The homepage shows three.

### 4. Contact details

**הגדרות.** Phone, WhatsApp, address, socials. Changing these now updates the
footer, the contact page, the WhatsApp button and the map links all at once.
Until last week this screen saved and changed nothing.

### 5. Reviews

**המלצות לקוחות.** The homepage section stays **invisible** until at least one
review is published — deliberately, so an empty site doesn't show an empty box.

⚠️ Only real quotes from real customers who agreed to be quoted.

### 6. Texts and questions

**טקסטים באתר** and **שאלות ותשובות.** Clearing a text box returns the site to
its original wording — you cannot break anything from here.

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
digitally, far cheaper than reshooting. But **do photograph separately** when
the frame material changes — teak versus aluminium versus rope genuinely look
different.

---
---

# 📬 WHAT TO SEND ME

```
JOB 1  Test email arrived?          yes / no
JOB 2  Your Vercel address:         https://..........vercel.app
JOB 3  Domain moved to name.com?    yes / not yet
JOB 3  notify. subdomain verified?  yes / not yet
```

**Never send me:** the Supabase `service_role` key, or any database password.
The `anon` key is fine — it's designed to be public and already ships inside
the website's code.

---

# Two things I could not finish in code

**The AR feature shows generic furniture.** The "view it in your space" tool
loads sample 3D models from Google — a generic sofa, chair and table, not your
products. That isn't a bug I can fix: real 3D models have to be commissioned
from a studio, roughly $250–500 per product and 2–3 weeks. The page says
plainly that the models are demonstrations. **If you'd rather it didn't appear
at all until then, say so and I'll hide it** — that may be the safer choice for
a handover.

**The English site is partly translated.** The menu, homepage and Q&A page are
done. Other pages still show Hebrew when someone switches to English. Tell me
which you want: I finish the translations, or I hide the language switcher
until they're done.
