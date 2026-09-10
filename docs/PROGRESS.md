# Where the site stands

## Home page — 10 September

```
████████████████████  done
```

Everything asked for is in. One short script left before it is all on screen —
step 1 of [ACTION.md](ACTION.md), the stock numbers.

### The landing

| | |
|---|---|
| ✅ | The English line under the ALUMA logo is gone |
| ✅ | Scrolling off it is smooth now. The photo had been travelling *up* faster than the page, which is backwards and is what made it feel out of place; it lags behind now, and the wordmark fades out before the next section arrives |

### Light and matter

| | |
|---|---|
| ✅ | One prism, one beam, one spectrum — and its background is exactly the page's white with the edges feathered out, so it sits on the page rather than being a picture of something |
| ✅ | Crystal white section, picture left at 400px, words right, headline on one line |
| ✅ | The paragraph is on your three lines. Those breaks live in the copy, so you can move them yourself from **ניהול טקסטים** |
| ✅ | The photo sits 50px lower against the words |
| ✅ | Dust drifting in the air: sixteen specks, about a pixel a second. Invisible until you stop and look, and they stop entirely for anyone who has asked their computer for less motion |

### Collections and products

| | |
|---|---|
| ✅ | "קולקציות חמות" and "מוצרים מובילים" |
| ✅ | Hovering one tile softly blurs the others instead of washing them out, and the one you are on grows for longer |
| ✅ | Collection names ride a white plate across the foot of each photo, with the arrow on hover |
| ✅ | **The band behind them is a shade deeper.** You were right that white on it did not read — see below |
| ✅ | The "חדש" tag is terracotta with a slow sheen, squared rather than a pill |
| ✅ | Products can carry a stock count; at 5 or fewer an orange line appears under the photo |
| ✅ | All 47 product names are Hebrew, and the Latin moved to the English field where it belongs |
| ⛔ | The flame icon is gone. Three versions in it still was not earning its place |

### Projects, club, and everything

| | |
|---|---|
| ✅ | Projects show a year after the place |
| ✅ | The two project buttons swapped, and both are the same pill as the account button in the header |
| ✅ | Every button on the site is one height, one radius, one typeface |
| ✅ | The club field keeps its round corners when you click into it, and the "unsubscribe any time" line is gone |

**Why the band changed.** White on it measured 1.06:1 — invisible. I measured
the shipped CSS of eight comparable brands: Vitra, Paola Lenti, Neptune, Aesop
and DWR all sit between 1.17:1 and 1.21:1 against white. Aluma was below every
one of them, which is why a white plate on it disappeared. The plate was fine;
the band was too pale. It is 1.17:1 now, and a test holds it there.

**Not touched:** every other page, as asked. The one exception is the shared
button shape, which by its nature applies everywhere. The contact form's
underline fields are still underlines rather than pills — say the word and
they change too.

**Next:** the other screens.

---

## The bug sweep — 9 September

```
████████████████████  done
```

**Every problem found has been dealt with.**

## What was done

14 agents tried to break every page. A second round tried to prove each finding
wrong. That produced **246 candidates**, and every one of them has now been
either fixed, ruled out, or consciously left with a reason (listed at the
bottom).

The sweep ran out of budget twice, which left 24 findings judged by nobody —
including the whole photo-crop tool. I went through those by hand. Two of them
were real breakages.

---

## Fixed

| | Area | What was wrong |
|---|---|---|
| ✅ | **Home page** | English pages painted in Hebrew first; hero tagline field did nothing |
| ✅ | **Collections** | A stray `%` in a link crashed the whole site; a dropped connection looked like an empty shop |
| ✅ | **Products** | Clicking a related item could show the wrong product's photos under the right name |
| ✅ | **Hidden collections** | Turning a collection off left all its furniture live and browsable |
| ✅ | **Projects** | The six fake projects flashed on every visit; broken images |
| ✅ | **Contact form** | Entirely Hebrew on the English site; a failed send locked you out for 30 seconds |
| ✅ | **Q&A** | Screen readers read every answer aloud while they were closed |
| ✅ | **Club & account** | No way back in if you forgot your password; progress bar filled backwards |
| ✅ | **English names** | The field you fill in never appeared anywhere on the site |
| ✅ | **"View in your space"** | Every 3D model was dead — hidden, one switch brings it back |
| ✅ | **Questionnaire** | Accepted a blank name and a fake phone; Enter did nothing |
| ✅ | **Every button** | Text on the terracotta buttons was below the readable minimum |
| ✅ | **Magazine** | An article with an email address in it lost all its paragraphs |
| ✅ | **Accessibility panel** | Keyboard users fell out of it; its text-size button did nothing |
| ✅ | **Photo cropping** | Resizing the window threw away the crop you had just set |
| ✅ | **Admin — products** | A half-failed save could create a duplicate product and duplicate every colour |
| ✅ | **Admin — the rest** | A failed save wiped the live home strip; "new question" discarded unsaved edits |
| ✅ | **Speed** | Every visitor downloaded a 360KB chart library used only by one admin screen |

---

## The production check

Not part of the sweep — the things that decide whether a site is safe to hand
over.

| | Checked | Result |
|---|---|---|
| ✅ | Passwords & keys | None in the code. The private key is only ever read from the server's own settings |
| ✅ | Who can read your data | Tested against the live database with the public key: enquiries are refused outright; customer profiles, orders and questionnaire answers all come back empty |
| ✅ | Google | Every address in the sitemap is a real page; the private pages now tell search engines to skip them |
| ✅ | Deep links | Sharing a link to any page works, including links with a `#` in them |
| ✅ | Every page loads | New test mounts all 23 public pages with an empty database and checks the browser console is clean |
| ✅ | Speed | 106KB of dead weight removed from every first page load |

---

## Deliberately left

About twenty small things, none of which a visitor can see:

- **Stale comments** in the code describing behaviour that has since changed.
  Worth tidying one day; harmless now.
- **A few search-engine tags** on the English pages that say "Hebrew". The
  effect is nil — the same tag is already set correctly elsewhere on the page.
- **English titles for projects and magazine posts.** The database has room for
  them and the admin has no field, which matches your "one name is enough".

---

## What you need to do

Nothing here — it was all my side.

Your list is in **[ACTION.md](ACTION.md)**: reviews, colours, real projects.
