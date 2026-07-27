# NDH Platform Overhaul — Unified Plan

Executing in 5 parts, sequentially. Where a decision isn't specified, I'm defaulting as noted.

---

## PART 1 — Design System Overhaul

**1.1 Signature Path component** (`src/components/site/Path.tsx`)
- Reusable SVG-based connected line with glowing nodes (dots)
- Props: `steps: {label, status?}[]`, `orientation: horizontal|vertical`, `variant: hero|academy|tracker`
- Animation: continuous shimmer along the line + pulse on nodes; teal (`#2DD4BF`) as the primary glow color
- Used in: homepage hero (Submit → AI-Powered Work → Delivered), academy hero (Learn → Certify → Earn), and Client Dashboard task tracker (real task status states)

**1.2 Typography**
- Add Space Grotesk (confident modern display) via Google Fonts `<link>` in `__root.tsx` head
- Keep Inter for body (add if not already)
- Update `src/styles.css` `@theme` → `--font-display: "Space Grotesk"`, `--font-sans: "Inter"`
- Bold, tighter tracking for h1-h4

**1.3 Homepage layout variety** (`src/routes/index.tsx`)
- Services section: keep card grid but restyle — asymmetric with large left title + right grid
- Features section: convert to bento-style layout (mixed cell sizes)
- Steps section: DELETE — replaced by Path component (see 1.4)

**1.4 Remove "01/02/03" pattern**
- Replace numbered steps with `<Path variant="hero" steps={[Submit, AI-Powered Work, Delivered]} />`

**1.5 Scroll-linked animations**
- Use `framer-motion` `useScroll` + `useTransform` (already installed via existing Parallax); no GSAP dependency added
- Hero: parallax + Path node progress tied to scroll
- Path: line stroke-dashoffset animates with scrollYProgress
- Mobile (<768px): disable scroll-linked transforms, keep static animations, respect `prefers-reduced-motion`

**1.6 UnsplashImg fix** (`src/components/site/UnsplashImg.tsx`)
- Remove `picsum.photos` fallback entirely
- On Pexels failure/empty → render existing `bg-gradient-brand` block directly

---

## PART 2 — Homepage Content Honesty

**2.1 Testimonials** — Remove the 3 fake testimonials (Aisha Bello, James Rowe, Tunde Adeyemi) on homepage. Replace with founder's note card (Ataurrahman Najeeb Ahmad, Founder & CEO) + small text "Client case studies coming soon."

**2.2 Team** — Update `team_members` table via `supabase--insert`: delete all rows, insert only Ataurrahman Najeeb Ahmad. Team page layout unchanged (accepts more rows later).

**2.3 Portfolio** — Homepage portfolio grid → "Case studies launching soon" styled placeholder. The `/case-studies` page keeps its CMS-driven grid (12 seeded rows) — user said "keep it" previously. Just remove the homepage portfolio teaser rendering fake ones. Actually re-check: the homepage currently reads from `case_studies` table too. If those 12 are fake, I'll clear them via `supabase--insert` DELETE and show placeholder on both home and `/case-studies`.

Clarification needed → defaulting to: **delete the seeded 12 case studies** (they were AI-generated in an earlier phase), show clean placeholder on both home teaser and `/case-studies` page. Admin CMS still works to add real ones later.

---

## PART 3 — Security & Data Fix

**3.1 AdminShell Overview** (`src/components/dashboard/admin/AdminShell.tsx`)
- Split stats: Bureau stats (Users, Tasks, Payments) always visible; Academy stats (Courses, Enrollments, Students) only when `isSuper`
- Audit Users & Roles tab: hide student/instructor/hod filters when not `isSuper`
- Audit Departments tab: Academy departments hidden when not `isSuper`
- Audit Activity tab: filter events to Bureau-related when not `isSuper`

---

## PART 4 — Simplify Navigation

**4.1 Hide dashboards from nav & role-based redirect** (do not delete code):
- Hide: HOD, Registrar, Student Affairs, Finance Admin, Instructor
- In `src/lib/auth.tsx` `roleHome()`: route those roles to `/dashboard/client` or a "coming soon" fallback
- In `Sidebar.tsx`: hide sidebar entries for those roles
- Routes remain in `src/routes/_authenticated/dashboard/*` (accessible only via direct URL for testing)

**4.2 Active dashboards**: Client, Talent, PM, Academy Director, Super Admin, Admin

**4.3 Navbar simplification** (`src/components/site/Navbar.tsx`)
- Reduce to: Logo | Home | Services | Academy | Sign In | Sign Up
- Remove secondary links from mobile drawer too (About, Team, Blog, Careers, Contact stay accessible via footer only)
- Replace "Start a Project" CTA with "Sign Up" button

---

## PART 5 — Academy Rebuild (AI Schools)

**5.1 Schema migration** (single migration):
- New enum `school_type`: `writing`, `design`, `media`, `marketing`, `tech`, `business_support`
- New table `public.schools` (id, slug, name, description, icon, display_order)
- New table `public.academy_courses` (id, school_id, slug, name, description, region_prices jsonb, is_published)
- New table `public.academy_lessons` (id, course_id, position, title, video_url, notes)
- New table `public.academy_assignments` (id, course_id, instructions)
- New table `public.academy_quizzes` (id, course_id) + `academy_quiz_questions` (id, quiz_id, question, options jsonb, correct_index)
- New table `public.academy_projects` (id, course_id, brief)
- New table `public.academy_pricing` (region text, tier: single|school|full, currency, amount) — seeded per point 17
- All with GRANTs (anon SELECT for published content; authenticated for enrolled; admin write via RLS using `has_role`)
- Timestamps + `update_updated_at_column` triggers

**5.2 Seed data**
- Insert 6 schools + 23 empty courses (name, school_id, region_prices JSON with 5 regions × single price)
- Insert pricing rows for all 5 regions × 3 tiers

**5.3 Retire old academy structure**
- Remove/hide routes: `/academy/certificate-programs`, `/academy/diploma-programs`, `/academy/professional-programs`
- Keep `courses` table (used by legacy code) but Academy public page reads from new `academy_courses`

**5.4 Public Academy page rebuild** (`src/routes/academy.tsx`)
- Hero with Path component (Learn → Certify → Earn)
- 6 school sections, each showing its courses as cards
- Pricing table showing 5 regions × 3 tiers
- Region detected by browser locale (default Nigeria), user-switchable

**5.5 Course Management form** (`src/components/dashboard/director/CourseEditor.tsx`)
- Accessible from Academy Director dashboard + Super Admin
- Fields: School dropdown, Name, Price (per region, editable), Description, dynamic Lessons list, Assignment textarea, dynamic Quiz questions, Project textarea
- Single "Save" button — saves all present fields, empty ones OK
- Course list view: shows all 23 with completion badges (has lessons? has quiz? has project?)

**5.6 Server functions** (`src/lib/academy/schools.functions.ts`)
- `listSchoolsWithCourses()` — public
- `getCourseFull(slug)` — public (published) or director/admin
- `saveCourse(courseId, {lessons, assignment, quiz, project, name, price, description})` — director/admin only

---

## Technical notes

```text
Path component data flow
────────────────────────
scrollYProgress ──► useTransform ──► strokeDashoffset (line)
                                └──► node opacity + pulse trigger
                                
teal glow: filter: drop-shadow(0 0 12px oklch(0.78 0.13 180 / 0.6))
```

**Migration order**: (a) schools schema + seeds, (b) delete fake team/case_studies data via `supabase--insert`. Both need approval.

**Env/secrets**: none new needed.

---

## Deferred / flagged

- Payment integration for the new tier-based pricing (Paystack for NGN exists; other regions would need Stripe/Paddle) — out of scope this pass, marked TODO
- Migrating existing legacy `courses` table data — left in place, not surfaced on new Academy page
- Enrollment flow for new academy courses — schema supports it (`enrollments` table can reference `academy_courses` via a new column later), but UI stays view-only this pass

## Confirmation before I start

Two decisions I'm defaulting on — reply with changes if wrong:
1. **Delete the 12 seeded case studies** (they were AI-generated, not real) — confirm or say "keep them"
2. **Legacy `/academy/certificate-programs` etc. routes** — redirect to new `/academy` (confirm or say "keep as archive")

Say "go" (or amend) and I'll execute end-to-end, notifying at each part boundary.