## Platform-wide Professional Redesign

Goal: shift NDH from "founder-story" visuals to a mature global marketplace feel (Fiverr / Upwork / Toptal). Every page gets the same design language: white surfaces, single electric-blue accent, Space Grotesk display + Inter body, no gradient blobs, no personal photos on the marketing site.

---

### Design system (foundation, applied to every page)

- Rebuild `src/styles.css` tokens:
  - Background: pure white; surface: `#F8FAFC`; border: `#E5E7EB`.
  - Foreground: near-black `#0B1220`; muted `#5B6472`.
  - Single accent: Electric Blue `#1D4ED8` (hover `#1E40AF`); success/warn/danger reserved for status only.
  - Retire `--gradient-brand`, `bg-hero`, `shadow-glow`, `AnimatedBlobs` from marketing pages.
- Typography: Space Grotesk (display, 600/700), Inter (body, 400/500/600). Tight tracking, generous line-height, no all-caps except small eyebrow labels.
- Components: flatter cards (1px border, subtle shadow only on hover), 8-pt spacing, consistent 14/16/18/24/32/48 type scale, standardized `Container`, `Eyebrow`, `SectionHeader`, `StatPill`, `TrustBar` primitives in `src/components/site/ui/`.
- Dark mode: keep, but derived from the same neutral scale — no purple/teal glow.

### Global chrome

- Navbar (`src/components/site/Navbar.tsx`): Logo · Services · Academy · Talent · Blog · Contact · Sign in · Start a project (blue). Remove theme toggle from primary bar (move into footer).
- Footer: 4 columns — Services / Academy / Company (About, Blog, Contact, Careers) / Legal (Terms, Privacy, Trust & Safety, Refunds). Newsletter row on top, small print + socials on bottom.
- Retire `AnimatedBlobs`, `bg-hero`, `TypingHeadline` from all public pages.

### Home (`src/routes/index.tsx`)

Browse-first layout:
1. Search hero — headline "Hire vetted digital talent across Africa", subhead, search field routing to `/services?q=`, trust chips ("Vetted talent", "Secure payments", "Quality-checked delivery").
2. Category grid — 8 service categories with icon + count.
3. How it works — 3 numbered steps.
4. Why NDH — 4 bento cards (Vetting, QA, Escrow-safe payments, African-time SLAs).
5. Featured services strip — pulled from DB (fallback: category cards if empty).
6. Academy teaser — one row, link to `/academy`.
7. CTA band — "Post a project" / "Browse talent".
No founder photo, no testimonials, no "Sokoto to the world".

### Services (`src/routes/services.tsx`)

Marketplace pattern: left filter rail (category, budget, delivery time, tier), top search + sort, responsive grid of service cards (title, category, from-price, tier badge). Category landing chips above grid. Mobile: filter drawer.

### Academy (`src/routes/academy.tsx` + course/school pages)

Coursera-style: clean masthead per school, course grid with duration/level/price, sticky enrollment card on course detail (`academy.course.$slug.tsx`), syllabus accordion, instructor block anonymized to "NDH Faculty" until real instructors are on. Keep the 6 AI Schools rebuild from Part 5.

### Talent directory (`src/routes/talent.index.tsx`, `talent.$slug.tsx`)

Anonymous expertise cards. Each card shows:
- Role title (e.g. "Senior Brand Designer")
- Tier badge (Junior → Elite)
- Top 5 skills
- Years of experience, languages, timezone
- Availability dot + typical turnaround
- "Request this talent" CTA (opens `/start-project` with prefilled role)

Suggestion I'm adding: a **"Talent ID"** system — each profile gets a short code like `NDH-DS-041`. Feels like Upwork/Toptal's private-roster pattern, keeps identity protected, and lets clients reference specific talent in briefs. Detail page (`/talent/$slug`) shows the same card expanded with sanitized case snippets (industry + outcome, no client names) and a booking form. No names, no photos anywhere on the public site.

### Blog (kept)

- `/blog` index: clean editorial grid (cover, category, title, read time). No gradient hero — just a white masthead with title + short description.
- `/blog/$slug`: single-column reading layout, 68ch measure, serif-free (Inter), category chip, share row, related posts. Keep DB + CMS as-is.

### Case studies

Hide from nav for now (routes stay live, no footer/nav links) — bring back when 3+ real cases exist. `/case-studies` shows a "Coming soon — request references" state.

### Auth (`login`, `signup`, `forgot-password`, `reset-password`, `talent-login`, `talent-application`, `staff-access`)

- Replace `AuthShell` blobs with a centered single-column card on a light neutral background.
- Left/right split only on desktop ≥1024px: card left, muted testimonial-free trust panel right (icons + short trust statements, no faces).
- Password rules + strength meter kept; Google button primary style; email second.
- Consistent copy + error patterns.

### Client area & dashboards

Marketing-side polish extends into `_authenticated/*`:
- Same white surface + blue accent, table-heavy layouts, remove gradient chrome from `DashboardShell`, `AdminShell`, `DirectorShell`, `PmShell`, `TalentOverview`, `ClientOverview`.
- Keep functionality untouched; visual pass only.

### About / Contact / Trust

- `/about`: relocate origin story here (Sokoto → global) with restrained tone; company facts, mission, leadership section that can stay anonymous roles until named.
- `/contact`: two-column form + response commitments ("< 4 business hours"), office/coverage list, WhatsApp + email.
- New `/trust` page: vetting process, QA, dispute policy, payment safety. Link from footer.
- New `/refunds` page (or section under Terms). Link from footer.

### Copy pass

Sweep every public page to remove: "Sokoto to the world", "childish" superlatives, exclamation marks, first-person founder voice on marketing pages. Voice becomes second-person, outcome-first, benchmark-driven.

---

### Sub-phases (I'll notify at the end of each)

1. Design tokens + primitives + Navbar/Footer + retire blobs/gradients platform-wide.
2. Home rebuild (search hero, categories, how-it-works, bento, CTA).
3. Services marketplace + category filtering.
4. Talent directory anonymous cards + Talent ID system + detail page.
5. Academy visual pass (schools/course pages) on top of Part 5 structure.
6. Blog + Case Studies visual pass (blog kept, case studies hidden from nav).
7. Auth flows redesign (all 7 auth routes).
8. About / Contact / Trust / Refunds pages.
9. Dashboards visual pass (client, talent, admin, director, pm).
10. Copy sweep + final QA (mobile 360, tablet, desktop; light + dark).

---

### Technical notes

- No schema changes required for the redesign itself. Talent ID = derived display value from existing `public_slug` or a new short `talent_code` column on `talent_profiles` (added in sub-phase 4 with a migration + GRANTs + RLS unchanged).
- No new dependencies. Space Grotesk + Inter already loaded via `__root.tsx`.
- Case studies routes stay mounted; only nav/footer links removed.
- All server functions, auth, RLS, and MCP tooling untouched.
