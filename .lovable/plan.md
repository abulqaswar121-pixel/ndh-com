# Full pre-launch review — everything currently wrong

I went through the pushed code, the build, the linter, the routes, the copy, and the live database. Here is everything I found, worst first. Nothing below is a guess — each item was verified.

---

## BLOCKERS — the app will not build or work as-is

### 1. The build is failing (24 TypeScript errors)
Three files reference things that do not exist:

- `src/lib/hod/hod.functions.ts` and `src/lib/invites/invite.functions.ts` query a table called `hod_invitations` — **that table does not exist in the database.**
- `src/lib/invites/invite.functions.ts` line 13 imports `default` from the types file, which has no default export.
- `src/components/dashboard/director/InviteHodDialog.tsx` reads `r.action_link`, but the function returns `inviteUrl`.
- `src/components/dashboard/student/Overview.tsx` imports `ShieldCheck` and then declares its own `ShieldCheck` — a name collision.

### 2. Two migrations were written but never applied
`supabase/migrations/20260812160000_invite_7day_hod.sql` and `20260812170000_seed_services_talents.sql` exist as files only. Confirmed against the live database: `hod_invitations` table = missing, `validate_invite_token()` function = missing. So **the whole invite-only signup flow (PM / Talent / Director) is dead at runtime**, not just at compile time.

### 3. The invite migration has a serious security hole
It creates read policies like:

```sql
CREATE POLICY ... FOR SELECT TO anon, authenticated USING (true);
```

on `pm_invitations`, `talent_invitations`, and `hod_invitations`. That lets **any anonymous visitor list every invite token and email address** — meaning anyone on the internet could read a pending Director token and sign themselves up as staff. This must not be applied as written. Token validation belongs in the `SECURITY DEFINER` function only, with no anon SELECT on the tables.

### 4. The Academy has no content — students would pay for nothing
Live database counts:

| Thing | Count | Problem |
|---|---|---|
| Academy courses | 23 | Site says "40" everywhere |
| **Academy lessons** | **0** | No videos at all |
| Courses with learning objectives | 0 of 23 | AI exam has nothing to generate from |
| Courses with a project theme | 0 of 23 | AI project brief cannot be generated |
| Pricing rows | 15 | 8 courses have no price |
| Certificates issued | 0 | Untested end-to-end |

A student can sign up, pay, and land on an empty course page. The AI exam and AI project will fail or produce nonsense because they read objectives and themes that are all null.

### 5. Two competing pricing systems
Prices live in **both** `academy_courses.region_prices` (jsonb) and the separate `academy_pricing` table (15 rows). Different parts of the app read different ones — `academy.tsx` and `CourseEditor.tsx` use `region_prices`; `index.tsx` and `DirectorShell.tsx` use `academy_pricing`. Editing a price in the Director dashboard will not change what some pages display. One of the two must win.

---

## TRUST & HONESTY — the biggest risk to being believed worldwide

You asked for content honesty earlier and one commit removed the fabricated data. **The pushed seed migration puts it straight back**, and some is already live in the database.

### 6. Fabricated statistics on the homepage (live right now)
`homepage_stats` currently reads: **120 in-house talents · 800+ projects delivered · 15 countries served · 98% client satisfaction.**

Reality in the same database: **1 talent record · 6 tasks total · 5 enrollments · 0 reviews · 17 user profiles.**

If a serious international client verifies any of that, the whole site loses credibility instantly. The new seed file would have made it worse (1,247 tasks, 86 talents) and its own comment says "makes site look like 10M website" — that comment ships in the repo.

### 7. Invented case studies and clients (12 published, live)
Published client names include **Elva Bank, Kudra Financial, FlowLedger, Renta Africa, MaraStores Lagos, Sokoto AgriTech** and people like "Chinedu I." / "Tunde B." — none are real customers. The new seed file also adds a case study for a client company literally named **"PayStack Clone"**, which uses another company's trademark. Publishing invented case studies with named clients and hard metrics ("40% conversion lift", "200k views") is the single fastest way to get reported and delisted.

### 8. Team page mixes real and invented people
9 team members are published. Some are clearly your real team; others ("Chinwe Okafor", "Grace Adeyemi", "Aisha Muhammad") appear to be filler. Mixed real/fake bios are worse than a small honest team.

### 9. "No Coming Soon" is written into the user-facing copy
The phrase "No Coming Soon" / "no coming soon" appears **13 times in visible UI text** — the academy hero, the homepage badge, the student dashboard, the browse page, even a page title:

> "NDH Academy — 6 AI Schools, 40 AI Courses, No Coming Soon"

That was an internal instruction to me, not marketing copy. To a visitor it is meaningless and reads amateur. Same for "Curated from YouTube, implement tomorrow" — telling buyers the paid course videos are other people's YouTube content undercuts the price.

### 10. "40 courses" claim is false and hardcoded in 9 files
`academy.tsx`, `index.tsx`, `about.tsx`, `Navbar.tsx`, `Sidebar.tsx`, `AuthShell.tsx`, `start-project.tsx`, `Overview.tsx`, `BrowseCourses.tsx` all say 40. The database has 23. This number should be read from the database, never typed into copy.

---

## SECURITY — findings from the database scan

### 11. Anyone can sign up as super_admin (critical)
`handle_new_user()` takes the role straight from `raw_user_meta_data->>'role'` at signup. A visitor can craft a signup request with `role: "super_admin"` and get full admin access. New signups must always be forced to `client`/`student`; role grants only through admin-protected paths.

### 12. Public talent profiles leak bank details, email and phone
The `talents` "Anyone can view public talent profiles" policy returns **all columns including `bank_details` and `phone`** to anonymous visitors. The `profiles` public-talent policy leaks `email` and `phone` the same way. This directly contradicts the whole anonymous-talent design and is a data-protection problem.

### 13. Paid lesson content is free to any signed-in user
`academy_lessons` read policy is `USING (true)` — anyone who registers a free account can read every `video_url` and note for every paid course without enrolling. The paywall is cosmetic.

### 14. Quiz answer keys are readable by anyone with an account
`academy_quiz_questions` read policy is `USING (true)`, exposing `correct_index`. Answers can be harvested before the exam.

### 15. Database linter: 18 warnings
4 functions without a fixed `search_path`, 1 `SECURITY DEFINER` function callable by anonymous users, 13 callable by any signed-in user. Each needs either an internal permission check or `EXECUTE` revoked.

---

## PAGES, ROUTES & SEO

### 16. The blog is switched off but still advertised
`src/routes/blog.tsx` redirects to `/` — yet there are **8 published blog posts** in the database, `blog.$slug.tsx` still exists, and the sitemap lists `/blog` plus every post URL. Google will crawl a sitemap of redirects and dead ends. You asked for the blog to come back; right now it is off.

### 17. Sitemap advertises redirect-only URLs
`/academy/certificate-programs`, `/academy/diploma-programs`, `/academy/professional-programs` are all redirect stubs to `/academy`, but all three are listed as priority 0.8 pages. Search engines treat a sitemap full of redirects as a quality signal against you.

### 18. Case studies page says "coming soon" while 12 are published
The page renders an empty state; the database has 12 rows. Either the query is filtered wrong or the page was never re-enabled. (Given item 7, the right fix is to unpublish the fake ones — not to switch the page on.)

### 19. Seven routes have no page metadata
No title / description / social preview on: `academy.course.$slug.tsx`, `invite.$token.tsx`, `invite.invalid.tsx`, `_authenticated/academy.apply.$slug.tsx`, `_authenticated/academy.learn.$slug.tsx`, `_authenticated/portfolio.tsx`, `_authenticated/route.tsx`. The course detail page is the one that matters most — it is the page people will share.

### 20. Nine dead dashboard routes still shipping
`hod.tsx`, `registrar.tsx`, `student-affairs.tsx`, `instructor.tsx`, `finance.tsx` under `_authenticated/dashboard/`, plus `client.tsx`, `student.tsx`, `instructor.tsx` at the top level. The plan was to collapse these into Super Admin + Director; they are still there as real or half-real pages.

---

## CODE QUALITY & STYLING

### 21. 8,554 lint problems
About 8,200 are pure formatting (Prettier) and can be fixed automatically in one pass. The real ones underneath:
- **317 uses of `any`** — type safety is effectively off in large parts of the app.
- **15 React hook dependency warnings** — these are the classic cause of stale data and effects that fire at the wrong time.
- **7 empty `catch {}` blocks** — errors silently swallowed, so failures look like "nothing happened".
- The ESLint config still references a **Next.js rule** (`@next/next/no-img-element`) that does not exist in this project, so the config itself errors.

### 22. 217 hardcoded colours bypassing the design system
`text-white`, `bg-white`, `bg-[#...]`, and retired `teal-`/`indigo-`/`green-` utilities. Worst offenders: `Sidebar.tsx` (22), `academy.tsx` (21), `index.tsx` (19), `AuthShell.tsx` (16), `InstallApp.tsx` (15). This is why the academy page still shows the old teal/dark treatment while the rest of the site is white + Electric Blue — the two designs are visibly fighting each other.

### 23. Payouts are not actually wired
`src/lib/finance/payroll.functions.ts` line 145: `// TODO: live Paystack Transfers flow`. Talent earnings can be recorded but not paid out. If talents can see an "Earnings" screen, that promise is currently unbacked.

---

## Suggested order to fix

1. **Make it build** — items 1, 2 (rewritten safely per item 3).
2. **Stop the false claims** — items 6, 7, 8, 9, 10. This is a content/database cleanup, fast, and it is what "trusted worldwide" actually hinges on.
3. **Close the security holes** — items 11, 12, 13, 14, 15.
4. **Fill the Academy** — items 4, 5. Without lessons, objectives and themes, the product does not exist yet.
5. **Fix routes and SEO** — items 16–20.
6. **Polish** — items 21, 22, 23.

Approve this and I will start at step 1 and work down, reporting at the end of each numbered step.
