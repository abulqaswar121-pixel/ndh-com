import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { UnsplashImg } from "@/components/site/UnsplashImg";
import { Button } from "@/components/ui/button";
import { HeartHandshake, Compass, Target, Sparkles, MapPin } from "lucide-react";
import founderAsset from "@/assets/founder-ceo.png.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — Najeeb Digital Hub" },
    { name: "description", content: "Our story, vision and the team behind NDH." },
    { property: "og:title", content: "About NDH" },
    { property: "og:description", content: "A bureau model built to deliver world-class digital work from Nigeria, for the world." },
  ]}),
  component: AboutPage,
});

const values = [
  { icon: Sparkles, title: "Excellence", desc: "We obsess over craft, polish and delivery." },
  { icon: HeartHandshake, title: "Trust", desc: "Escrow, QA and clear PMs — no surprises." },
  { icon: Compass, title: "Opportunity", desc: "We open real careers for African digital talent." },
  { icon: Target, title: "Outcomes", desc: "We measure ourselves by what your business achieves." },
];

function AboutPage() {
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero py-24 text-white">
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/70">About NDH</div>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">A digital bureau and academy built for the next generation.</h1>
            <p className="mt-4 max-w-2xl text-white/75">We bridge global demand for great digital work with Africa's best emerging talent — and we train the rest.</p>
          </Reveal>
        </div>
      </section>

      <Section eyebrow="Our story" title="From a small studio to a multi-department bureau.">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <div className="space-y-4 text-foreground/80">
              <p>Najeeb Digital Hub started with a simple belief: African creators and engineers can produce work that competes anywhere in the world — if they are properly trained, properly managed and properly paid.</p>
              <p>Today, NDH operates as a managed digital bureau with a sister academy. Clients across Nigeria, the UK, US, Canada, Europe and the UAE send us briefs; our Project Managers translate them into work; our vetted in-house talents deliver; our QA ships it. Meanwhile, NDH Academy continuously trains the next wave of professionals.</p>
              <p>We exist to make digital opportunity borderless.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-3xl border border-border shadow-elegant">
              <UnsplashImg q="african tech company office developers computers collaboration" alt="NDH story" w={900} h={700} className="h-full w-full object-cover" />
            </div>
          </Reveal>
        </div>
      </Section>

      <Section eyebrow="What we believe" title="Our values">
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <StaggerItem key={v.title}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-elegant">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-brand text-white shadow-glow"><v.icon className="h-5 w-5" /></div>
                <h3 className="mt-4 font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section eyebrow="Where we operate" title="Headquartered in Sokoto. Delivering worldwide.">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 text-[oklch(0.65_0.19_252)]"><MapPin className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-widest">Our regions</span></div>
              <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {["Nigeria 🇳🇬","United Kingdom 🇬🇧","United States 🇺🇸","Canada 🇨🇦","Germany 🇩🇪","France 🇫🇷","Netherlands 🇳🇱","UAE 🇦🇪"].map((c) => (
                  <li key={c} className="rounded-lg border border-border bg-secondary/40 px-3 py-2 font-semibold">{c}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe title="Sokoto map" src="https://www.google.com/maps?q=Sokoto,Nigeria&output=embed" className="h-80 w-full" loading="lazy" />
          </div>
        </div>
      </Section>

      <Section eyebrow="Founder" title="Built with vision and discipline.">
        <div className="grid items-center gap-8 md:grid-cols-[280px_1fr]">
          <div className="overflow-hidden rounded-3xl border border-border shadow-glow">
            <img src={founderAsset.url} alt="Ataurrahman Najeeb Ahmad, Founder & CEO" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.65_0.19_252)]">Founder & CEO</div>
            <div className="mt-1 text-2xl font-extrabold">Ataurrahman Najeeb Ahmad</div>
            <p className="mt-3 max-w-2xl text-muted-foreground">"We're building NDH like a serious tech company — measurable quality, fair pay for talents, and outcomes our clients can feel."</p>
            <div className="mt-5 flex gap-3">
              <Link to="/team"><Button variant="brand">Meet the team</Button></Link>
              <Link to="/contact"><Button variant="outline">Get in touch</Button></Link>
            </div>
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}