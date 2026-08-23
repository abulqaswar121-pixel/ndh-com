# Clean-slate foundation rebuild

Wipe this project back to bare metal and rebuild only the foundation, in your order, then stop. No copy, no stats, no case studies, no team members, no sample rows.

**This deletes everything.** All 58 routes, every dashboard component, and all ~80 database tables with their data. It cannot be undone. Say the word and I start.

---

## Step 1 — Reset the backend

Drop the entire `public` schema and rebuild it empty: all ~80 tables, all custom functions and triggers, all enums. Also removes the old `handle_new_user` signup trigger (the one with the role-escalation hole).

Kept: the auth system itself, your user login records, and the three storage buckets.

## Step 2 — Auth with five roles

Roles: `client`, `student`, `talent`, `pm`, `admin`.

The rule you asked for, enforced at the database level:

- Roles live in their own `user_roles` table, never on the profile.
- The signup trigger **ignores anything the signing-up user sends.** It reads only a single allowed hint — `client` or `student` — and anything else, including `admin` or a missing value, becomes `client`. There is no path from a signup request to `talent`, `pm`, or `admin`.
- Only an admin can change a role, through a guarded server function that verifies the caller is an admin before it writes. Direct role edits from the browser are blocked by policy.

Login and signup both work with email/password and Google.

## Step 3 — Your real images

Both files are already in the project and stay exactly as they are:

- `src/assets/ndh-logo-new.jpg` — your logo
- `src/assets/founder-office.jpg` — your real photo

I delete the 9 stock/AI images sitting alongside them (the fake testimonial headshots, the generic office and team shots). No placeholders anywhere.

## Step 4 — Empty page shells

Nine routes, each a blank page with just its own title and page metadata:

| Route | Page |
|---|---|
| `/` | Homepage |
| `/agency` | Agency |
| `/academy` | Academy |
| `/login` | Login |
| `/signup` | Signup |
| `/portal/client` | Client Portal |
| `/portal/student` | Student Portal |
| `/portal/talent` | Talent Portal |
| `/portal/pm` | PM Portal |
| `/portal/admin` | Admin Portal |

The five portals are **role-gated from day one**: signed out sends you to login, and signing in with the wrong role sends you to your own portal. Empty inside, but the access control works.

Everything else — all 48 other routes, every dashboard component, every email template, the MCP files, the AI functions — is deleted.

## Step 5 — Base tables (all empty)

Ten tables, no rows:

| Table | Holds |
|---|---|
| `profiles` | name, email, avatar, phone, country |
| `user_roles` | which roles each person has |
| `projects` | client work: title, brief, status, budget, PM, dates |
| `tasks` | units of work under a project: assignee, status, due date |
| `courses` | title, slug, summary, price, published flag |
| `lessons` | course, title, video URL, order, free-preview flag |
| `enrollments` | student, course, status, progress, enrolled date |
| `talent_profiles` | headline, skills, rate, availability, vetting status |
| `invoices` | number, client, project, amount, currency, status, due date |
| `escrow_status` | invoice, held/released/refunded, amounts, timestamps |

Every table gets access rules from the start: people see their own records, staff see what their role allows, admins see everything. Money tables (`invoices`, `escrow_status`) are read-only to clients and writable only by admins.

## Step 6 — Verify and stop

Confirm the app builds clean with zero errors, all nine routes load, and every table is empty. Then I stop and hand over to you for the GitHub export.

---

## Technical notes

- Stack unchanged: TanStack Start + Tailwind v4 + Lovable Cloud. Same backend instance, schema fully reset.
- The signup trigger is `SECURITY DEFINER` with a hard whitelist: `CASE WHEN metadata role IN ('client','student') THEN that ELSE 'client' END`.
- Every new table follows CREATE → GRANT → ENABLE RLS → POLICY, with `anon` grants omitted (nothing here is public yet).
- Role checks use a `has_role(uid, role)` security-definer helper so policies never recurse.
- Portal gating uses a `_portal` pathless layout route plus per-portal role checks; server functions re-verify the role independently, since a route guard alone never protects an endpoint.
- Design tokens in `src/styles.css` reduce to a neutral base so your coding agent picks the visual direction, not me.
