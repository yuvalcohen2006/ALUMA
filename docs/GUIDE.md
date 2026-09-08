# Aluma — what's left

Checked against your live site and database on **8 September 2026**.

The technical setup is done. What remains is content, plus one thing to confirm.

| | | |
|---|---|---|
| ✅ | Database script | done |
| ✅ | Sign-in address | done |
| ✅ | Three home-page products | done — 3 picked |
| ✅ | **Email** | fixed — one look to confirm |
| ○ | English names | optional — 0 of 47 products, 0 of 6 collections |
| ⬜ | Customer reviews | 0 — the section is hidden until there is one |
| ⬜ | Colours on products | 0 |
| ⬜ | Real projects | 6 placeholders on the site |
| ○ | Labels on products | optional |

---

# ✅ EMAIL — fixed. One look to confirm.

You deleted `RESEND_FROM`. That was the fault, and everything else was already
proven working.

## Check this when you next open your mail

**`outdooraluma@gmail.com` should now hold TWO new messages:**

| Subject | Came from |
|---|---|
| `פנייה חדשה מהאתר — בדיקה סופית` | **your website's contact form** |
| `Aluma — after the fix` | me, straight to Resend |

**The first one is the one that matters.** It is the message that could not be
sent for the last six weeks. If it is there, the site's email works and you are
done — delete the test leads from **פניות** and forget about it.

If only the second arrived, tell me and I will keep digging. Check spam before
concluding either way; the domain is still new.

## What was wrong, in one line

`RESEND_FROM` had been set on 28 July to Resend's shared test address,
`onboarding@resend.dev`, back when your domain was not verified yet. Resend only
lets that address email the account owner, so every message the site sent to
`outdooraluma@gmail.com` was rejected with a 403 — and rejected messages never
reach the log, which is why nothing appeared anywhere.

## The part I would still like to fix

Your site cannot tell you when an email fails. It caught that 403 on every
single enquiry for six weeks, wrote it to a log nobody reads, and reported
success every time. That is why this took so long to find, and it will hide the
next failure exactly as well.

The fix is a small SQL script plus one change to the site's code, after which
**פניות** shows *"המייל לא נשלח"* on any lead whose email did not go out. It is
not urgent now that mail is flowing — but it is the difference between finding
out in a minute and finding out in six weeks.

Say the word whenever you like and I will prepare it as one job.

---

# English names — optional

**Where:** קולקציות ומוצרים → click a collection → click a product →
**השם באנגלית**, beside the Hebrew name.

**Collections too:** קולקציות ומוצרים → the pencil icon on a collection →
**השם באנגלית**.

**Entirely optional, and nothing blocks you.** The rule that refused to save
without an English name is gone — one name is enough. Fill these in whenever you
feel like it, or never.

Where a name is missing the English site simply shows the Hebrew one. Untidy for
an English visitor, not broken.

---

# Customer reviews — 0

**המלצות לקוחות** in the sidebar.

The section is invisible on the site until there is at least one, so an empty
site never shows an empty box. Real quotes only, from customers who agreed to be
quoted.

---

# Colours on products — 0

The feature customers notice most, and the one with a trap in it.

**Where:** open any product → scroll to **צבעים**.

Each colour needs a photo of **that piece in that colour**, shot from the same
angle and distance as the main photo. If the angle changes, the furniture appears
to jump when someone switches colour.

A new product already starts with white, so there is nothing to set up first.

---

# Real projects — 6 placeholders on the site

The six projects on the site are **invented examples with generated
photographs**. Nothing on that page is work Aluma actually did.

**Where:** פרויקטים in the sidebar.

### ⚠️ Read this before you add the first one

**The moment you publish one real project, all six placeholders disappear.**

That is deliberate — a grid mixing real work with invented examples is worse than
either on its own — but it means your projects page will go from six to one until
you add more. So either add two or three in one sitting, or accept a short page
for a while.

Nothing is lost: the placeholders come back automatically if you unpublish
everything.

---

# Labels on products — optional

On any product page there is a **תווית** dropdown: *מבוקש*, *חם עכשיו*, *חדש*.

Two things worth knowing before you use it:

- **"חדש" already works by itself.** The five most recently added pieces carry it
  automatically. You only need the dropdown to override that.
- **The site shows at most one label per row.** A label on half the products means
  nothing, so it refuses to shout even if you mark everything.

My honest opinion on **חם עכשיו**: it is the one that reads like a discount shop,
and it is a claim you would have to be able to stand behind. Say the word and I
will take it off the list.

---

# When you upload any photo

A window opens first. **Drag the photo to choose what goes in the frame, scroll
to zoom.** Everything outside the frame goes grey.

On the right you see **every shape the site will really use it in** — a product
photo gets cut three different ways. Check all of them before saving. That is
what stops a chair losing its legs on the home page.

| Photo | Make it | Shape |
|---|---|---|
| Home page main image | ⁦2400 × 1350⁩ | landscape |
| Collection image | ⁦1500 × 2000⁩ | **portrait** |
| Product photo | ⁦1600 × 1600⁩ | square |
| Product in a colour | ⁦1600 × 1600⁩ | square, same angle as the main photo |
| Project photo | ⁦2000 × 1333⁩ | landscape |
| Article photo | ⁦1600 × 1067⁩ | landscape |

Up to 8MB. **JPG or PNG only** — an iPhone HEIC is now refused rather than
uploading broken, so convert it first.

---

# 📬 WHAT TO TELL ME

```
Did "בדיקה סופית" arrive?          yes / no / in spam
Want the "email failed" warning?  yes / no

English names (optional)?         yes / not bothering
Reviews added?                    yes / not yet
Colours on any product?           yes / not yet
Real projects added?              yes / not yet
```

**Never send me** the Supabase `service_role` key or any database password. The
`anon` key is fine — it is public by design and already inside the website.

Your Resend key travelled through a chat message. It is sending-only, so the worst
it can do is send email as you — but once everything works, deleting it in Resend
and creating a fresh one takes thirty seconds.

---

# Two things I could not fix in code

**The AR feature shows generic furniture.** "View it in your space" loads sample
3D models from Google — a generic sofa, chair and table, not your pieces. Real
models run roughly $250–500 each and take 2–3 weeks. The page says plainly that
they are demonstrations. **Say the word and I will hide it** until real ones
exist.

**The English site is partly translated.** The pages a customer walks through are
done — home, collections, products, projects, journal, materials, club, About,
404, thank-you. Still Hebrew under `/en`: the questionnaire, the build-your-own
pages, the club account screens, and the legal pages. I would leave the legal ones
in Hebrew regardless — they are legally meaningful documents for an Israeli
business, and a translation of mine is not the same document.
