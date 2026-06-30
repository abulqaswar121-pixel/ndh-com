# NDH Build Status — What's Done vs Outstanding

## ✅ Fully built and wired
- **Public site** (home, services, academy, course detail, verify, about, contact, blog, careers, faq, privacy, terms, team)
- **Auth** (login, signup, forgot/reset, Google OAuth, role-based routing)
- **Client Portal** (`/dashboard/client`) — submit tasks, quotes, Paystack, chat, billing, reviews
- **Talent Portal** (`/dashboard/talent`) — privacy-gated tasks, earnings, performance
- **Student Portal + LMS** (`/dashboard/student`) — enrollment, course player, certificates, ID card
- **PM Portal** (`/dashboard/pm`) — 8-tab task dialog, SLA, quote/assign/QA
- **HOD** (`/dashboard/hod`), **Academy Director** (`/dashboard/academy-director`), **Registrar** (`/dashboard/registrar`), **Student Affairs** (`/dashboard/student-affairs`)
- **Finance Portal** (`/dashboard/finance`) — invoices + PDF, expenses, refunds, ledger, payroll runs
- **Admin + Super Admin** (`/dashboard/admin`, `/dashboard/super-admin`) — users/roles, departments, activity, platform settings, content, broadcasts
- **Email infra** (admin.ndh.com.ng, notify.ndh.com.ng + 15 branded templates)
- **Paystack** payments (test keys, webhook verified)
- **PWA manifest**, geo-currency, real-time messaging

## ⚠️ Not done yet (Turns 3 & 4 of the original 4-turn plan)

### Turn 3 — Instructor Portal (Phase 8) — **NOT BUILT**
Currently `/dashboard/instructor` shows the placeholder `RoleStub` ("This portal is on the next build phase"). Needs:
- 8A: course/module/lesson builder, assignments, tests, live classes schema completion
- 8B: grading interface, submissions review, live class hosting links, gradebook, announcements to cohort

### Turn 4 — Launch Prep (Phase 9) — **NOT BUILT**
- PWA service worker + offline shell + install prompt UI (manifest exists, SW does not)
- SEO sweep (sitemap.xml, robots.txt, per-route OG images, JSON-LD on services/courses)
- Security hardening (rate limits on public fns, CSP headers, supabase linter sweep)
- Analytics wiring (GA4 — you'll provide Measurement ID)
- SMS via Termii (you'll provide API key)
- Final QA pass, seed demo data, launch checklist

## 🔎 "Can't access some portals" — likely causes
The auth layout enforces role→path matching. Only `super_admin`, `admin`, `finance` can roam freely; everyone else is bounced to their own dashboard. So:
- If you signed up as a `client`, you can't open `/dashboard/pm`, `/dashboard/hod`, etc.
- Instructor route exists but only shows the stub regardless of role.
- `/admin/hod`, `/admin/pm`, `/admin/finance` (the routes you're on now) are **public marketing stubs**, not the real portals — the real ones live under `/dashboard/...`.

## ➡️ Proposed next move
Pick one:
1. **Continue Turn 3 (Instructor Portal)** — biggest functional gap.
2. **Continue Turn 4 (Launch prep)** — ship-ready polish, skip instructor for now.
3. **Grant your account `super_admin`** first so you can walk through every portal, then resume Turn 3.

Tell me which (1, 2, or 3) and I'll proceed.
