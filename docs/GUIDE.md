# Aluma — what's left

> ## 🚨 alumaoutdoor.com is DOWN right now, and this is why
>
> The transfer finished — the registry lists **NameCheap** as the registrar.
> But the domain's nameservers were never switched. They still say:
>
> ```
> NS1HWY.NAME.COM   NS2FLN.NAME.COM
> NS3FQS.NAME.COM   NS4JNZ.NAME.COM
> ```
>
> Those are **name.com's** servers, left over from before. They no longer hold
> a zone for this domain, so every lookup fails outright — not "wrong page",
> not "old site". Nothing answers at all.
>
> **This is why the new furniture "isn't on the live site".** There is no live
> site at that address at the moment. The work itself is fine — see below.
>
> **Job 1 fixes it.** Ten minutes, then the domain is yours and pointed at the
> real site.

---

## The employee's uploads are safe. Nothing was lost.

I checked the production database directly:

| | |
|---|---|
| Collections | **6**, all published and publicly visible |
| Products | **47**, all published and publicly visible |
| Cover photos | **47 of 47 load** (checked every URL) |
| Duplicate or empty slugs | none |
| Products orphaned from a collection | none |

Her work is live **right now** at
**https://aluma-three.vercel.app** — collections, products and photos.
Open that and you will see everything she added.

The only thing broken is the address. `alumaoutdoor.com` doesn't resolve, so
anyone checking there sees nothing and reasonably concludes the work vanished.

---
---

# JOB 1 — Bring the domain back up and point it at the site

Two parts: give the domain working nameservers, then tell it where the site
is. Do them in order.

## Part A — switch to Namecheap's own DNS (2 minutes)

1. Go to **namecheap.com** and sign in.
2. Click **Domain List** in the left menu.
3. Find **alumaoutdoor.com** and click the **MANAGE** button on its right.
4. Stay on the first tab (**Domain**). Scroll to the **NAMESERVERS** section.
5. It currently shows **Custom DNS** with the four `NAME.COM` servers.
   Open that dropdown and choose **Namecheap BasicDNS**.
6. Click the **green tick** to save.

The domain will start resolving within a few minutes. It will show a Namecheap
parking page at first — that is correct and expected. Part B replaces it.

## Part B — point it at the site

7. In a new tab go to **vercel.com** → your project → **Settings** →
   **Domains**.
8. Type **alumaoutdoor.com** and click **Add**. If it offers to add
   **www.alumaoutdoor.com** as well, accept.
9. Vercel now shows the DNS records it needs — an **A** record for `@` and a
   **CNAME** for `www`. **Leave this tab open and copy from it.**
   - ⚠️ Use the values **on your screen**. Do not copy any IP from this guide
     or from anywhere else; Vercel changes them.
10. Back in Namecheap, on the same MANAGE screen, click the **Advanced DNS**
    tab.
11. Delete anything already listed there (bin icon on each row). Nothing that
    was there is still wanted — the old Lovable records are dead.
12. Click **ADD NEW RECORD** and add exactly what Vercel showed you:
    - Type **A Record**, Host **@**, Value = Vercel's IP, TTL **Automatic**
    - Type **CNAME Record**, Host **www**, Value = Vercel's target, TTL
      **Automatic**
13. Click the **green tick** on each row to save it.
14. Go back to the Vercel tab and wait for the domain to turn **green**.
    Usually minutes; can take up to an hour.

### Check it worked

Open **https://alumaoutdoor.com**. You should see the site with the 6
collections and the furniture on it.

**You cannot break any email doing this.** There were never any MX records on
this domain — your mail is Gmail on a separate address and is untouched.

**✅ Tell me "domain live" when it goes green.**

---
---

# JOB 2 — Tell Supabase about the new address (2 minutes)

Do this **after** Job 1 goes green, or signing in on the real domain will
bounce to a dead page.

1. **supabase.com/dashboard** → the **aluma** project.
   - ⚠️ The address bar must contain **`jzqayfllojeqivwbbuyf`**.
2. Left icon strip → **Authentication** → **URL Configuration**.
3. **Redirect URLs** → **Add URL**:

   ```
   https://alumaoutdoor.com/**
   ```

4. **Add URL** again:

   ```
   https://www.alumaoutdoor.com/**
   ```

5. Change **Site URL** to:

   ```
   https://alumaoutdoor.com
   ```

6. **Save.** Leave the existing Vercel and localhost entries in the list —
   extra entries do no harm and keep the preview working.

**✅ Tell me: "Job 2 done."**

---
---

# JOB 3 — Move the site's email onto the real domain (10 minutes)

Until this is done, contact-form notifications only reach
outdooraluma@gmail.com. Nothing is lost meanwhile — every message is saved and
readable in **/admin → פניות מהאתר**.

1. **resend.com** → **Domains** → **Add Domain**.
2. Enter **`notify.alumaoutdoor.com`**. The `notify.` prefix matters: keeping
   mail on a subdomain means a future spam problem can never damage the main
   domain's reputation.
3. Resend shows a set of DNS records. Add each one at Namecheap under
   **Advanced DNS**, the same way as Job 1 Part B.
   - Namecheap's **Host** field wants only the part **before**
     `.alumaoutdoor.com`. If Resend says `send.notify.alumaoutdoor.com`, type
     `send.notify`.
4. Back in Resend, click **Verify**. Can take up to an hour.

**✅ Tell me "Resend verified" and I will switch the sender over.**

---
---

# While the domain comes up

The site is already running at **https://aluma-three.vercel.app** with all the
furniture on it. Send the customer there in the meantime — it is the same site
reading the same database, so nothing has to be re-entered when the real
domain goes live.

Worth telling them:

- Contact-form emails only reach **outdooraluma@gmail.com** until Job 3 is
  done. Nothing is lost — every message is saved and readable in
  **/admin → פניות מהאתר**.
- Once the domain is live, use that link and stop sharing the `.vercel.app`
  one, so search engines index the right address.

---

# 📬 WHAT TO SEND ME

```
JOB 1  Nameservers on Namecheap BasicDNS?   yes / no
JOB 1  Domain green in Vercel?              yes / not yet
JOB 2  Supabase redirect URLs updated?      yes / no
JOB 3  notify. subdomain verified?          yes / not yet
```

**Never send me** the Supabase `service_role` key or any database password.
The `anon` key is fine — it's public by design and already ships inside the
website.

---

# Two things I could not fix in code

**The AR feature shows generic furniture.** "View it in your space" loads
sample 3D models from Google — a generic sofa, chair and table, not your
products. Real models have to be commissioned, roughly $250–500 per product
and 2–3 weeks. The page says plainly that they're demonstrations. **Say the
word and I'll hide the feature** until real ones exist — probably the safer
choice for a handover.

**The English site is partly translated.** The pages a customer walks through
are done — home, collections, product pages, projects, the journal, materials,
the club, About, 404 and thank-you. Still Hebrew under `/en`: the
questionnaire, the build-your-own pages, the club account screens, and the
legal and accessibility statements. I would leave the legal ones alone in any
case — they are legally meaningful documents for an Israeli business, and a
translation of mine is not the same document.
