# NDH Platform — Premium Rebuild Plan

This is a large multi-week scope. To ship quality (not a half-broken mega-PR), I'll execute in clearly-scoped phases. Approve the plan, then I'll start Phase 1 immediately. Each later phase ships in its own turn so you can review as we go.

---

## Global decisions (apply to all phases)

- **Animations**: Framer Motion + CSS. GSAP only where Framer can't (parallax pinning).
- **Visuals**: All images via `https://source.unsplash.com/...` keyword URLs (no upload step). Background videos via direct Pexels/Mixkit/Coverr CDN MP4s. Lottie via `lottiefiles.com` JSON URLs rendered with `@lottiefiles/dotlottie-react`. Illustrations via Storyset CDN PNGs.
  - Note: third-party hotlinking can occasionally rate-limit or break. Acceptable per your "auto-fetch everything" directive; we'll add graceful fallbacks (skeleton → solid gradient) so nothing renders as a broken image box.
- **No floating WhatsApp button** — removed entirely. WhatsApp number is footer text only.
- **Bureau vs Academy** are visually separated (different accent gradient, nav context, hero treatment).
- **Backend**: Lovable Cloud (Supabase under the hood) — enabled in Phase 3 when we add auth + portals. Public site (Phases 1–2) ships without it.
- **PWA**: manifest + icons only (installable, splash, app icon). Full offline + push deferred unless you explicitly want them — they add fragility and the PWA skill recommends manifest-only for "installable app" requests.

---

## Phase 1 — Foundation + Public Marketing Site (this turn)

1. **Design system upgrade** in `src/styles.css`: refined navy→purple→teal gradient tokens, glassmorphism utility, animated blob keyframes, smoother shadows, scroll-reveal utilities.
2. **Install**: `framer-motion`, `@lottiefiles/dotlottie-react`, `react-intersection-observer`.
3. **Shared shell**:
   - New `Navbar` (glass on scroll, animated underline, Bureau/Academy mode switch, dark toggle).
   - New `Footer` (5 columns exactly as spec, 2 emails, Sokoto location, FB+IG, WhatsApp as text, "Built by NDH in Sokoto, Nigeria").
   - Delete `WhatsAppFab` and remove from layout.
   - `AnimatedBlobs`, `Reveal` (fade+slide on scroll), `Counter` (already exists — upgrade to IntersectionObserver), `Marquee`, `TypingHeadline`, `LottiePlayer`, `UnsplashImg` (with skeleton+fallback), `VideoHero` components.
4. **Pages rebuilt with premium design + auto-fetched media**:
   - `/` Homepage — video hero, typing tagline, 3 CTAs, animated stats, 6 service cards, How It Works, Why NDH, Academy promo, testimonials carousel, final CTA, newsletter.
   - `/services` — hero, 6 detailed services, portfolio mockups grid.
   - `/about` — story, mission/vision/values, diaspora map visual, founder section, Sokoto office.
   - `/team` — Founder + Leadership + 5 HODs + 5 PMs (diverse fictional profiles with Unsplash portraits).
   - `/academy` — hero, why, how-it-works, full Certificate/Diploma/Professional program lists (every program from your spec), calendar, entry req, geo-priced tuition table, testimonials, verify-cert link.
   - `/academy/courses/$slug` — dynamic course detail page (overview, curriculum modules, instructor, schedule, geo-pricing, apply).
   - `/contact` — form, email/phone, Sokoto map embed, FB+IG, business hours.
   - `/blog` — featured + grid, categories, search, newsletter.
   - `/careers` — open roles, why work at NDH, application form, note about talents being email-recruited.
   - `/verify` — cert ID/QR lookup UI.
   - `/talent-application` — email-based application form (replaces old "Join Talent" sign-up).
   - `/submit-task` — pre-portal task brief form.
   - `/faq`, `/terms`, `/privacy` — restyled.
   - `404` not-found page — animated.
5. **PWA manifest + icons** (manifest-only, installable). Apple touch icon, theme color, splash.
6. **SEO**: per-route `head()` with title/description/og.

Deliverable: full marketing site live, no portals yet, no auth.

---

## Phase 2 — Auth + Beautiful Sign-in (next turn)

- Enable Lovable Cloud.
- Split-screen auth pages (illustration left, form right, Google OAuth top, email below).
- Roles table (`app_role` enum: client, talent, student, instructor, pm, hod, academy_director, finance, registrar, student_affairs, ops_manager, super_admin) + `has_role` SECURITY DEFINER per the user-roles rule.
- `profiles` table with auto-create trigger.
- Routes: `/login`, `/signup` (client + student only — talent/instructor/admin login-only), `/forgot-password`, `/reset-password`.
- `_authenticated` route gate.

---

## Phase 3 — Client Portal + Task Submission

- Client dashboard, multi-step task submission wizard, task list with statuses, messaging (client ↔ PM only), invoices stub, profile settings.

## Phase 4 — Talent Portal

- Invite-only access (no signup UI), assigned tasks, submit work, earnings, tier progress, PM messaging. Client identity fully masked.

## Phase 5 — Academy LMS (Student + Instructor)

- Student signup, course player, assignments, exams, grades, downloadable cert with QR, forum, ID card, payments stub. Instructor dashboard (invite-only).

## Phase 6 — Admin Panels

- Super Admin, Ops Manager, PM (per dept), Finance, Academy Director, HODs, Registrar, Student Affairs. Role-gated layouts under `_authenticated/admin/*`.

## Phase 7 — Payments, Payroll, Escrow, Notifications, PWA offline (optional)

---

## Technical notes (non-user-facing)

- TanStack Start file-based routes. Dynamic course = `src/routes/academy.courses.$slug.tsx`.
- All third-party media wrapped in error-boundary fallback to a gradient block so a failed Unsplash/Pexels request never shows a broken-image icon.
- Framer Motion `LazyMotion` + `domAnimation` to keep bundle slim.
- No Supabase mention to users — call it Lovable Cloud.

---

## What I need from you

**Reply "go" to start Phase 1.** Or tell me to adjust scope (e.g. "skip team page", "do auth in Phase 1 too", "drop PWA"). Phase 1 alone is a substantial build; trying to do Phases 1–6 in one turn would produce broken output.