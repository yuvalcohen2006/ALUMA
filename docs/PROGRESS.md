# Where the site stands

## Home page polish — 10 September

```
██████████████████░░  90%
```

**Done, and on your screen once you run the script in [ACTION.md](ACTION.md).**

| | Change |
|---|---|
| ✅ | The English line under the ALUMA logo is gone |
| ✅ | Scrolling off the landing page — the photo now lags behind the page instead of outrunning it, and the wordmark fades out before the next section arrives |
| ✅ | New photograph for the paragraph: light through a prism onto aluminium, stone and outdoor fabric — the three materials you actually build with |
| ✅ | That section is crystal white now, picture left, words right, headline on one line |
| ✅ | Hovering one collection softly blurs the others instead of washing them out, and the one you are on grows for longer |
| ✅ | Collection names ride a white plate across the foot of each photo, with the arrow on hover |
| ✅ | "קולקציות חמות", "מוצרים מובילים", "הפרויקטים שלנו" |
| ✅ | The "חדש" tag is terracotta with a slow sheen crossing it |
| ✅ | Products can carry a stock count; at 5 or fewer an orange line appears under the photo |
| ✅ | All 47 product names go to Hebrew, and the Latin moves to the English field where it belongs |
| ✅ | Projects show a year after the place |
| ✅ | The two project buttons swapped, and both are now the same pill as the account button in the header |
| ✅ | Every button on the site is one height, one radius, one typeface |
| ✅ | The club field keeps its round corners when you click into it |
| ✅ | The "unsubscribe any time" line is gone |

**Waiting on you:** the database script — the Hebrew names, the stock counts and
the three titles are in it. Step 1 of [ACTION.md](ACTION.md).

**Not touched:** every other page, as asked. The one exception is the shared
button shape, which by its nature applies everywhere. The contact form's
underline fields are also still underlines rather than pills — say the word and
they change too.

---

```
████████████████████  100%
```

**Every problem found has been dealt with. Ready to go live.**

Last updated: 10 September 2026.

---

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
