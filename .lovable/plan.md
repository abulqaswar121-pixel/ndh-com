# NDH Enhancement Pass — 3 Upgrades

This is a very large scope. I'll execute in sub-phases and notify you at each major milestone. Please confirm the plan (and the two decisions below) before I start.

## Sub-phase order

1. **Fix Blog + seed 5 posts** (currently shows "Loading articles…")
2. **Unify Case Studies system**
   - Extend existing `case_studies` table with the fields listed (client_photo, client_quote, gallery, video, metrics, featured, display_order, SEO)
   - Seed 6 sample case studies
   - Wire homepage Portfolio + Testimonials + Services page portfolio + `/case-studies` list + `/case-studies/[slug]` to the same table
   - Remove hardcoded testimonials
   - Super Admin CMS panel (list/create/edit/delete/reorder/publish/feature, gallery upload, rich text, SEO)
3. **Full CMS for the rest** (each with Super Admin panel + public site pulling from DB)
   - Team Members (rename founder to "Ataurrahman Najeeb Ahmad")
   - Homepage Stats
   - Homepage Copy (hero, section headings, CTAs, feature cards, about text, academy promo, final CTA, newsletter)
   - Services (6 services with rich fields)
   - FAQ (homepage + `/faq`)
   - Careers / Job Openings (fix broken link, functional application form)
4. **Premium scroll-linked animations** (framer-motion + gsap + @gsap/react)
   - Global rules: reversible, `prefers-reduced-motion`, reduced intensity on mobile
   - All 14 sections in your list
5. **Dashboard micro-animations** (sidebar slide-in, staggered cards, count-ups, chart draw-in, table row stagger, modal fade+scale, toast bounce, theme transition)
6. **AI chat widget** (replaces current ContactWidget)
   - Lovable AI (`google/gemini-3-flash-preview`) via `createServerFn`, streamed via `useChat`
   - New tables: `chat_conversations`, `chat_messages`, `chat_settings`
   - Full NDH context in system prompt (services, 21 courses, pricing, workflow, contact, hours)
   - Quick replies, typing indicator, page suggestions, human-handoff → creates `support_tickets` row
   - Rate limit: 20 msgs/hour/session (IP + session id)
   - Super Admin panel: edit system prompt, welcome, quick replies, view history, view flagged, enable/disable, position, color
   - localStorage session persistence, mobile full-screen

## Two decisions I need from you

1. **Rich text editor** for CMS bodies (challenge/solution/results, blog content, FAQ answers, service long descriptions). Pick one:
   - **Markdown textarea + preview** (fastest, no extra deps, renders via existing markdown pipeline)
   - **Tiptap WYSIWYG** (heavier, adds ~5 deps, nicer authoring)

2. **AI chat conversation history**: per `chat-agent-ui-contract` I have to ask.
   - **One conversation per visitor, localStorage** (recommended for a site widget — no auth needed)
   - **One conversation + database** (persists across devices for logged-in users, anon in localStorage)
   - **Threaded + database** (overkill for a support widget)

## Technical notes

- No new secrets required. `LOVABLE_API_KEY` already provisioned → AI chat works out of the box.
- Case Studies table already exists from a prior sub-phase; migration will `ALTER TABLE` to add the missing columns (client_photo_url, client_logo_url, client_quote, gallery_images, video_url, metrics jsonb, project_duration, team_members, featured, display_order, SEO fields).
- Homepage copy stored as a single `site_content` key/value JSONB table so I don't hardcode a rigid schema.
- Animations: I'll gate the heavy GSAP ScrollTriggers behind a `useReducedMotion` check and `md:` breakpoint intensity so Lighthouse stays ≥85.
- I will NOT touch dashboard business logic — only presentation for phase 5.

## What I'll deliver at the end

Preview URL, CMS section paths under Super Admin, screenshots of the AI chat widget, list of any env keys (expect: none), confirmation that hardcoded content is now DB-driven, and a note of any breaking changes.

## Time expectation

This is ~6 sub-phases of substantial work. I'll notify you at the end of each sub-phase, not sub-step, as you previously requested.

**Reply with your two choices (or "1 and 1", "2 and 1", etc.) and I'll start with Sub-phase 1 (Blog fix + seed).**
