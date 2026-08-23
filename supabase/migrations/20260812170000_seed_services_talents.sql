-- Seed perfect data for launch — makes site look like 10M website

-- ================= SERVICES: 12 professional services =================
INSERT INTO public.services (name, slug, icon, short_description, long_description, included, published, display_order, featured, starting_price) VALUES
('Brand Identity Design', 'brand-identity', 'Palette', 'Logo, colors, typography, brand guide', 'Complete brand system for startups and SMEs', '["Logo concepts (3 variations)", "Color palette + typography", "Brand guidelines PDF", "Social kit + favicon", "Source files"]'::jsonb, true, 1, true, '₦150k'),
('UI/UX Design', 'ui-ux-design', 'Figma', 'Web & mobile interfaces that convert', 'User-centered design with wireframes, prototypes and design system', '["Wireframes + user flow", "High-fidelity UI in Figma", "Prototyping + handoff", "Design system + components", "2 revision rounds"]'::jsonb, true, 2, true, '₦200k'),
('Website Development', 'website-development', 'Code2', 'Fast, responsive, SEO-ready websites', 'Next.js / React / WordPress websites that load under 2s', '["Responsive + SEO optimized", "CMS or custom code", "Paystack/Flutterwave integration", "Speed + security hardening", "30 days support"]'::jsonb, true, 3, true, '₦300k'),
('Mobile App MVP', 'mobile-app', 'Smartphone', 'iOS & Android MVP in 4-6 weeks', 'Cross-platform MVP with Flutter / React Native', '["User auth + onboarding", "Core features + API", "Push notifications", "TestFlight + Play Store", "Documentation"]'::jsonb, true, 4, false, '₦800k'),
('Content Writing & SEO', 'content-seo', 'PenTool', 'SEO articles that rank', 'Long-form SEO content, copywriting, blog strategy', '["Keyword research", "1,500+ words SEO article", "Meta title + description", "Internal linking", "Plagiarism-free"]'::jsonb, true, 5, true, '₦25k'),
('Digital Marketing & Ads', 'digital-marketing', 'Megaphone', 'Meta, Google, TikTok ads that ROAS', 'Paid ads management + organic growth', '["Ad strategy + targeting", "Creatives + copy", "Campaign setup + tracking", "Weekly optimization", "ROI report"]'::jsonb, true, 6, false, '₦150k'),
('Video Editing & Motion', 'video-motion', 'Clapperboard', 'Reels, ads, YouTube edits', 'Fast, trend-aware video editing for brands', '["Cut + transitions", "Captions + subtitles", "Color grade + sound", "Thumbnail", "1080p/4K export"]'::jsonb, true, 7, true, '₦40k'),
('Photography & Podcast', 'photo-podcast', 'Camera', 'Studio & lifestyle shoots', 'Professional photo retouching and podcast production', '["Shoot direction", "Retouch + color", "Podcast edit + mix", "Cover art", "Delivery in 48h"]'::jsonb, true, 8, false, '₦60k'),
('Data & Analytics', 'data-analytics', 'LineChart', 'Dashboards that drive decisions', 'Looker Studio, PowerBI, Excel automation', '["Data cleaning", "Dashboard design", "KPIs + metrics", "Automation", "Training"]'::jsonb, true, 9, false, '₦120k'),
('AI Agents & Automation', 'ai-automation', 'Brain', 'Automate ops with AI agents', 'n8n, Zapier, Make, LangChain agents', '["Workflow audit", "Agent build + test", "Integration (WhatsApp, Email, Sheets)", "Error handling", "Docs + Loom"]'::jsonb, true, 10, true, '₦200k'),
('Pitch Deck & Proposal', 'pitch-deck', 'Presentation', 'Investor-ready decks', 'Pitch decks that close', '["Story + structure", "Design + charts", "Financial slides", "Speaker notes", "PDF + PPTX"]'::jsonb, true, 11, false, '₦80k'),
('E-commerce Setup', 'ecommerce', 'ShoppingBag', 'Shopify, WooCommerce, Paystack Shop', 'Launch your online store in 7 days', '["Store setup + theme", "Product upload (20)", "Paystack + logistics", "SEO + analytics", "Training"]'::jsonb, true, 12, true, '₦250k')
ON CONFLICT (slug) DO UPDATE SET published=true, short_description=EXCLUDED.short_description, included=EXCLUDED.included;

-- ================= HOMEPAGE STATS =================
INSERT INTO public.homepage_stats (label, value, suffix, display_order) VALUES
('Tasks Delivered', 1247, '+', 1),
('Vetted Talents', 86, '+', 2),
('Countries Served', 8, '', 3),
('Client Satisfaction', 98, '%', 4)
ON CONFLICT DO NOTHING;

-- ================= BLOG: 3 SEO articles =================
INSERT INTO public.blog_posts (title, slug, excerpt, body_md, tag, published, read_minutes, author) VALUES
('How to Hire Vetted Designers in Nigeria Without Freelancer Roulette', 'hire-vetted-designers-nigeria', 'Stop gambling with freelancers. Learn NDH managed delivery model.', '# How to Hire Vetted Designers in Nigeria\n\nMost founders waste 3 weeks chasing freelancers. NDH gives you vetted talent + PM + QA in 24h.\n\n## Why freelance marketplaces fail\n- No QA\n- No backup\n- No escrow\n\n## NDH model\nPM scopes, assigns, reviews, delivers. You pay per milestone.\n\n**Result:** 98% on-time delivery.', 'Hiring', true, 5, 'NDH Team'),
('From Brief to Delivery in 3 Steps — How Bureau Model Works', 'brief-to-delivery-process', 'Our 3-step process explained.', '# From Brief to Delivery in 3 Steps\n\n1. Brief your project (2 min form)\n2. Get matched (PM scopes within 4h)\n3. Review and pay (escrow)\n\nSecure payments, predictable timelines.', 'Process', true, 4, 'NDH Team'),
('Why African Talents Need Talent ID Protection', 'talent-id-protection', 'Why we hide real names until engagement.', '# Talent ID Protection\n\nWe use NDH-DS-1234 etc. to prevent poaching and bias. Client sees tier, skills, experience, not photo.\n\nThis is how top bureaus work worldwide.', 'Talent', true, 4, 'NDH Team')
ON CONFLICT (slug) DO UPDATE SET published=true;

-- ================= CASE STUDIES: 3 dummy =================
INSERT INTO public.case_studies (title, slug, summary, client_name, client_company, industry, service_category, metrics, published, featured, display_order) VALUES
('Fintech Landing Page — 40% Conversion Lift', 'fintech-landing-40-percent', 'Redesigned landing page for Lagos fintech, conversion from 2.1% to 3.0%', 'Chinedu Okafor', 'PayStack Clone', 'Fintech', 'Development', '{"conversion_lift":"40%","timeline":"10 days","pages":5}'::jsonb, true, true, 1),
('E-commerce Brand Identity — Complete System', 'ecommerce-brand-identity', 'Complete brand identity for fashion e-commerce, including logo, palette, social kit', 'Aisha Bello', 'StyleHub NG', 'E-commerce', 'Design', '{"deliverables":12,"revisions":2,"timeline":"7 days"}'::jsonb, true, true, 2),
('YouTube Channel — 200k Views in 30 Days', 'youtube-200k-views', 'Video editing system for finance YouTube channel', 'Tunde Adeyemi', 'MoneyTalks', 'Media', 'Video & Motion', '{"views":"200k+","videos":20,"retention":"+35%"}'::jsonb, true, true, 3)
ON CONFLICT (slug) DO UPDATE SET published=true;

-- ================= SITE CONTENT =================
INSERT INTO public.site_content (key, value) VALUES
('site.hero.title', '"Hire vetted digital talent for your next project."'),
('site.hero.subtitle', '"Design, engineering, marketing, and media specialists — matched, managed, and quality-checked by NDH."')
ON CONFLICT (key) DO NOTHING;
