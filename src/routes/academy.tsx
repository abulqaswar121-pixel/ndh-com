import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Award, ArrowRight, Briefcase } from "lucide-react";
import academyImg from "@/assets/academy.jpg";

export const Route = createFileRoute("/academy")({
  head: () => ({ meta: [
    { title: "NDH Academy — Learn. Get Certified. Get Hired." },
    { name: "description", content: "Premium online academy covering design, technology, content, marketing and media — with certificates and pathways into the NDH talent pool." },
    { property: "og:title", content: "NDH Academy" },
    { property: "og:description", content: "Learn → Get Certified → Join Talent Pool → Earn." },
    { property: "og:image", content: "/og/academy.jpg" },
  ]}),
  component: AcademyPage,
});

const programs = [
  { title: "Certificate", duration: "3 months", desc: "Foundational skills, weekly projects, capstone." },
  { title: "Diploma", duration: "6 months", desc: "Deep specialisation, mentorship, portfolio." },
  { title: "Professional", duration: "12 months", desc: "University-grade curriculum, internship, job pipeline." },
];
const departments = ["Design", "Technology", "Content", "Digital Marketing", "Media Production"];

function AcademyPage() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden text-white">
        <img src={academyImg} alt="NDH Academy" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E2A]/95 via-[#0A0E2A]/75 to-[#0A0E2A]/40" />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/70">NDH Academy</div>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Learn. Get certified. Get hired.</h1>
          <p className="mt-4 max-w-2xl text-white/80">A real online university for digital skills — taught by industry instructors, with a direct pathway into the NDH talent pool.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/contact"><Button variant="brand" size="xl">Apply Now</Button></Link>
            <Link to="/verify"><Button variant="hero" size="xl">Verify a Certificate</Button></Link>
          </div>
        </div>
      </section>

      <Section eyebrow="Programs" title="Three pathways. One destination: mastery.">
        <div className="grid gap-5 md:grid-cols-3">
          {programs.map((p) => (
            <div key={p.title} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-glow">
              <GraduationCap className="h-7 w-7 text-[oklch(0.65_0.19_252)]" />
              <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{p.duration}</div>
              <h3 className="mt-1 text-xl font-extrabold">{p.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-brand opacity-0 blur-2xl transition-opacity group-hover:opacity-30" />
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Departments" title="Five faculties. Real curricula.">
        <div className="flex flex-wrap gap-3">
          {departments.map((d) => (
            <div key={d} className="rounded-full border border-border bg-secondary/60 px-5 py-2 text-sm font-semibold">
              {d}
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Your pathway" title="From beginner to earning talent.">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: BookOpen, t: "Learn", d: "Live + recorded classes, projects, mentors." },
            { icon: Award, t: "Get Certified", d: "Verified certificate with QR code." },
            { icon: Briefcase, t: "Join Talent Pool", d: "Top grads invited to NDH bureau." },
            { icon: GraduationCap, t: "Earn", d: "Get paid weekly for delivered work." },
          ].map((s, i, arr) => (
            <div key={s.t} className="relative rounded-2xl border border-border bg-card p-6">
              <s.icon className="h-6 w-6 text-[oklch(0.62_0.21_290)]" />
              <h3 className="mt-3 font-bold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              {i < arr.length - 1 && <ArrowRight className="absolute right-3 top-7 hidden h-4 w-4 text-muted-foreground md:block" />}
            </div>
          ))}
        </div>
      </Section>
    </SiteLayout>
  );
}