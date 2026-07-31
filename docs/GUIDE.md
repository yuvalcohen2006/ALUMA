# Aluma — the human guide

Everything a person has to do **by hand**, written so you don't need to know
anything about code, servers or databases.

There are three parts:

| Part | Who does it | What it covers |
|---|---|---|
| **Part 1 — Manual setup** | Yuval (the site owner) | Accounts, keys and the domain. One-time jobs. |
| **Part 2 — Adding content** | Whoever manages the website day to day | Products, photos, projects, articles, reviews. Repeatable. |
| **Part 3 — The asset shopping list** | Yuval + the photographer | Exactly what photos and files are needed, and why. |

**Golden rule:** if a screen doesn't look like what's written here, **stop and
ask** rather than guessing. These services change their layouts, and clicking
the wrong thing in the wrong place is much harder to undo than to avoid.

---
---

# 🖐️ PART 1 — MANUAL SETUP (things only Yuval can do)

These are the jobs that need a human with passwords. Nothing here can be done
from inside the code. They're in priority order.

---

## ⛔ BLOCKER 1 — Which Supabase project is the real one?

**Do this first. Everything else depends on it.**

### The problem, in plain words

Supabase is the database — it holds the products, photos, club members and
contact-form messages. There are **two** Supabase projects sitting in the
account, and the files in this repo disagree about which one the website
should be talking to:

| Project reference (its ID) | What points at it |
|---|---|
| `jzqayfllojeqivwbbuyf` | The setup docs, and the database migration tool |
| `yvxynsonjmcppaxflmvz` | The local settings file and the website's HTML |

One of these has all the real tables in it. The other is an abandoned earlier
attempt. **I cannot tell which from the outside** — both are alive, and both
refuse to answer questions without a password. So a human has to look.

### What to do

1. Go to **supabase.com/dashboard** and log in.
2. You'll see a list of projects. Open the **first** one.
3. Look at the very top of the browser address bar. It will say something like
   `supabase.com/dashboard/project/jzqayfllojeqivwbbuyf`. **That long string of
   letters is the project reference.** Note which one you're in.
4. In the far-left icon bar, click the **Table Editor** icon (looks like a grid/spreadsheet).
5. Look at the list of tables on the left.

**You are looking for a project that contains these table names:**
`site_collections`, `site_collection_products`, `blog_posts`, `contact_leads`,
`profiles`, `newsletter_subscribers`.

6. Repeat for the other project.

### What to report back

> "The project with the tables in it is `___________`."

That's it. One line. Then the code gets pointed at the right one and this
blocker disappears.

**If BOTH have tables:** don't delete anything. Tell me, and also say which one
has the most rows / most recent data. **If NEITHER has tables:** also tell me —
it means the database was never set up and we run the migrations fresh.

> **Why this matters so much:** if the website talks to the empty project, you
> will upload 40 product photos and see absolutely nothing appear on the site,
> with no error message explaining why. Half a day lost to a five-letter typo.

---

## ⛔ BLOCKER 2 — The database password (the "anon key")

**Why:** the website needs a key to read the database. Right now the key in the
local settings file is a placeholder that literally says
`REPLACE_WITH_YOUR_SUPABASE_ANON_KEY`. Until it's replaced, **nothing that
touches the database works on this computer** — no logins, no newsletter, no
admin panel, no product list.

### Steps

1. supabase.com/dashboard → open **the correct project** (from Blocker 1).
2. Bottom-left, click the **gear icon** (Project Settings).
3. In that menu click **API**.
4. Find the section headed **Project API keys**.
5. There are two keys. You want the one labelled **`anon`** and **`public`**.
   Click the copy icon beside it.

### ⚠️ The one genuinely dangerous thing in this whole document

The other key says **`service_role`** and usually hides behind a "Reveal"
button.

**Never copy, paste, screenshot or send that key to anybody — including me.**

It bypasses every security rule in the database. Anyone holding it can read
every customer's phone number and delete every table. The `anon` key is the
opposite: it is *designed* to be public, it already ships inside the website's
code where anyone can read it, and it's safe to send.

> Rule of thumb: **`anon` = safe to publish. `service_role` = treat like your
> bank password.**

### What to send

> The `anon` / `public` key (a long string starting `eyJ…`)

---

## ⛔ BLOCKER 3 — Make yourself an admin

**Why:** the admin panel (where you upload products) checks whether your user
account is on an approved list. Being the owner isn't enough — there has to be
a row in a permissions table saying so. Without it, every upload is rejected.

### Steps

1. First, **create an account on the website itself** — go to the site, click
   מועדון → הצטרפות, and sign up with **outdooraluma@gmail.com**. This creates
   your user.
2. Now go to supabase.com/dashboard → the correct project.
3. Far-left icon bar → click **SQL Editor**.
4. Click **New query**.
5. Paste this in exactly:

   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'outdooraluma@gmail.com'
   on conflict do nothing;
   ```

6. Click **Run** (or press Ctrl+Enter).
7. It should say "Success". If it says "0 rows", the signup in step 1 didn't
   work — check the email address and try again.

Now visit `/admin` on the website and you should get in.

---

## ⛔ BLOCKER 4 — Resend (the service that sends emails)

**Why:** when someone fills in the contact form, something has to actually
deliver that message to your inbox. That's Resend. Without it, form
submissions are saved to the database but **nobody gets notified**.

### The important detail most people get wrong

Until we own the domain (see Part 1, Job 5), Resend runs in **test mode**. In
test mode it will **only deliver email to the address the Resend account was
created with.**

So: **create the Resend account with `outdooraluma@gmail.com`.**

If you create it with a personal address, every test email goes to that
personal address and the studio inbox stays empty — which looks exactly like
"the contact form is broken."

> ⚠️ Older versions of these notes said to sign up with `yuval.cohen006@gmail.com`.
> **That instruction is out of date.** Use `outdooraluma@gmail.com`.

### Steps

1. Open **resend.com** → **Sign up** (top right).
2. Sign up with **outdooraluma@gmail.com**.
3. If it asks for a region, pick **EU (Ireland)**.
4. It will push you to "Add a Domain" — **skip it**. There's an "I'll do this
   later" link, or just click **API Keys** in the sidebar. We can't verify a
   domain we don't own yet, and test emails work fine without one.
5. Sidebar → **API Keys** → **Create API Key**.
   - **Name:** `aluma-dev`
   - **Permission:** **Sending access**
6. Click **Add**. A long key starting **`re_`** appears.

⚠️ **Copy it immediately.** Resend shows it once and never again.

### What to send

> The `re_…` key

---

## Job 5 — Move the domain to name.com (⏳ NOT before ~11 August 2026)

**Why the wait:** `alumaoutdoor.com` was registered on 12 June 2026 through
Lovable. ICANN — the global body that governs domain names — **forbids
transferring any domain for 60 days after registration**. Nothing anyone can
do changes that. Attempting it early just produces an error.

**The goal:** the domain ends up registered at **name.com**, in an account
owned by **outdooraluma@gmail.com**, so the client controls their own domain
rather than it living inside someone else's Lovable workspace.

### ⚠️ Step 0 — BEFORE YOU TOUCH ANYTHING: save the DNS records

This is the step people skip and then spend two days recovering from.

Go to wherever the domain's DNS currently lives (Lovable's dashboard, or
Cloudflare if it's already delegated) and **screenshot or copy every single
record in the list.** There will be rows with types like `A`, `CNAME`, `MX`,
`TXT`.

**Why:** moving a domain can wipe its records. If you lose the `MX` and `TXT`
records, **email stops being delivered** and it is not obvious that it's
broken — messages just silently vanish. With a screenshot you can rebuild them
in ten minutes.

### Step 1 — Create the name.com account

1. Go to **name.com** → **Sign Up**.
2. Use **outdooraluma@gmail.com**.
3. Verify the email they send you.
4. Turn on two-factor authentication when offered. This account controls the
   business's entire web presence.

### Step 2 — Get the domain released from Lovable

You need two things from whoever administers the Lovable workspace:

- The domain **unlocked** for transfer
- The **EPP code** (also called an "authorisation code" or "auth code") — a
  password-like string that proves you're allowed to move the domain

Look in Lovable under **Project → Settings → Domains → alumaoutdoor.com**.
There is usually a "Transfer out" or "Unlock" option that reveals the code.

**If there's no self-serve option, open a support ticket** saying:

> "I am the registrant for alumaoutdoor.com. Please unlock the domain for
> transfer and provide the EPP/authorisation code."

They are required to comply under ICANN rules. Don't accept "we can't do that."

### Step 3 — Start the transfer at name.com

1. name.com → **Transfers** (in the top menu).
2. Enter `alumaoutdoor.com`.
3. Paste the EPP code.
4. Pay. **A transfer always includes one extra year of registration** — so this
   isn't a fee, it's a renewal you'd have paid anyway.

### Step 4 — Approve it

An approval email goes to the domain's registered contact address. Click the
approve link. The transfer then completes on its own within **5–7 days**.

### Step 5 — Point the domain at the website

Once name.com shows the domain as yours:

1. name.com → the domain → **Nameservers**.
2. Change them to **Cloudflare's** nameservers. (Add `alumaoutdoor.com` as a
   site in the same Cloudflare account that hosts the website — Cloudflare will
   show you the two nameserver addresses to paste in.)
3. In Cloudflare DNS, **re-create every record from your Step 0 screenshot.**
4. Cloudflare → Workers & Pages → the `aluma` project → **Custom domains** →
   **Set up a custom domain** → `alumaoutdoor.com`.

**This is the moment the live site actually switches over.** Only do it when
you're happy with what's on the preview URL.

### Step 6 — Switch email to the real address

1. Resend → **Domains** → **Add Domain** → enter **`notify.alumaoutdoor.com`**
   (the subdomain, not the bare domain).
   > Why a subdomain: the bare domain points at the website. Keeping email on
   > `notify.` avoids any clash, and means a future spam problem can never
   > damage the main domain's reputation.
2. Resend shows a table of DNS records — add each one in Cloudflare DNS.
3. Click **Verify**.
4. Tell me it's verified, and I run the one command that flips the sender from
   the test address to `noreply@notify.alumaoutdoor.com`. No code change needed.

### Step 7 — Check it actually works

- Load `alumaoutdoor.com` — the new site should appear.
- Submit the contact form — the message should arrive at
  **outdooraluma@gmail.com**, and *not* in the spam folder.
- If it lands in spam, tell me; that's a DNS record needing adjustment, not a
  disaster.

---

## Job 6 — Content only you can provide

These aren't technical, but the site cannot launch honestly without them.

| What | Why it's blocking | Where it goes |
|---|---|---|
| **3+ real customer reviews** (name, city, one or two sentences) | The reviews currently on the homepage are **invented placeholders**. Publishing made-up named customer reviews is deceptive advertising. They must be replaced before the real domain goes live. | Admin → reviews screen (built in Phase 5) |
| **The "about" story facts** — what year Aluma started, the family's own words, 3 real numbers (years in business, families served, showroom size) | The About page is built around a first-person letter and three proof numbers. Placeholder text there reads as fake. | Sent to me, I place it |
| **Real product photos + dimensions** | See Part 3 below. | Admin → קולקציות ומוצרים |

---
---

# PART 2 — ADDING CONTENT (the day-to-day job)

Written for whoever is managing the website's content. **You do not need to
know anything technical.** Everything happens in a web page.

## Getting in

1. Go to the website and add **`/admin`** to the end of the address.
   (For example `https://aluma.pages.dev/admin`.)
2. Log in with the account that was made an admin (see Part 1, Blocker 3).
3. You'll see a menu down the side:

| Menu item | What it's for |
|---|---|
| **סטטיסטיקות** | Visitor numbers. Read-only. |
| **ניהול מועדון** | The list of club members. |
| **הזמנות לקוחות** | Customer projects and their status. |
| **פניות** | **Messages from the contact form and the consultation questionnaire.** Check this regularly — these are leads. |
| **פרויקטים בגלריה** | Past projects shown on the site. |
| **קולקציות ומוצרים** | **The product catalogue. The main one.** |
| **תמונת ראשי** | The big photo at the top of the homepage. |
| **מגזין** | Articles. |
| **חברי צוות** | Who else can log into this admin panel. |
| **הגדרות אתר** | Site settings. |

---

## 📦 Adding products (the most important task)

Products live inside **collections**. A collection is a group — "סלוני חוץ",
"שולחנות אוכל", "שולחנות אש". You make the collection first, then add
products into it.

### Step A — Make a collection

1. Sidebar → **קולקציות ומוצרים**.
2. Top of the page → click **קולקציה חדשה**.
3. Fill in:
   - **שם הקולקציה** — the name customers see, e.g. `סלוני חוץ`
   - **תיאור קצר** — one sentence. Optional.
   - **תמונת קולקציה** — one photo representing the whole group.
4. Leave **פורסם** switched **off** for now.
   > **Why:** "פורסם" means "live on the public website". Keeping it off while
   > you work means half-finished content never appears to customers. Turn it
   > on when the collection is complete.
5. Click save.

### Step B — Add a product

1. Find your collection in the list and expand it.
2. Click **מוצר חדש**.
3. Fill in:

| Field | What to write |
|---|---|
| **שם מוצר** | The product name. Required. |
| **משפט פתיחה (Tagline)** | One short line, like a subtitle. |
| **על המוצר** | The description. **Leave a blank line between paragraphs** — each block becomes its own paragraph on the site. |
| **חומרים** | **One material per line.** Don't use commas — press Enter between them. |
| **מידות בסיס** | Free text, e.g. `אורך 240 ס״מ · עומק 92 ס״מ` |
| **תמונת כיסוי** | The main photo. This is what shows in the catalogue grid. |
| **גלריה** | Additional photos. You can select several at once. |

4. Click save.

### Step C — Photos

- Click the upload area, pick the file from your computer, wait for it to
  finish. The photo is stored permanently — you don't need to keep the original
  anywhere special (though you should anyway).
- **Best format:** JPG or WebP, roughly **2000 pixels** on the long side.
- **Too small** (under ~1000px) looks blurry on modern phone screens.
- **Too big** (over ~4000px) makes the site slow to load and costs you visitors.

### Step D — Reordering

Drag the **⠿ handle** on the left of each row. The order you see is the order
customers see. It saves automatically.

### Step E — Go live

Switch **פורסם** on for the product, and for its collection. Refresh the public
site. It should appear.

**If it doesn't appear:** 99% of the time it's one of these, in order of
likelihood:
1. **פורסם** is off on the product, or on its parent collection.
2. You're looking at the site while it's running in demo mode (a developer
   setting — tell me and I'll check).
3. You're logged into the wrong Supabase project (see Blocker 1).

---

## 🏗️ Adding a project (past work)

Sidebar → **פרויקטים בגלריה**. Same pattern: title, location, description,
cover photo, gallery, **פורסם** switch.

> **Note (as of Phase 1):** the public projects page currently shows a
> hardcoded list, not this admin screen. Wiring it up is Phase 8 on the
> roadmap. Until then, adding projects here won't change the public site —
> don't panic, it's a known gap and it's scheduled.

---

## 📰 Adding a magazine article

Sidebar → **מגזין**. Title, excerpt, cover image, body text, **פורסם**.

The web address (slug) is generated from the Hebrew title automatically. If it
complains it can't make one, type a short English word in the slug field.

---

## ⭐ Adding a review

**This is a launch blocker.** The three reviews on the homepage right now are
**invented** — they were written to test the design. Publishing made-up reviews
with made-up customer names is deceptive advertising, so they have to be
replaced before the site goes on the real domain.

**The good news:** the moment you add real ones, the fake ones vanish on their
own. No code change, no request to me.

### For now, add them in Supabase directly

*(A friendlier screen in the admin panel is coming; until then this takes about
two minutes per review.)*

1. supabase.com/dashboard → the correct project → **Table Editor** (grid icon).
2. Find **`site_reviews`** in the list on the left and click it.
3. Click **Insert** → **Insert row**.
4. Fill in only these four:

| Field | What to put | Example |
|---|---|---|
| **quote** | What the customer said. Keep it to 1–3 sentences — long quotes get visually cut off. | `הצוות ליווה אותנו מהסקיצה ועד ההתקנה. הסלון מרגיש יוקרתי, והבד לא דהה גם אחרי קיץ שלם.` |
| **name** | Their name | `נועה ב.` |
| **meta** | Their town, or what they bought | `הרצליה` |
| **published** | Switch it to **true** | ✅ |

   Leave `id`, `created_at` and `sort_order` alone — they fill themselves.
   (`sort_order` is only for controlling the order later; smaller numbers show
   first.)
5. Click **Save**.
6. Repeat until you have **at least three**. Refresh the homepage — yours will
   be there.

> **⚠️ Get permission first.** Ask the customer before publishing their words
> and their name. A first name plus an initial (`נועה ב.`) is usually the
> comfortable middle ground.

---

## 🖼️ Changing the homepage's big photo

Sidebar → **תמונת ראשי**. Upload a desktop version (wide) and a mobile version
(tall). Use the tallest, most beautiful outdoor shot you have — this is the
first thing every visitor sees.

---
---

# PART 3 — THE ASSET SHOPPING LIST

**This is the "before we can build the good stuff" list.**

Three of the site's best features — the scene builder (drop furniture into a
photo of a patio), AR (point your phone at your garden and see the sofa there),
and colour switching (see the same sofa in 8 fabrics) — are built and waiting,
but they are running on **placeholder images**. They cannot look real until
real assets exist.

**Give this section to your photographer.** The specifications are not
fussiness; each one exists because breaking it produces a visibly broken
result, and the reason is written next to each.

---

## Part 3.1 — The product photo shoot

### The non-negotiable rules (read these first)

**1. One camera setup for the entire catalogue.**
Same camera, same lens, same height, same distance. Tape the tripod legs to the
floor. Write the settings down so a re-shoot in six months matches.
> **Why:** the website places all these products into the same scene. If one
> chair was shot from slightly higher than the sofa next to it, viewers can't
> say why, but the picture feels wrong. Consistency between products matters
> more than any individual setting.

**2. Camera height: 120 cm from the floor** (to the middle of the lens), ±10 cm.
> Roughly chest height. High enough to see seat surfaces, low enough to still
> look like a human's view.

**3. Camera perfectly level — 0° tilt.** Use a spirit level or the camera's
electronic level.
> **Why:** the website calculates how big to draw each product based on where
> you place it, using the geometry of a level camera. A tilted camera breaks
> that maths and furniture starts floating or sinking into the ground.
> **If you follow only one instruction on this page, make it this one.**

**4. Lens: 85–100 mm** (full-frame equivalent). **Never wide-angle.**
> Wide lenses bend straight lines. A bent sofa arm can't be un-bent later.

**5. Aperture f/8–f/11**, so the whole piece is sharp front to back.

**6. Soft, even light. No hard shadows.** One large softbox from the
**upper left**, plus fill. Identical for every product.
> **Why:** the website draws a shadow under each item, always from the same
> direction. If products disagree about where the light is, the scene falls apart.

**7. Background: pure white seamless, lit brighter than the product.**
> **Why (this is the clever bit):** your furniture has rope, wicker and slats
> with *gaps* in it. Those gaps must end up see-through in the final file. If
> the background is bright white shining through the gaps, cutting it out is
> almost automatic. If it's grey or a room, someone has to hand-cut hundreds of
> tiny holes and it will cost you a fortune and still look wrong.
> **Do not use a green screen** — green light spills onto teak and cream
> cushions and leaves a colour cast on every edge.

**8. Photograph a colour-checker card** in one frame per product, at the start.
> Lets us match every product's colours to one standard afterwards, free.

### What to shoot, per product

| | Shot | Which products |
|---|---|---|
| 1 | **Three-quarter from the front-LEFT** (turned ~35°) | **Every product** |
| 2 | **Three-quarter from the front-RIGHT** (~35° the other way) | All sofas, chairs, loungers, daybeds |
| 3 | **Straight-on from the front** | **Every product** |
| 4 | **Directly overhead**, camera level | Every product (used for the top-down plan view) |
| 5 | **Three-quarter from behind** | The 3–5 hero products only |
| 6 | **The same shot with its natural shadow left in**, on light grey | The 3–5 hero products only |
| 7 | Close-ups of weave, grain, stitching | 3–4 per product, for the product pages |

**Why two three-quarter angles?** Customers place furniture along both sides of
a patio. With only one angle, everything faces the same way and the scene looks
like a sticker sheet.
Round tables, planters and fire pits are symmetrical — one angle is fine.

**Realistic total:** ~25 products × 3 angles ≈ **75 cut-outs**, plus ~10 extra
for the hero pieces. Call it **85 finished images**.

### Quality and delivery

- Shoot **RAW**, minimum **4000 pixels** on the long side.
- Deliver cut-outs as **PNG with transparency**, **2400 pixels** long side.
- File naming: `productname_angle_colour.png`, e.g. `sorrento-3seat_fl45_charcoal.png`
  (angles: `front`, `fl45`, `fr45`, `rl45`, `top`).

### The cut-out brief (give this to the retoucher, word for word)

1. **Every gap between slats, rope and wicker must be transparent**, not filled
   in. Zoom to 200% on the seat back and armrests to check.
2. Soft edge, about **1 pixel** of feather, plus colour decontamination — **no
   white halo**.
3. Legs and feet complete, not trimmed off.
4. **No shadow in the product file.** (Shadows are delivered separately, for
   hero pieces only.)
5. **The acceptance test:** place the cut-out on a mid-green background and on a
   mid-terracotta background. If you can see a pale outline, or any weave gap is
   filled, **it's rejected.** Those are patio colours — that's where it'll be seen.

### Colour variants — photograph or fake?

- **Cushion fabric colours: photograph ONE**, then we generate the rest
  digitally. (~$15–30 each, versus $100–300 to re-shoot an angle.)
- **Frame materials — teak vs aluminium vs rope: PHOTOGRAPH EVERY ONE.**
  > These change the shape, the shine and the outline of the piece. Faking them
  > digitally does not survive a customer looking closely, and this is a luxury
  > brand where they will.

---

## Part 3.2 — The product information sheet

**A spreadsheet. As important as the photographs.** One row per product:

| Column | Example |
|---|---|
| SKU / product code | `SOR-3S-CHR` |
| Product name | ספה סורנטו 3 מושבים |
| **Width in cm** | 218 |
| **Depth in cm** | 92 |
| **Overall height in cm** | 74 |
| **Seat height in cm** | 42 |
| Available colours / finishes | פחם, חול, טיק |
| Category | ישיבה / שולחן / מיטת שיזוף / תאורה / אביזר |
| Sits on | floor / tabletop |

> **Why this is not optional:** the scene builder draws each product at its true
> size relative to the patio. Without real centimetres it has to guess, and a
> guessed sofa is either a doll's-house toy or a bus. This spreadsheet is what
> makes the feature trustworthy — a customer deciding whether a set fits their
> balcony is relying on these numbers.

---

## Part 3.3 — The backdrops (the gardens and patios)

These are the scenes customers drop furniture into.

**How many:** **3 minimum** to launch. **6–8 makes it feel like a real product.**
Suggested set: stone terrace · timber deck · poolside · rooftop with a city
view · lawn and garden · covered pergola · courtyard · plus one plain studio
backdrop.

**Recommendation: generate most of these with AI, photograph 1–2 for real.**
> **Why:** you need aspirational locations — a Mykonos rooftop, a villa
> poolside — that you will never get access to, and hiring those locations
> would cost more than the entire rest of the project. AI handles those well.
> But shoot your showroom or a real customer installation for real: one
> authentic location anchors the whole set.

**If photographing, the specs are:**

- Camera at **135 cm**, on a tripod, **perfectly level**.
- Wide-ish lens (24–35 mm), **f/8–f/11**, everything sharp.
- **The middle of the floor completely empty** — no furniture, rugs or pots
  where we'll be placing items.
- The floor should fill the **bottom 55–65%** of the frame.
- Even light — **overcast or open shade is ideal**.
- Minimum **6000 pixels** wide.

**⚠️ And the one thing photographers never think to do — please ask explicitly:**

> **Take one extra frame of each scene with a 1-metre measuring rod standing
> upright at three marked spots on the floor** (near, middle, far).

> **Why:** that single extra photo lets us calibrate the scene's scale exactly
> instead of estimating it by eye. It is the difference between furniture that
> sits convincingly on the ground and furniture that hovers. It costs 30
> seconds per scene.

---

## Part 3.4 — 3D models for AR ("see it in your garden")

**Only 3 products at launch.** Pick the signature sofa, the signature lounger,
and the signature dining set.

### Why not AI, and why not a phone scan?

You can generate 3D models from a photo with AI in about a minute, and you can
scan furniture with a phone app. **Both are genuinely useful here — but not as
the thing customers see.**

- **AI 3D models** invent the parts they can't see. The back of the sofa becomes
  guesswork, wicker gaps get filled in solid, and the size comes out wrong
  because these tools think in proportions, not centimetres.
- **Phone scans** fail exactly where your furniture lives: thin rope, open
  frames, gaps and glossy powder-coating. You get webbing across the holes and
  blobby legs. They also bake the showroom's lighting into the model, so the
  sofa carries the shop's shadows into someone's sunny garden.

**Where they ARE worth doing:** scan each hero product yourself with **Polycam**
(free, ~20 minutes each) and **send the scan to the 3D studio as reference.**
Studios charge 30–60% extra when they're working from poor reference material.
This one step often pays for itself.

### What to send the studio

- The full photo set from Part 3.1
- The manufacturer's technical drawings with dimensions
- Fabric and finish swatch photos with their codes
- Your Polycam scans

### What to demand back — put this in the order, not as an afterthought

| Requirement | Value |
|---|---|
| Formats | **Both `.glb` and `.usdz`** per product |
| Size | Under **4 MB** each |
| Detail | Under **60,000 triangles** |
| Textures | 1024×1024 or 2048×2048 |
| **Scale** | **True real-world size in metres**, within 2% of the spec sheet |
| Pivot point | Centre of the footprint, **on the ground** |
| Lighting | **None baked into the textures** |
| Proof | Screenshots of it working on both an iPhone and an Android phone |

> **Why "in the original order":** the industry pattern is a €50 model that
> becomes €450 once you pay separately for re-texturing, AR conversion and
> revisions. Ordering "AR-optimised, GLB + USDZ delivered" up front costs 30–50%
> more on the quote and far less in total.

**Expected cost:** **$250–500 per product** if all three are ordered together.
**Roughly $750–1,500 total**, 2–3 weeks.

---

## Part 3.5 — Budget, and what to buy first

| Item | Rough cost |
|---|---|
| Product shoot, ~25 products, 3–4 days | Negotiate a **flat day rate** — far cheaper than per-product pricing at this volume |
| Professional cut-outs, ~85 images | **$250–1,000** |
| Fabric colour variants (digital) | **$300–900** |
| AI backdrops ×8, generated and cleaned up | **$320–640** |
| 3D/AR models ×3 | **$750–1,500** |

**If the budget is tight, buy in this order.** Each one unlocks the next:

1. **Product photos + the dimensions spreadsheet** — nothing works without these
2. **Professional cut-outs** — this is what makes it look real instead of cheap
3. **3 backdrops**
4. **Colour variants**
5. **More backdrops** (up to 8)
6. **AR models** — genuinely fine to do after launch

---
---

# What to send me, all together

- [ ] Which Supabase project has the tables (Blocker 1)
- [ ] The Supabase **anon / public** key (Blocker 2)
- [ ] Confirmation that `/admin` lets you in (Blocker 3)
- [ ] The Resend `re_…` key (Blocker 4)
- [ ] 3+ real customer reviews
- [ ] The About-page story facts

**Never send:** the Supabase `service_role` key, or any database password.

---

*Companion file: `docs/ROADMAP.md` tracks the build itself — what's done, what's
next. This file is only about the things a human has to do by hand.*
