import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { Reveal } from "@/components/site/Reveal";
import { CheckCircle2, Mail, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/staff-access")({
  head: () => ({ meta: [
    { title: "Staff Access & Invitations — NDH" },
    { name: "description", content: "Who can access which NDH portal, and how staff get invited." },
    { property: "og:title", content: "NDH Staff Access Matrix" },
    { property: "og:description", content: "Roles, portals, and the invitation flow." },
  ]}),
  component: StaffAccessPage,
});

const matrix: Array<{ role: string; portal: string; how: string; email?: string }> = [
  { role: "Client", portal: "/dashboard/client", how: "Public signup at /signup", email: "info@ndh.com.ng" },
  { role: "Student", portal: "/dashboard/student", how: "Public signup — enroll in any program from the Academy or the in-dashboard Browse Courses tab" },
  { role: "Talent", portal: "/dashboard/talent", how: "Invitation-only. Admin sends invite from /dashboard/admin → Talents.", email: "talent@ndh.com.ng" },
  { role: "Instructor", portal: "/dashboard/instructor", how: "Invitation-only. Academy Director invites from /dashboard/academy-director." },
  { role: "Project Manager (PM)", portal: "/dashboard/pm", how: "Invitation-only. HOD or Admin invites from /dashboard/admin → PMs (scoped to a single department)." },
  { role: "HOD (Dept. Head)", portal: "/dashboard/hod", how: "Assigned by Super Admin from /dashboard/super-admin → Roles." },
  { role: "Academy Director", portal: "/dashboard/academy-director", how: "Assigned by Super Admin." },
  { role: "Registrar", portal: "/dashboard/registrar", how: "Assigned by Super Admin." },
  { role: "Student Affairs", portal: "/dashboard/student-affairs", how: "Assigned by Super Admin." },
  { role: "Finance Officer", portal: "/dashboard/finance", how: "Assigned by Super Admin.", email: "finance@ndh.com.ng" },
  { role: "Admin (Ops)", portal: "/dashboard/admin", how: "Assigned by Super Admin." },
  { role: "Super Admin", portal: "/dashboard/super-admin", how: "Bootstrap only — one account per environment. Additional Super Admins via database seed." },
];

function StaffAccessPage() {
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero py-24 text-white">
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Access & Invitations</div>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Who gets which portal, and how.</h1>
            <p className="mt-4 max-w-2xl text-white/75">Only Clients and Students can sign up publicly. Every other portal is invitation-only.</p>
          </Reveal>
        </div>
      </section>
      <Section eyebrow="Access matrix">
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Portal</th>
                <th className="px-4 py-3">How to get access</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((r) => (
                <tr key={r.role} className="border-t border-border/60 align-top">
                  <td className="px-4 py-3 font-semibold">{r.role}</td>
                  <td className="px-4 py-3 text-muted-foreground"><code className="rounded bg-secondary/50 px-1.5 py-0.5 text-xs">{r.portal}</code></td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.how}
                    {r.email && (<div className="mt-1 inline-flex items-center gap-1 text-xs"><Mail className="h-3 w-3" /> {r.email}</div>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Public signup", "Clients and Students sign up freely. No approval needed.", CheckCircle2],
            ["Invitation-only", "Talents, Instructors, and PMs are added by Admin/Director — no public form.", Mail],
            ["Role assignment", "HODs, Directors, Finance and Admin are granted by Super Admin.", ShieldCheck],
          ].map(([t, d, Icon]) => {
            const I = Icon as typeof CheckCircle2;
            return (
              <div key={t as string} className="rounded-2xl border border-border bg-card p-6">
                <I className="h-6 w-6 text-[oklch(0.65_0.19_252)]" />
                <h3 className="mt-3 font-bold">{t as string}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-secondary/30 p-6 text-sm">
          <strong className="text-foreground">Are you already invited?</strong>{" "}
          <span className="text-muted-foreground">Check your inbox for a link from <code>notify.ndh.com.ng</code>, then complete signup at{" "}
          <Link to="/auth/accept" className="font-semibold text-foreground underline">/auth/accept</Link>.</span>
        </div>
      </Section>
    </SiteLayout>
  );
}