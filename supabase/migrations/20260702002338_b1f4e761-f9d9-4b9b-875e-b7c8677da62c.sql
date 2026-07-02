
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  body_md text not null default '',
  tag text not null default 'NDH News',
  cover_query text not null default 'african tech office',
  author text not null default 'NDH Team',
  read_minutes int not null default 4,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
grant select on public.blog_posts to anon, authenticated;
grant all on public.blog_posts to service_role;
alter table public.blog_posts enable row level security;
create policy "public read published posts" on public.blog_posts for select using (published = true);
create policy "admins manage posts" on public.blog_posts for all to authenticated
  using (public.has_role(auth.uid(),'super_admin') or public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'super_admin') or public.has_role(auth.uid(),'admin'));

create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  role_applied text not null,
  portfolio_url text,
  cover_letter text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
grant insert on public.career_applications to anon, authenticated;
grant select, update on public.career_applications to authenticated;
grant all on public.career_applications to service_role;
alter table public.career_applications enable row level security;
create policy "anyone can apply" on public.career_applications for insert to anon, authenticated with check (true);
create policy "admins read applications" on public.career_applications for select to authenticated
  using (public.has_role(auth.uid(),'super_admin') or public.has_role(auth.uid(),'admin'));
create policy "admins update applications" on public.career_applications for update to authenticated
  using (public.has_role(auth.uid(),'super_admin') or public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'super_admin') or public.has_role(auth.uid(),'admin'));

insert into public.blog_posts (slug, title, excerpt, tag, cover_query, body_md, read_minutes) values
('why-founders-hire-bureaus','Why founders hire bureaus, not freelancers','The hidden cost of managing 5 freelancers vs. one PM.','NDH News','modern office strategy meeting',E'# Why bureaus win\n\nFounders don''t buy hours — they buy outcomes. Bureaus wrap talent in project management, QA, and accountability so you ship faster with less risk.\n\n## The math\n\nOne PM + 3 vetted talents will out-deliver 5 unmanaged freelancers 9 times out of 10.',6),
('brand-systems-that-scale','Brand systems that scale on a budget','A quick guide to tokens, type and color discipline.','Digital Skills','graphic design workspace branding',E'# Brand systems\n\nStart with tokens: color, type, spacing, radius. Everything else is downstream.',5),
('inside-ndh-diploma','Inside the NDH Diploma program','How we structure six months of intensive learning.','Academy Updates','african online classroom students',E'# NDH Diploma\n\nSix months. Real projects. Elite mentors. Portfolio-first curriculum.',7),
('meta-ads-2026','What''s working in Meta ads in 2026','Creative, audience and budget patterns from real campaigns.','Freelancing Tips','digital marketing analytics screen',E'# Meta ads in 2026\n\nCreative is the targeting. Broad audiences + volume + iteration wins.',5),
('picking-mvp-stack','Picking the right stack for your MVP','A pragmatic framework for first-time founders.','Digital Skills','developer coding multiple monitors',E'# MVP stacks\n\nBoring tech, boring database, boring hosting. Interesting product.',6),
('how-to-make-tier-5','How to make Tier 5 (Elite) at NDH','Metrics, mindset and craft from our top talents.','Freelancing Tips','african freelancer working laptop home',E'# Tier 5\n\nOn-time delivery, five-star reviews, and craft that raises the bar.',5)
on conflict (slug) do nothing;
