
-- FAQ
INSERT INTO public.faq_items (question, answer, display_order, published) VALUES
('How is NDH different from a freelance marketplace?', 'We are a managed bureau. You never have to find or chase a freelancer — your PM does that.', 1, true),
('Do I talk to talents directly?', 'No. To protect quality, talents only communicate with their PM. You only talk to your PM.', 2, true),
('How much does a project cost?', 'Quotes are tailored to your brief and tier. Submit a task and a PM will respond within 24 hours.', 3, true),
('Which currencies do you accept?', 'We bill in NGN, USD, GBP, EUR, CAD and AED depending on your region.', 4, true),
('How are talents paid?', 'Talents are paid weekly to their bank accounts after QA-approved delivery.', 5, true),
('Are NDH Academy certificates verifiable?', 'Yes — every certificate has a unique ID and QR code, verifiable at /verify.', 6, true);

-- Homepage stats
INSERT INTO public.homepage_stats (label, value, suffix, display_order, published) VALUES
('In-house talents', '120', '+', 1, true),
('Projects delivered', '800', '+', 2, true),
('Countries served', '15', '+', 3, true),
('Client satisfaction', '98', '%', 4, true);

-- Services
INSERT INTO public.services (slug, name, icon, short_description, long_description, included, display_order, published, featured) VALUES
('design', 'Design', 'Palette', 'Brand identity, UI/UX, social creatives.', 'End-to-end design: brand systems, product interfaces and marketing creative.', '["Brand identity & logo","UI/UX design","Social media creatives","Print & packaging"]'::jsonb, 1, true, true),
('development', 'Development', 'Code2', 'Web apps, mobile, ecommerce, APIs.', 'Modern web and mobile engineering — from marketing sites to SaaS platforms.', '["Websites & landing pages","Web apps & SaaS","Mobile apps","Ecommerce & APIs"]'::jsonb, 2, true, true),
('content', 'Content Writing', 'PenTool', 'Articles, copy, scripts, SEO.', 'Editorial, SEO and brand copy that converts and ranks.', '["SEO articles","Brand copy","Email & newsletters","Scripts & ghostwriting"]'::jsonb, 3, true, true),
('marketing', 'Digital Marketing', 'Megaphone', 'Ads, SEO, social, growth.', 'Performance marketing, content strategy and always-on social.', '["Meta & Google ads","SEO & content strategy","Social media management","Influencer campaigns"]'::jsonb, 4, true, true),
('media', 'Media Production', 'Clapperboard', 'Video, motion, podcast, photo.', 'Video, motion graphics, photography and podcast production.', '["Video production & editing","Motion graphics","Photography","Podcasts"]'::jsonb, 5, true, true),
('ai', 'AI & Tech Services', 'Brain', 'Automation, agents, integrations.', 'Custom AI, workflow automation and data tooling for your business.', '["Workflow automation","Custom AI agents","Data dashboards","Integrations"]'::jsonb, 6, true, true);

-- Team members (leadership + HODs + PMs)
INSERT INTO public.team_members (full_name, role, department, bio_short, display_order, published, featured_home) VALUES
('Ataurrahman Najeeb Ahmad', 'Founder & CEO', 'Executive', 'Builds NDH like a serious tech company — measurable craft, fair pay, real outcomes.', 1, true, true),
('Hassan Al''amin Hassan', 'Operations Manager', 'Leadership', 'Runs day-to-day delivery, PM rituals and QA standards.', 2, true, true),
('Hamza Suleiman', 'Academy Director', 'Leadership', 'Owns curriculum, faculty and the Learn → Earn pipeline.', 3, true, true),
('Saleem Mujahid Basheer', 'Finance Admin', 'Leadership', 'Billing, payroll, escrow — clean money flow for clients and talents.', 4, true, true),
('Ibrahim Lawal', 'HOD · Design', 'HOD', 'Brand systems, UI and the visual standard for every NDH project.', 5, true, false),
('Chinwe Okafor', 'HOD · Development', 'HOD', 'Web, mobile and platform engineering across the bureau.', 6, true, false),
('Yusuf Bello', 'HOD · Content', 'HOD', 'SEO, brand copy and editorial across client work and the blog.', 7, true, false),
('Grace Adeyemi', 'HOD · Marketing', 'HOD', 'Performance ads, growth strategy and analytics.', 8, true, false),
('Aisha Muhammad', 'HOD · Media', 'HOD', 'Video, motion, photography and podcast production.', 9, true, false);

-- Job openings
INSERT INTO public.job_openings (slug, title, department, location, employment_type, description, published, display_order) VALUES
('pm-design', 'Project Manager · Design', 'Design', 'Sokoto / Remote', 'Full-time', 'Lead design engagements end-to-end. Coordinate designers, QA output and be the single point of contact for clients.', true, 1),
('pm-development', 'Project Manager · Development', 'Development', 'Sokoto / Remote', 'Full-time', 'Own sprints, scope and shipping for engineering work. Coordinate developers and QA.', true, 2),
('instructor-ux', 'Instructor · UI/UX Design', 'Academy', 'Remote', 'Part-time', 'Teach UI/UX cohorts at NDH Academy. Design curriculum, mentor students and grade projects.', true, 3),
('instructor-fullstack', 'Instructor · Full-Stack Development', 'Academy', 'Remote', 'Part-time', 'Teach full-stack development cohorts. Curriculum + mentorship + reviews.', true, 4),
('hod-marketing', 'HOD · Marketing', 'Marketing', 'Sokoto / Hybrid', 'Full-time', 'Lead the marketing department. Own performance ads, growth strategy and analytics.', true, 5),
('registrar', 'Registrar', 'Academy', 'Sokoto', 'Full-time', 'Own admissions, enrolment, transcripts and certificates for NDH Academy.', true, 6),
('finance-officer', 'Finance Officer', 'Finance', 'Sokoto', 'Full-time', 'Billing, payroll and financial reporting.', true, 7),
('student-affairs', 'Student Affairs Lead', 'Academy', 'Sokoto', 'Full-time', 'Support student experience across the academy.', true, 8);

-- Site content
INSERT INTO public.site_content (key, value) VALUES
('about.story', '{"title":"From a small studio to a multi-department bureau.","paragraphs":["Najeeb Digital Hub started with a simple belief: African creators and engineers can produce work that competes anywhere in the world — if they are properly trained, properly managed and properly paid.","Today, NDH operates as a managed digital bureau with a sister academy. Clients across Nigeria, the UK, US, Canada, Europe and the UAE send us briefs; our Project Managers translate them into work; our vetted in-house talents deliver; our QA ships it. Meanwhile, NDH Academy continuously trains the next wave of professionals.","We exist to make digital opportunity borderless."]}'::jsonb),
('home.hero', '{"eyebrow":"Digital Bureau · Academy · Talent","cta_primary":"Start a project","cta_secondary":"Explore the Academy"}'::jsonb);
