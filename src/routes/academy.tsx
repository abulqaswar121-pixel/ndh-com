import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { UnsplashImg } from "@/components/site/UnsplashImg";
import { GraduationCap, BookOpen, Award, ArrowRight, Briefcase, Calendar, CheckCircle2, Globe2 } from "lucide-react";

export const Route = createFileRoute("/academy")({
  head: () => ({ meta: [
    { title: "NDH Academy — Learn. Get Certified. Get Hired." },
    { name: "description", content: "Certificate, Diploma and Professional programs in design, tech, content, marketing and media — with a direct pathway into the NDH talent pool." },
    { property: "og:title", content: "NDH Academy" },
    { property: "og:description", content: "Learn → Get Certified → Join Talent Pool → Earn." },
    { property: "og:url", content: "/academy" },
  ], links: [{ rel: "canonical", href: "/academy" }]}),
  component: AcademyPage,
});

const certificates = [
  "Certificate in Graphic Design",
  "Certificate in Social Media Management",
  "Certificate in Content Writing",
  "Certificate in Basic Web Design",
  "Certificate in Virtual Assistance",
  "Certificate in AI Tools Mastery",
  "Certificate in Video Editing",
  "Certificate in Digital Photography",
];
const diplomas = [
  "Diploma in Digital Marketing",
  "Diploma in Full-Stack Web Development",
  "Diploma in UI/UX Design",
  "Diploma in Video Production & Editing",
  "Diploma in Graphic Design & Branding",
  "Diploma in Content Creation & Copywriting",
  "Diploma in E-Commerce & Dropshipping",
  "Diploma in Data Analysis",
];
const professionals = [
  "Professional Diploma in Software Engineering",
  "Professional Diploma in Digital Business Management",
  "Professional Diploma in Cybersecurity",
  "Professional Diploma in Full Brand Strategy",
  "Professional Diploma in Advanced Web & Mobile Development",
];

const tuition = [
  { region: "Nigeria", cert: "₦95,000", dip: "₦250,000", pro: "₦650,000" },
  { region: "UK", cert: "£260", dip: "£680", pro: "£1,500" },
  { region: "US / Canada", cert: "$320", dip: "$850", pro: "$1,900" },
  { region: "Europe", cert: "€290", dip: "€780", pro: "€1,750" },
  { region: "UAE / GCC", cert: "AED 1,150", dip: "AED 3,100", pro: "AED 7,000" },
];

function ProgramTier({
  tier, duration, why, programs, accent,
}: {
  tier: string; duration: string; why: string; programs: string[]; accent: string;
}) {
  return (
    <Reveal>
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
        <div className="p-8" style={{ background: accent }}>
          <div className="flex flex-wrap items-end justify-between gap-3 text-white">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-white/80">{duration}</div>
              <h3 className="mt-1 text-3xl font-extrabold">{tier}</h3>
            </div>
            <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              {programs.length} programs
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm text-white/85">{why}</p>
        </div>
        <div className="p-6 sm:p-8">
          <ul className="grid gap-3 sm:grid-cols-2">
            {programs.map((p) => (
              <li key={p} className="group flex items-center gap-3 rounded-xl border border-border bg-background/50 p-4 transition hover:-translate-y-0.5 hover:border-[oklch(0.65_0.19_252)]/40 hover:shadow-elegant">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[oklch(0.78_0.13_180)]" />
                <span className="flex-1 text-sm font-semibold">{p}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-3 rounded-xl border border-border bg-secondary/40 p-5 text-sm sm:grid-cols-3">
            <div><div className="text-xs uppercase tracking-widest text-muted-foreground">Duration</div><div className="mt-1 font-bold">{duration}</div></div>
            <div><div className="text-xs uppercase tracking-widest text-muted-foreground">Format</div><div className="mt-1 font-bold">Live + Recorded</div></div>
            <div><div className="text-xs uppercase tracking-widest text-muted-foreground">Outcome</div><div className="mt-1 font-bold">Verified Certificate</div></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/signup"><Button variant="brand">Apply now</Button></Link>
            <Link to="/contact"><Button variant="outline">Talk to admissions</Button></Link>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function AcademyPage() {
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden text-white">
        <UnsplashImg q="african university students online learning laptop" alt="NDH Academy" w={1920} h={1080} className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.1 0.06 268 / 0.9), oklch(0.08 0.05 268 / 0.95))" }} />
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-7xl px-6 py-28">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              <GraduationCap className="h-3.5 w-3.5" /> NDH Academy
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.05] sm:text-6xl">Learn. Get certified. <span className="text-gradient-brand">Get hired.</span></h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 max-w-2xl text-white/80">A real online academy for digital skills — taught by industry instructors, with a direct pathway into the NDH talent pool and weekly earnings.</p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup"><Button variant="brand" size="xl">Apply Now</Button></Link>
              <Link to="/verify"><Button variant="hero" size="xl">Verify a Certificate</Button></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Why */}
      <Section eyebrow="Why NDH Academy" title="The only academy where your tutor is also your employer.">
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, t: "Industry curriculum", d: "Built by working NDH professionals." },
            { icon: Award, t: "Verifiable certificate", d: "QR-coded credentials, public verification." },
            { icon: Briefcase, t: "Talent pipeline", d: "Top graduates invited to the NDH bureau." },
            { icon: Globe2, t: "Global student body", d: "Students from Nigeria, UK, US, Canada, EU and UAE." },
          ].map((x) => (
            <StaggerItem key={x.t}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-elegant">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-brand text-white shadow-glow"><x.icon className="h-5 w-5" /></div>
                <h3 className="mt-4 font-bold">{x.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* How it works */}
      <Section eyebrow="How NDH Academy works" title="From enrolment to earning — in four steps." center>
        <Stagger className="grid gap-5 md:grid-cols-4">
          {[
            { n: "01", t: "Apply & enrol", d: "Pick your program. Pay in your local currency." },
            { n: "02", t: "Learn", d: "Live + recorded classes, real projects, mentor reviews." },
            { n: "03", t: "Get certified", d: "Pass assessments and earn a QR-verified certificate." },
            { n: "04", t: "Earn", d: "Top grads enter the NDH talent pool with weekly pay." },
          ].map((s) => (
            <StaggerItem key={s.n}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-elegant">
                <div className="text-gradient-brand text-4xl font-black">{s.n}</div>
                <h3 className="mt-3 font-bold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* Programs */}
      <Section eyebrow="Programs" title="Three tiers. Twenty-one programs. One outcome: mastery.">
        <div className="grid gap-8">
          <ProgramTier
            tier="Certificate Programs"
            duration="3 months"
            why="Focused, intensive training to give you a marketable skill quickly. Perfect for beginners or skill upgrades."
            programs={certificates}
            accent="linear-gradient(135deg, oklch(0.65 0.19 252), oklch(0.78 0.13 180))"
          />
          <ProgramTier
            tier="Diploma Programs"
            duration="6 months"
            why="Comprehensive training combining theory and hands-on projects. Two semesters with assessments, mid-term exams and a final project. Graduates qualify for the NDH talent pool."
            programs={diplomas}
            accent="linear-gradient(135deg, oklch(0.62 0.21 290), oklch(0.65 0.19 252))"
          />
          <ProgramTier
            tier="Professional Programs"
            duration="12 months"
            why="Advanced, in-depth training equivalent to a year-long industry apprenticeship. Includes specialization, mentorship, internship with the NDH Bureau and a capstone project."
            programs={professionals}
            accent="linear-gradient(135deg, oklch(0.2 0.1 268), oklch(0.62 0.21 290))"
          />
        </div>
      </Section>

      {/* Academic calendar + entry */}
      <Section eyebrow="Admissions" title="Calendar & entry requirements">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 text-[oklch(0.65_0.19_252)]"><Calendar className="h-5 w-5" /><span className="text-xs font-semibold uppercase tracking-widest">Academic calendar 2026</span></div>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex justify-between border-b border-border pb-3"><span>January Cohort</span><span className="font-semibold">Jan 12 – Apr 10</span></li>
                <li className="flex justify-between border-b border-border pb-3"><span>April Cohort</span><span className="font-semibold">Apr 20 – Jul 17</span></li>
                <li className="flex justify-between border-b border-border pb-3"><span>July Cohort</span><span className="font-semibold">Jul 27 – Oct 23</span></li>
                <li className="flex justify-between"><span>October Cohort</span><span className="font-semibold">Nov 2 – Jan 29</span></li>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.65_0.19_252)]">Entry requirements</div>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[oklch(0.78_0.13_180)]" />Minimum age 16; secondary school certificate preferred.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[oklch(0.78_0.13_180)]" />Working laptop and reliable internet (≥4 GB RAM).</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[oklch(0.78_0.13_180)]" />Conversational English.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[oklch(0.78_0.13_180)]" />Commitment of 8–12 hours per week.</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Tuition geo-pricing */}
      <Section eyebrow="Tuition & Fees" title="Geo-priced. Fair everywhere.">
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Region</th>
                <th className="px-4 py-3 text-left">Certificate (3m)</th>
                <th className="px-4 py-3 text-left">Diploma (6m)</th>
                <th className="px-4 py-3 text-left">Professional (12m)</th>
              </tr>
            </thead>
            <tbody>
              {tuition.map((t) => (
                <tr key={t.region} className="border-t border-border odd:bg-background even:bg-secondary/20">
                  <td className="px-4 py-3 font-semibold">{t.region}</td>
                  <td className="px-4 py-3">{t.cert}</td>
                  <td className="px-4 py-3">{t.dip}</td>
                  <td className="px-4 py-3">{t.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Installment plans available. Scholarships for the top 5% of applicants.</p>
      </Section>

      {/* CTA */}
      <section className="mx-6 mb-16 overflow-hidden rounded-3xl bg-hero p-10 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-6 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h3 className="text-2xl font-extrabold sm:text-3xl">Your seat in the next cohort is open.</h3>
            <p className="mt-3 text-white/75">Apply now and an admissions officer will respond within 48 hours.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link to="/signup"><Button variant="brand" size="lg">Apply Now</Button></Link>
            <Link to="/verify"><Button variant="hero" size="lg">Verify Certificate</Button></Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}