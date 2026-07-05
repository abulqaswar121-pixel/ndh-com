# Beta Review Fixes — Implementation Plan

This is a very large scope (21 items across bugs, role refactoring, CMS systems, new features, and polish). I'll break it into 8 sub-phases and proceed sequentially, notifying at milestones.

## Sub-Phase 1 — Critical Bugs (Section A, items 1–11)
- Newsletter: merge to single section, wire Subscribe to a `newsletter_subscribers` table + confirmation email, mobile centering fix
- Navigation: stop force-redirecting logged-in Clients from public pages (Services, About, Team, Blog, Careers, Contact); add "Back to site" nav from dashboards
- Academy Apply: role-aware — students go to portal, non-students see enroll-as-student modal (multi-role allowed)
- Fix `/careers` link routing
- Fix "Open Settings" link to `/dashboard/client?tab=settings`
- Password: merge Set/Change into one section; require current password; add strength meter; email on change; Google-only users see "Set" once
- Phone field: numeric + `+`/`-`/space only, country code select, format-as-you-type
- Notifications: mark read (single/all), delete (single/all), unread badge
- Profile page: full mobile responsiveness pass
- Client-facing copy rewrite: "route" → "assign the right team", "PM" → "Project Manager"

## Sub-Phase 2 — Admin Role Restriction (Section B, item 12)
- Remove Academy sections from Admin dashboard (instructors, HODs, courses, students, registrar, director oversight)
- Keep Bureau only: clients, talents, PMs, tasks, bureau departments, bureau reports
- Update invitation permissions: Admin can invite PMs/Talents only; Super Admin retains all
- Update permission checks in server functions and UI guards

## Sub-Phase 3 — Blog Fix + Case Studies CMS (items 14, 13)
- Debug blog loading (likely RLS/query issue); ensure articles render
- Super Admin Blog CMS: rich text editor, images, categories, tags, author, SEO, draft/published
- Seed 5 sample articles
- `/blog/[slug]` polished detail page (hero, author, reading time, share, related, newsletter)
- New `case_studies` table + CMS in Super Admin
- Public `/case-studies` list + `/case-studies/[slug]` detail
- Homepage portfolio pulls from real case studies
- Seed 6 sample case studies

## Sub-Phase 4 — Footer Consolidation (item 15)
- Restructure to 4 columns: Company / Services / NDH Academy / Support

## Sub-Phase 5 — Scoping Wizard + Talent Portfolio (items 16, 17)
- `/start-project` 8-step public wizard, saves to `project_quotes` table, on signup auto-converts to draft task
- Student "My Portfolio" tab: projects, skills, certifications, availability
- Public `/talent/[username]` portfolio page
- Admin/HOD browse + invite to Talent Pool

## Sub-Phase 6 — Micro-interactions + Accessibility (items 19, 20)
- Button press, card hover-lift, skeleton loaders, toast animations, number counters
- WCAG AA pass: contrast, focus rings, ARIA labels, alt text, keyboard nav

## Sub-Phase 7 — Contact Widget (item 21)
- Floating bottom-right widget on public pages
- Submits to `support_tickets` table + email to support@ndh.com.ng

## Sub-Phase 8 — LinkedIn + GitHub OAuth (item 18)
- LinkedIn/GitHub aren't supported natively by Lovable Cloud auth. I'll enable via Supabase auth providers and provide setup steps for OAuth apps (client ID/secret you'll add).

## Realism note

This plan touches ~60+ files, adds 4–5 new tables (newsletter, case_studies, project_quotes, portfolio_projects, support_tickets), and requires many migrations. I'll execute sequentially and notify at end of each sub-phase. Some items (LinkedIn/GitHub OAuth, full a11y audit polish) require your input/credentials to finish.

## Confirm to proceed

Reply "proceed" and I'll start Sub-Phase 1 immediately.
