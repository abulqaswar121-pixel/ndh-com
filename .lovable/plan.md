# Phase 3 — NDH Academy (LMS) + Student Portal

This is a very large phase. I'll ship it in 4 reviewable sub-phases so you can test as we go, instead of one giant drop you can't validate.

---

## Sub-phase 3A — Foundation (DB + Public Academy + Seed)

**Database migration** (one migration, with GRANTs + RLS on every new table):
- Extend `courses` (slug, program_type enum certificate/diploma/professional, duration_months, tuition_ngn, thumbnail_url, overview, learning_outcomes jsonb, entry_requirements, schedule, status, instructor_id)
- New: `modules`, `lessons` (type: video/pdf/text), `assignments`, `assignment_submissions`, `tests`, `test_questions`, `test_submissions`, `forum_threads`, `forum_replies`, `lesson_progress`, `live_classes`, `announcements`
- Extend `enrollments` (progress_percentage, motivation_essay, personal_info jsonb, payment_status)
- Extend `certificates` (certificate_number, grade enum, qr_code, pdf_url, verification_token)
- Public read policies for courses/modules/lessons (preview only — full content gated); student-scoped policies for everything else; instructor policies for grading

**Seed** all 21 courses listed (8 Certificate, 8 Diploma, 5 Professional) with slugs, tuition, overview, 4-module placeholder curriculum each, Unsplash thumbnails.

**Public pages:**
- Expand `/academy` (hero, why, how-it-works, 3 program tiles, featured courses, testimonials, verify CTA)
- New: `/academy/certificate-programs`, `/academy/diploma-programs`, `/academy/professional-programs`
- New: `/academy/course/$slug` (overview, what you'll learn, curriculum accordion, instructor, schedule, requirements, geo-priced tuition, reviews, Apply Now)
- Upgrade `/verify` to query real `certificates` table + add `/verify/$id` direct route

---

## Sub-phase 3B — Enrollment + Payment

- Public apply flow at `/academy/apply/$slug` (5-step wizard: account → personal info → education → essay → review)
- Sign-up assigns `student` role; creates `enrollment` (pending_payment)
- Reuses Paystack server fn (extended to accept `enrollment_id` as well as `quote_id`)
- Webhook activates enrollment on success
- Emails: `enrollment_received`, `enrollment_payment_confirmed`

---

## Sub-phase 3C — Student Dashboard / LMS Core

Sidebar shell at `/dashboard/student` with tabs:
- Overview (welcome, progress, next live class, deadlines, announcements)
- My Courses
- **Course Player** (3-pane: module tree • video/PDF/text viewer + mark-complete + notes • progress sidebar)
- Live Classes (calendar + list, Zoom/Meet links, recordings)
- Assignments (Pending/Submitted/Graded tabs, file upload to Storage)
- Tests & Exams (timed test interface, MCQ + written)
- Grades & Transcripts (per-course breakdown, GPA, PDF transcript)
- Discussion Forum (per-course threads + replies, real-time)
- Messages (real-time chat with instructor)
- Payments (history, receipts)
- Settings (profile, password, country/currency, notification prefs)

---

## Sub-phase 3D — Certificates + ID Card + Verification

- Server fn `issueCertificate` triggered when course progress = 100% and passing grade — generates cert number `NDH-CERT-YYYY-NNNNNN`, QR code (data URL to `/verify/$id`), renders PDF (pdf-lib, Worker-compatible), uploads to `certificates` Storage bucket, inserts row, sends `certificate_issued` email with link
- Certificates tab: list, download PDF, "Share on LinkedIn" deep link
- Student ID Card tab: branded digital card (photo, student #, program, QR), download as PNG
- `/verify/$id` public page resolves certificate, shows verified badge + details, or not-found state

---

## What I'll deliver in this turn

**Sub-phase 3A only** (DB migration + seed + public academy pages + course detail pages + verify upgrade). That's already ~15 files plus the migration. After you confirm the migration looks right and the public pages render correctly, I'll proceed to 3B → 3C → 3D in subsequent turns.

**Reply "go" to start with the 3A migration**, or tell me to compress/reorder (e.g. "skip forum and live classes for now", "do enrollment before public pages", "ship it all in one go and I'll review at the end").