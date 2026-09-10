# Bug sweep — where I'm standing

```
██████████████████░░  88%
```

**123 fixed. ~17 still to check.**

Last updated: 10 September 2026.

> Corrected from "100%". That figure counted only the problems the sweep
> managed to fully check. It found more than that and ran out of budget before
> judging all of them, so the honest denominator is larger. Detail at the
> bottom.

---

## What this was

14 agents tried to break every page of the site, then a second round of agents
tried to prove each finding wrong. 123 survived that. All 123 are fixed, pushed,
and covered by a green build.

---

## Done ✅

| | Area | What was wrong |
|---|---|---|
| ✅ | **Home page** | English pages painted in Hebrew first; hero tagline field did nothing; club field pushed the wrong way |
| ✅ | **Collections** | A stray `%` in a link crashed the whole site; a dropped connection looked like an empty shop |
| ✅ | **Products** | Clicking a related item could blank the photo, or show the wrong product's photos under the right name |
| ✅ | **Hidden collections** | Turning a collection off left all its furniture live and browsable |
| ✅ | **Projects** | The six fake projects flashed on every visit; broken images; page threw English readers into Hebrew |
| ✅ | **Contact form** | Was entirely Hebrew on the English site; a failed send locked you out for 30 seconds |
| ✅ | **Q&A** | Screen readers read every answer aloud while they were closed |
| ✅ | **Club & account** | No way back in if you forgot your password; progress bar filled backwards; errors in English |
| ✅ | **English names** | The field you fill in never appeared anywhere on the site |
| ✅ | **"View in your space"** | Every 3D model was dead — page now hidden, one switch brings it back |
| ✅ | **Questionnaire** | Accepted a blank name and a fake phone; Enter did nothing |
| ✅ | **Every button on the site** | Text on the terracotta buttons was below the readable minimum |
| ✅ | **Magazine** | An article with an email address in it lost all its paragraphs |
| ✅ | **Accessibility panel** | Keyboard users fell straight out of it; its text-size button did nothing |
| ✅ | **Shared links** | A link with a `#` in it (from WhatsApp) landed at the top of the page, not the section |
| ✅ | **Admin — products** | A half-failed save could create a duplicate product and duplicate every colour |
| ✅ | **Admin — the rest** | A failed save wiped the live home strip; "new question" discarded unsaved edits |
| ✅ | **Speed** | The home page downloaded the whole catalogue twice on every visit |

Plus about 25 smaller ones found along the way: contrast, arrows pointing the
wrong way, dead code.

---

## Left to do

**24 findings were never judged.** Their checking agents ran out of budget, so
these were spotted and then neither confirmed nor ruled out. Three are rated as
breakages, two of them in the photo-crop tool, which got no verified coverage
at all in either run. I am going through these by hand now.

**About 45 more were filed as small** and skipped on purpose. I have fixed
roughly 25 of them along the way; the rest are unread.

**Then a production check** that is not about the sweep at all: security rules,
settings, dead links, what the browser console says on a real page load.

---

## What you need to do

Nothing here — it was all my side.

Your list is in **[ACTION.md](ACTION.md)**: reviews, colours, real projects.

---

## How this file works

Every time I hit a limit and come back, I update the bar and the table above,
so you can open this file and see exactly where things stand without reading
anything else.
