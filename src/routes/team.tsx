import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { UnsplashImg } from "@/components/site/UnsplashImg";
import { Button } from "@/components/ui/button";
import founderAsset from "@/assets/founder-ceo.png.asset.json";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [
    { title: "Our Team — Najeeb Digital Hub" },
    { name: "description", content: "Meet the leadership, department heads and project managers behind NDH — a diverse team across Nigeria and the diaspora." },
    { property: "og:title", content: "The NDH Team" },
    { property: "og:description", content: "Founders, leaders, HODs and Project Managers." },
    { property: "og:url", content: "/team" },
  ], links: [{ rel: "canonical", href: "/team" }]}),
  component: TeamPage,
});

type Member = { name: string; role: string; bio: string; q: string; image?: string };

const founder: Member = {
  name: "Ataurrahman Najeeb Ahmad",
  role: "Founder & CEO",
  bio: "Builds NDH like a serious tech company — measurable craft, fair pay, real outcomes.",
  q: "african software engineer portrait office",
  image: founderAsset.url,
};

const leadership: Member[] = [
  { name: "Amina Sani", role: "Operations Manager", bio: "Runs day-to-day delivery, PM rituals and QA standards.", q: "african woman tech operations manager laptop office" },
  { name: "David Eze", role: "Academy Director", bio: "Owns curriculum, faculty and the Learn → Earn pipeline.", q: "african male computer science lecturer classroom laptop" },
  { name: "Fatima Abubakar", role: "Finance Admin", bio: "Billing, payroll, escrow — clean money flow for clients and talents.", q: "african woman fintech analyst monitors dashboard" },
];

const hods: Member[] = [
  { name: "Ibrahim Lawal", role: "HOD · Design", bio: "Brand systems, UI and the visual standard for every NDH project.", q: "african ui ux designer figma laptop workspace" },
  { name: "Chinwe Okafor", role: "HOD · Development", bio: "Web, mobile and platform engineering across the bureau.", q: "black woman software engineer coding monitor" },
  { name: "Yusuf Bello", role: "HOD · Content", bio: "SEO, brand copy and editorial across client work and the blog.", q: "african man tech writer laptop workspace" },
  { name: "Grace Adeyemi", role: "HOD · Marketing", bio: "Performance ads, growth strategy and analytics.", q: "african woman digital marketer analytics dashboard laptop" },
  { name: "Aisha Mohammed", role: "HOD · Media", bio: "Video, motion, photography and podcast production.", q: "african woman video editor computer editing suite" },
];

const pms: Member[] = [
  { name: "Tobi Williams", role: "PM · Design", bio: "Single point of contact for every design engagement.", q: "african project manager kanban board tech office" },
  { name: "Hauwa Garba", role: "PM · Development", bio: "Sprints, scope and shipping for engineering work.", q: "african woman scrum master standup tech team" },
  { name: "Emeka Nwosu", role: "PM · Content", bio: "Briefs, calendars and editorial pipelines.", q: "african man content strategist laptop office" },
  { name: "Zainab Yakubu", role: "PM · Marketing", bio: "Campaign management end-to-end.", q: "african woman marketing manager dashboard tech office" },
  { name: "Samuel Okoro", role: "PM · Media", bio: "Production schedules from script to delivery.", q: "african media producer editing computer studio" },
];

function Card({ m, size = "md" }: { m: Member; size?: "lg" | "md" }) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-glow">
      <div className={size === "lg" ? "aspect-[4/3]" : "aspect-[4/5]"}>
        {m.image ? (
          <img src={m.image} alt={m.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <UnsplashImg q={m.q} alt={m.name} w={600} h={750} sig={m.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
      </div>
      <div className="p-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.65_0.19_252)]">{m.role}</div>
        <div className="mt-1 text-lg font-bold">{m.name}</div>
        <p className="mt-2 text-sm text-muted-foreground">{m.bio}</p>
      </div>
    </div>
  );
}

function TeamPage() {
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero py-24 text-white">
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Our People</div>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">The team building NDH.</h1>
            <p className="mt-4 max-w-2xl text-white/75">A diverse, vetted team across Nigeria and the diaspora — leaders, HODs and Project Managers who run every engagement.</p>
          </Reveal>
        </div>
      </section>

      <Section eyebrow="Founder">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-border shadow-elegant">
              <img src={founder.image!} alt={founder.name} className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.65_0.19_252)]">{founder.role}</div>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">{founder.name}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{founder.bio}</p>
            <p className="mt-4 text-muted-foreground">"We're building NDH as the bridge between African digital talent and the global economy — with discipline, fair pay, and Awwwards-level craft."</p>
          </Reveal>
        </div>
      </Section>

      <Section eyebrow="Leadership" title="Running operations, academy and finance.">
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {leadership.map((m) => <StaggerItem key={m.name}><Card m={m} /></StaggerItem>)}
        </Stagger>
      </Section>

      <Section eyebrow="Department heads" title="Five HODs. Five standards of excellence.">
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {hods.map((m) => <StaggerItem key={m.name}><Card m={m} /></StaggerItem>)}
        </Stagger>
      </Section>

      <Section eyebrow="Project managers" title="Your single point of contact.">
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {pms.map((m) => <StaggerItem key={m.name}><Card m={m} /></StaggerItem>)}
        </Stagger>
      </Section>

      <section className="mx-6 mb-16 overflow-hidden rounded-3xl bg-hero p-10 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-extrabold sm:text-3xl">We're hiring.</h3>
            <p className="mt-3 text-white/75">Project Managers, Instructors, HODs and specialists across all departments.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link to="/careers"><Button variant="brand" size="lg">See open roles</Button></Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}