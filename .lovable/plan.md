# NDH — Developer Handoff (build outside, import back)

Full picture of the project as it stands: what's built, what's left, what to remove, and what must not be touched.

---

## 1. Taking the code out and bringing it back

- Use GitHub sync (Lovable → GitHub → Connect). That gives a repo with the exact code; work on a branch and push back.
- Do NOT copy files into a fresh project — backend keys and generated integration files are wired to this project.
- When you push back, tell me and I review, apply any migrations, build, and publish.

Local run:

```text
bun install
bun run dev      # http://localhost:8080
```

`.env` in the repo carries `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`. Server secrets (Paystack, AI key, service role) are injected by the platform and are **not** available on your machine — anything using them is tested here, not locally.

---

## 2. Stack and tools in use

| Area | Tool |
|---|---|
| Framework | TanStack Start v1 (React 19, file routes in `src/routes`) |
| Build | Vite 7 + Bun |
| Styling | Tailwind v4 via `src/styles.css` (semantic tokens) + shadcn/ui |
| Data fetching | TanStack Query |
| Backend | Lovable Cloud (Postgres + Auth + Storage) |
| Server logic | `createServerFn` in `*.functions.ts`; raw HTTP in `src/routes/api/public/*` |
| AI | Lovable AI Gateway (`src/lib/ai-gateway.server.ts`), `google/gemini-3.6-flash`, Vercel AI SDK |
| Payments | Paystack (server fn init + webhook at `src/routes/api/public/webhooks/paystack.ts`) |
| Email | React Email templates in `src/lib/email-templates/`, sender domain `notify.ndh.com.ng` |
| Agents | MCP endpoints under `src/routes/[.mcp]/`, tools in `src/lib/mcp/tools/` |

Design language: Space Grotesk (display) + Inter (body); white background, Electric Blue `#1D4ED8` accent; no gradients, glow, or purple.

---

## 3. Database

~80 tables. The ones that matter now:

**New AI Academy (already created):** `schools`, `academy_courses`, `academy_lessons`, `academy_pricing`, `academy_projects`, `academy_assignments`, `academy_quiz_questions`, `academy_lesson_progress` (one row per student+lesson watched), `academy_exam_attempts` (AI paper, answers, scores, pass flag), `academy_project_submissions` (brief, work, AI score/feedback, status `submitted | approved | rejected`), `certificates`.

**Legacy diploma model (still in DB, being retired from UI):** `courses`, `modules`, `lessons`, `enrollments`, `lesson_progress`, `assignments`, `assignment_submissions`, `transcripts`, `exam_schedules`, `academic_calendar`, `instructors`, `students`, `tuition_prices`, `curriculum_change_requests`, `graduate_recommendations`.

**Bureau (services):** `tasks`, `task_events`, `quotes`, `project_quotes`, `clients`, `talents`, `talent_reviews`, `talent_portfolio_items`, `talent_payout_accounts`, `payments`, `invoices`, `payroll`, `payroll_runs`, `expenses`, `refunds`, `finance_ledger`, `messages`, `notifications`.

**Site/CMS:** `blog_posts`, `case_studies`, `services`, `faq_items`, `job_openings`, `team_members`, `homepage_stats`, `site_content`, `site_pages`, `newsletter_subscribers`, `support_tickets`, `chat_*`.

**Access control:** `user_roles` + enum `app_role` (client, talent, student, instructor, pm, hod, admin, super_admin, finance), `has_role()`. Invites: `pm_invitations`, `talent_invitations`.

SQL rule: every new `public` table needs `CREATE TABLE` → `GRANT` → `ENABLE ROW LEVEL SECURITY` → policies, in that order. Put new SQL in `supabase/migrations/*.sql` and I apply it here — you cannot run migrations from outside.

---

## 4. Already done

- Full public-site redesign to the mature marketplace look (home, services, academy, blog, about, contact, trust, refunds, careers, FAQ, team).
- Anonymous talent identity (`NDH-DS-1234`, no names/photos) — `src/lib/talent-id.ts`.
- Auth pages restyled (`AuthShell`), password rules, forgot/reset.
- CMS panels for blog + case studies in Super Admin.
- Newsletter, support tickets, AI chat widget, scoping wizard (`/start-project`).
- MCP agent integrations; email infra on `notify.ndh.com.ng`.
- AI Academy first pass: `src/lib/academy/ai.functions.ts` (AI exam generation + grading, AI project brief + grading), `src/routes/_authenticated/academy.learn.$slug.tsx` (linear YouTube player → exam → project), students land on `/academy` catalog after signup.
- Director `CourseEditor.tsx` for course CRUD + regional pricing.

---

## 5. Left to build (outside)

### A. Director portal completion
- **Project Reviews tab** — list `academy_project_submissions` with status `submitted`; show AI score, feedback, link to work; **Approve & sign** (issue certificate + email via `CertificateIssuedTemplate`) and **Reject with note** (status `rejected`, resets the project, sends a "needs revision" email — template still to create).
- **Progress tab** — per course: student, % lessons watched, exam score, project status, certificate status.
- **Course Editor** — finish the Learning Objectives tab (4–8 bullets, feeds AI exam) and Project Theme tab (feeds AI brief); drag-to-reorder lessons.

### B. Access & role granting
- Super Admin **Users & Invites** screen: search users, view roles, grant/revoke, audit entry.
- **Grant Director** action on an existing user.
- Invite-only signup for PM / Talent / Director via single-use 7-day tokens (reuse the `pm_invitations` / `talent_invitations` pattern) with an invalid-token page.
- Public signup stays open only for `student` and `client`.

### C. Collapse the extra portals
Convert to `beforeLoad → redirect` (pattern: `src/routes/admin.pm.tsx`):
- `/dashboard/hod`, `/dashboard/registrar`, `/dashboard/student-affairs`, `/dashboard/instructor` → `/dashboard/academy-director`
- `/dashboard/finance` → `/dashboard/super-admin?tab=finance`

Then delete the unused shells (`hod/HodShell.tsx`, `registrar/RegistrarShell.tsx`, `affairs/AffairsShell.tsx`, `instructor/InstructorShell.tsx`, `finance/FinanceShell.tsx`) and their links in `src/components/dashboard/Sidebar.tsx`.

Final portal set:

```text
Super Admin   → Bureau · Academy · CMS · Users & Invites · Finance · Settings
Director      → Courses · Progress · Certificates queue · Pricing
PM            → Tasks · Quotes · Talent · Messages
Talent        → My Tasks · Earnings · Portfolio · Settings
Client        → Submit · My Tasks · Billing · Messages
Student       → My Courses · Certificates · Profile
```

### D. Student portal trim
Remove the Student ID card (`StudentIdCard.tsx`) and Transcripts — diploma-era leftovers. Keep My Courses · Certificates · Profile.

### E. PM boundary
PMs must not read `certificates`, `academy_exam_attempts`, `academy_project_submissions`, `enrollments`, and must not write `academy_courses`. Enforce in RLS **and** hide in UI.

### F. Pricing defaults
New courses: Nigeria ₦4,900–₦9,900 · Africa $5–$12 · Global $9–$19, editable per course in `academy_pricing`.

---

## 6. To remove / retire

- Old diploma UI: `academy.certificate-programs.tsx`, `academy.diploma-programs.tsx`, `academy.professional-programs.tsx`, `ProgramCategoryPage.tsx`, `ProgramDetailsDialog.tsx`.
- The retired dashboard shells in 5C.
- `StudentIdCard.tsx` and transcripts UI.
- Old module/lesson player `student.course.$id.tsx` (superseded by `academy.learn.$slug.tsx`).
- Leave legacy **tables** in the database — stop surfacing them, no destructive migrations.

---

## 7. Do not touch

**Auto-generated / platform-owned (edits get overwritten or break the build):**
`src/integrations/supabase/client.ts`, `client.server.ts`, `auth-middleware.ts`, `auth-attacher.ts`, `types.ts` · `src/routeTree.gen.ts` · `.env` · `supabase/config.toml` · `src/routes/lovable/**` · `src/routes/[.mcp]/**` · `src/routes/[.well-known]/**` · `.lovable/`

**Do not change:**
- The router — TanStack Router only. No `react-router-dom`, no `BrowserRouter`, no `src/App.tsx`, no `src/pages`.
- `ssr.external` / `resolve.external` in `vite.config.ts` — breaks the Worker build.
- Design tokens in `src/styles.css`; no hardcoded `text-white` / `bg-[#...]`, no gradients or glow.
- DB schemas `auth`, `storage`, `realtime`, `vault`, `supabase_functions`.
- Role storage — roles live in `user_roles`, never on `profiles`. Don't drop `app_role` enum values.
- No Supabase Edge Functions — this stack uses `createServerFn` + `src/routes/api/public/*`.
- No Node-only packages (sharp, canvas, puppeteer, child_process) in server code — it runs on a Worker runtime.

**Won't work locally, test here:** Paystack init/webhook, Lovable AI calls, email sending, service-role/admin queries.

---

## 8. When you send it back

Push the branch and tell me. I review the diff, apply any `supabase/migrations/*.sql` you added, run the build and security scan, then publish to `ndh.com.ng`.
