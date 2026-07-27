# Simplify portals + AI-run Academy (revised)

The old academy assumed multi-month diploma cohorts with instructors and modules. The new academy is short, self-serve AI courses (curated YouTube videos + your notes + AI-generated Exam + AI-generated Project + your signed certificate). Most staff dashboards built for the old model become dead weight.

This plan aligns every portal with the new reality: **signup → pick course → pay → watch → AI Exam → AI Project → Director signs → certificate emailed**. Only two staff roles run the platform: Super Admin (you) and Academy Director. PMs handle Services only.

---

## Part 1 — How you create a course (Director dashboard)

One **Course Editor** screen, five tabs, no code — writes to existing tables:

- **Basics** — title, short description, cover image, Published/Draft toggle.
- **Pricing** — one row per region (Nigeria ₦, Africa $, Global $). New default range is a **service fee** (AI grading + certificate), not a video fee:
  - Nigeria ₦4,900–₦9,900 · Africa $5–$12 · Global $9–$19. You can still set any number.
- **Lessons** — add lessons: title + YouTube URL + optional notes. Drag to reorder.
- **Learning Objectives** *(new, replaces manual quiz building)* — 4–8 short bullets describing what the student should master. This is what the AI reads to generate a fresh exam per student.
- **Project theme** *(new, replaces one fixed brief)* — a short theme (e.g. "Build a marketing landing page using AI"). AI generates a unique brief per student from this theme.

---

## Part 2 — Student journey (linear, one page per course)

**New account flow:** signup → auto-assigned `student` role → land on **"Choose your course"** catalog (region-priced) → pick one → pay → immediately enrolled → taken to that course's learning page. No detour through a dashboard shell.

**Course page** — one clean vertical layout, each step unlocks the next:
1. **Lessons** — each YouTube video ticks when finished (`ended` event or ≥90% for long videos). Progress bar shows watched ÷ total.
2. **Exam** — locked until every lesson is watched.
3. **Project** — locked until Exam is passed.
4. **Certificate** — issued after Director signs.

Progress stored in a new `academy_lesson_progress` table.

---

## Part 3 — AI-generated Exam (unique per student)

- **Trigger:** student clicks "Start Exam" → server function calls Lovable AI (`google/gemini-3.6-flash`) with the course's learning objectives + lesson notes → AI returns a fresh exam.
- **Structure** (kept the same across students, only the content varies):
  - 5 multiple-choice (auto-graded)
  - 3 short-answer, 1–3 sentences (AI-graded against objectives)
  - 1 short essay, ~150 words (AI-graded against objectives)
- **Timing:** 45-minute countdown, single sitting, autosaves.
- **Attempts:** 1 per day, max 3 total. Pass = 70%.
- **Anti-cheat:** because each paper is unique, sharing answers is useless.
- Stored in `academy_exam_attempts` with the generated paper + answers + AI scores.

---

## Part 4 — AI-generated Project brief + AI grading

- On unlock, student clicks "Get my brief" → AI generates a unique brief from the theme you set → student sees it. Same student re-visits = same brief (cached).
- **Submission:** text write-up + optional link + optional file upload.
- **Grading:** AI (`google/gemini-3.6-flash`) with structured output → `{ score, passed, strengths[], gaps[], verdict }`. Cached per submission — never re-graded (cost guard). Rate limit: 2 project submissions/day per student.
- If AI passes it, a certificate auto-drafts with status `pending_countersign` and student sees "Certificate pending Director signature" — no dead end.

---

## Part 5 — Director certification queue

**Director dashboard gets three tabs:**

1. **Courses** — the Course Editor above.
2. **Progress** — live table per course: student name, % watched, exam score, project status, certificate status.
3. **Certificates queue** — one-line rows: learner, course, exam %, AI project score + brief feedback, link to their submission. Buttons: **Approve & sign** (signs + emails via existing `CertificateIssuedTemplate`) · **Reject with note** (kicks project back with your feedback, resets project only).

Founder countersign stays available as an optional extra — Director signature is final for AI Schools. **PMs are blocked** from the queue and its RPCs via RLS + UI.

---

## Part 6 — Portal access & role granting (the missing piece)

| Role | How they get in |
|---|---|
| Student | Public `/signup` → auto `student` role → catalog → pay → in. No approval. |
| Client | Public `/signup?as=client` → auto `client` role → client dashboard. No approval. |
| Talent | Applies via `/talent-application` → Super Admin reviews → clicks **Invite as Talent** → email invite → signup through link → `talent` role granted. |
| PM | Super Admin → **Invite PM** → email invite → signup through link → `pm` role. No public path. |
| Academy Director | Super Admin → **Grant Director** (picks an existing user) → done. No public path. |
| Super Admin | Fixed/seeded. No UI to create another. |

**Invite tokens:** existing `pm_invitations` / `talent_invitations` tables already support this; extend the same pattern for Director grants. Every token single-use, 7-day expiry, invalid-token page.

**User Management screen (Super Admin):** search any user → view roles → grant/revoke → audit log entry.

---

## Part 7 — Collapse redundant staff portals

**Keep:** Super Admin · Academy Director · PM · Talent · Client · Student.
**Retire (redirect to keep old links working):**
- `/dashboard/hod` → `/dashboard/academy-director`
- `/dashboard/registrar` → `/dashboard/academy-director`
- `/dashboard/student-affairs` → `/dashboard/academy-director`
- `/dashboard/instructor` → `/dashboard/academy-director`
- `/dashboard/finance` → `/dashboard/super-admin?tab=finance`

Roles stay in the DB enum (no destructive migration); the UI just stops surfacing them. Sidebar links to retired dashboards are removed.

**Student dashboard simplified:** My Courses · Certificates · Profile. Student ID card + Transcripts removed (old diploma leftovers).

---

## Portals after the change

```text
Super Admin   → Bureau · Academy · CMS · Users & Invites · Finance · Settings
Director      → Courses · Progress · Certificates queue · Pricing
PM            → Tasks · Quotes · Talent · Messages
Talent        → My Tasks · Earnings · Portfolio · Settings
Client        → Submit · My Tasks · Billing · Messages
Student       → My Courses · Certificates · Profile
```

---

## Technical section

### New tables (one migration, with GRANTs + RLS)
- `academy_lesson_progress(user_id, lesson_id, watched_at, PK(user_id, lesson_id))` — student writes/reads own; Director reads all.
- `academy_exam_attempts(id, user_id, course_id, paper jsonb, answers jsonb, mcq_score, ai_short_score, ai_essay_score, total_score, passed, started_at, submitted_at, created_at)` — student reads/writes own; Director reads all.
- `academy_project_submissions(id, user_id, course_id, brief text, content, file_url, ai_score, ai_feedback jsonb, ai_verdict, status, reviewed_by, reviewed_at, created_at, updated_at)` — student reads/writes own; Director reads all + updates status. `status` ∈ `submitted | approved | rejected`.
- Extend `academy_courses` with `learning_objectives text[]` and `project_theme text`.
- Extend `certificates` with `status` (`pending_countersign | director_signed | founder_signed | issued`) — reuses existing `director_signed_*` / `founder_signed_*` columns.

### New server functions
`src/lib/academy/learning.functions.ts`:
- `markLessonWatched({ lesson_id })`
- `startExam({ course_id })` — AI-generates a paper from `learning_objectives` + lesson notes, stores it, returns the paper (no correct answers).
- `submitExam({ attempt_id, answers })` — auto-grades MCQ, AI-grades short-answer + essay against objectives, computes total.
- `getMyProjectBrief({ course_id })` — returns cached brief or generates one from `project_theme`.
- `submitProject({ course_id, content, file_url? })` — AI-grades; on `passed` upserts `pending_countersign` certificate.

`src/lib/academy/director-queue.functions.ts`:
- `certificateQueue()` · `directorApprove({ certificate_id })` (wraps existing `signCertificate`) · `directorReject({ submission_id, note })` · `courseProgress({ course_id })`.

`src/lib/admin/users.functions.ts` (extend existing admin surface):
- `grantRole({ user_id, role })` · `revokeRole({ user_id, role })` · `searchUsers({ q })` — Super Admin only, writes to audit log.

### AI wiring
- Use existing `src/lib/ai-gateway.server.ts` + `google/gemini-3.6-flash`.
- Structured output via `Output.object` with **small, unconstrained** schemas per `ai-sdk-agent-patterns`. Enforce lengths/limits in the prompt + clamp in code, not in the schema.
- Wrap every generation in `NoObjectGeneratedError.isInstance` fallback that parses `error.text`.
- Rate limits enforced in server functions (per-user, per-day).

### Route changes
- Convert `hod.tsx`, `registrar.tsx`, `student-affairs.tsx`, `instructor.tsx`, `finance.tsx` under `_authenticated/dashboard/` to `beforeLoad → redirect` files (same pattern as `admin.pm.tsx`).
- Update `signup.tsx` post-auth redirect: `student` → `/academy` (catalog) instead of dashboard.
- Rewrite `student.course.$id.tsx` as the new linear learning page.
- Add `admin.users.tsx` in Super Admin for user + role management.

### UI polish
- Course Editor: `src/components/dashboard/director/CourseEditor.tsx` — 5 tabs (Basics · Pricing · Lessons · Learning Objectives · Project Theme), drag-reorder lessons, "Preview as student" button.
- Sidebar: `src/components/dashboard/Sidebar.tsx` — remove links to retired dashboards.
- PM boundary audit: `pm.functions.ts` + RLS confirm PMs cannot read `certificates`, `academy_exam_attempts`, `academy_project_submissions`, `enrollments`, or write to `academy_courses`.

### Emails
- Reuse `CertificateIssuedTemplate` on approve.
- New "Project needs revision" transactional template for rejects.

---

## Defaults locked

- Exam: 5 MCQ + 3 short-answer + 1 essay · **45 min** · pass **70%** · **3 attempts** (1/day).
- Project: text + optional link + optional file · 2 submissions/day · AI-graded once per submission.
- Founder countersign: **optional** — Director signature is final.
- Student portal: **drop** Student ID card + Transcripts.
- Default pricing band: ₦4,900–₦9,900 / $5–$12 / $9–$19 (fully editable).
- Signup redirect: students → `/academy` catalog; clients → client dashboard.
