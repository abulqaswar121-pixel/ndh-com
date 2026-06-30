import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, CheckCircle2, MessageSquare, Receipt, Settings,
  LayoutDashboard, Bell, Search, Paperclip, Send, Download,
  Clock, FileText, Star, Plus, Filter, MoreVertical,
  Briefcase, DollarSign, Activity, ChevronRight, Circle,
} from "lucide-react";
import { useCurrency } from "@/lib/currency";

export const Route = createFileRoute("/client")({
  head: () => ({ meta: [{ title: "Client Dashboard — NDH" }, { name: "robots", content: "noindex" }] }),
  component: ClientDashboard,
});

type Section = "overview" | "submit" | "projects" | "messages" | "invoices" | "settings";

const services = ["Design", "Development", "Content", "Marketing", "Media", "AI & Tech"];
const tiers = [
  { name: "Basic", desc: "Solid execution, one round of revisions." },
  { name: "Pro", desc: "Premium craft, senior talent, two rounds." },
  { name: "Premium", desc: "Elite tier, full PM treatment, unlimited polish." },
];

const projects = [
  { id: "NDH-2041", title: "E-commerce website redesign", service: "Design", pm: "Aisha O.", status: "In progress", progress: 68, due: "Jul 12", amount: 2400000 },
  { id: "NDH-2039", title: "Brand identity & logo system", service: "Design", pm: "Tunde A.", status: "QA review", progress: 92, due: "Jul 03", amount: 850000 },
  { id: "NDH-2034", title: "Mobile app MVP — fintech", service: "Development", pm: "Chinedu E.", status: "In progress", progress: 41, due: "Aug 20", amount: 6800000 },
  { id: "NDH-2028", title: "TikTok content sprint (30 reels)", service: "Media", pm: "Halima B.", status: "Delivered", progress: 100, due: "Jun 22", amount: 1200000 },
];

const messages = [
  { from: "Aisha O.", role: "PM · Design", text: "Round 2 mockups are ready for your review.", time: "12m", unread: true },
  { from: "Chinedu E.", role: "PM · Development", text: "Sprint demo Friday 3pm WAT — sending Google Meet link shortly.", time: "2h", unread: true },
  { from: "Tunde A.", role: "PM · Brand", text: "Logo files exported in all formats (SVG, PNG, PDF).", time: "1d", unread: false },
  { from: "NDH Finance", role: "Billing", text: "Invoice INV-2039 receipt attached.", time: "3d", unread: false },
];

const invoices = [
  { id: "INV-2041", project: "E-commerce redesign", date: "2026-06-18", amount: 1200000, status: "Paid" },
  { id: "INV-2039", project: "Brand identity", date: "2026-06-10", amount: 850000, status: "Paid" },
  { id: "INV-2034", project: "Mobile app MVP", date: "2026-06-01", amount: 3400000, status: "Pending" },
  { id: "INV-2028", project: "TikTok sprint", date: "2026-05-20", amount: 1200000, status: "Paid" },
];

const statusTone: Record<string, string> = {
  "In progress": "bg-[oklch(0.65_0.19_252)]/15 text-[oklch(0.65_0.19_252)]",
  "QA review": "bg-[oklch(0.62_0.21_290)]/15 text-[oklch(0.62_0.21_290)]",
  "Delivered": "bg-[oklch(0.78_0.13_180)]/15 text-[oklch(0.55_0.15_180)]",
  "Paid": "bg-[oklch(0.78_0.13_180)]/15 text-[oklch(0.55_0.15_180)]",
  "Pending": "bg-amber-500/15 text-amber-600",
};

function ClientDashboard() {
  const [section, setSection] = useState<Section>("overview");
  const { format } = useCurrency();

  const nav: { key: Section; icon: typeof Plus; label: string; badge?: number }[] = [
    { key: "overview", icon: LayoutDashboard, label: "Overview" },
    { key: "submit", icon: Plus, label: "Submit a Task" },
    { key: "projects", icon: Briefcase, label: "My Projects", badge: projects.filter(p => p.status !== "Delivered").length },
    { key: "messages", icon: MessageSquare, label: "Messages", badge: messages.filter(m => m.unread).length },
    { key: "invoices", icon: Receipt, label: "Invoices" },
    { key: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Client Dashboard</div>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Welcome back, Yusuf.</h1>
            <p className="mt-1 text-sm text-muted-foreground">3 active projects · 2 new messages · 1 invoice awaiting payment</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Search projects, invoices…" className="h-10 w-72 rounded-lg border border-border bg-background pl-9 pr-3 text-sm" />
            </div>
            <button className="grid h-10 w-10 place-items-center rounded-lg border border-border"><Bell className="h-4 w-4" /></button>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-brand text-sm font-bold text-white">YA</div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-1">
          {nav.map((i) => {
            const active = section === i.key;
            return (
              <button key={i.key} onClick={() => setSection(i.key)} className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-gradient-brand text-white shadow-glow" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <span className="flex items-center gap-3"><i.icon className="h-4 w-4" /> {i.label}</span>
                {i.badge ? (<span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? "bg-white/20" : "bg-gradient-brand text-white"}`}>{i.badge}</span>) : null}
              </button>
            );
          })}
          <div className="mt-6 rounded-xl border border-border bg-card p-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your PM</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-sm font-bold text-white">AO</div>
              <div>
                <div className="text-sm font-bold">Aisha O.</div>
                <div className="text-xs text-muted-foreground">Online · replies in ~15m</div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setSection("messages")}>
              <MessageSquare className="h-4 w-4" /> Message
            </Button>
          </div>
        </aside>

        <main className="min-w-0">
          {section === "overview" && <Overview format={format} setSection={setSection} />}
          {section === "submit" && <SubmitTask />}
          {section === "projects" && <Projects format={format} />}
          {section === "messages" && <Messages />}
          {section === "invoices" && <Invoices format={format} />}
          {section === "settings" && <SettingsPanel />}
        </main>
      </div>
    </SiteLayout>
  );
}

function StatCard({ icon: Icon, label, value, delta, tone = "blue" }: { icon: typeof Activity; label: string; value: string; delta?: string; tone?: "blue" | "purple" | "teal" | "amber" }) {
  const ring = tone === "purple" ? "from-[oklch(0.62_0.21_290)]" : tone === "teal" ? "from-[oklch(0.78_0.13_180)]" : tone === "amber" ? "from-amber-400" : "from-[oklch(0.65_0.19_252)]";
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className={`h-1 bg-gradient-to-r ${ring} to-[oklch(0.62_0.21_290)]`} />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-3 text-2xl font-extrabold tracking-tight">{value}</div>
        {delta && <div className="mt-1 text-xs text-muted-foreground">{delta}</div>}
      </div>
    </div>
  );
}

function Overview({ format, setSection }: { format: (n: number) => string; setSection: (s: Section) => void }) {
  const active = projects.filter(p => p.status !== "Delivered");
  const spent = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter(i => i.status === "Pending").reduce((s, i) => s + i.amount, 0);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="Active projects" value={String(active.length)} delta={`${projects.length} total`} />
        <StatCard icon={Clock} label="Next deadline" value="Jul 03" delta="Brand identity — QA" tone="purple" />
        <StatCard icon={DollarSign} label="Total invested" value={format(spent)} delta="Across 4 projects" tone="teal" />
        <StatCard icon={Receipt} label="Outstanding" value={format(pending)} delta="1 invoice pending" tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="text-sm font-bold">Active projects</div>
            <button onClick={() => setSection("projects")} className="inline-flex items-center gap-1 text-xs font-semibold text-[oklch(0.65_0.19_252)]">View all <ChevronRight className="h-3 w-3" /></button>
          </div>
          <div className="divide-y divide-border">
            {active.slice(0, 3).map(p => (
              <div key={p.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-muted-foreground">{p.id}</div>
                    <div className="mt-0.5 truncate font-bold">{p.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">PM {p.pm} · Due {p.due}</div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusTone[p.status]}`}>{p.status}</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${p.progress}%` }} />
                  </div>
                  <div className="text-xs font-semibold tabular-nums text-muted-foreground">{p.progress}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4 text-sm font-bold">Recent activity</div>
          <ul className="divide-y divide-border">
            {[
              { icon: FileText, text: "Round 2 mockups uploaded to E-commerce redesign", time: "12m ago" },
              { icon: CheckCircle2, text: "Sprint 4 milestone approved", time: "2h ago" },
              { icon: Receipt, text: "Invoice INV-2039 paid · ₦850,000", time: "1d ago" },
              { icon: Star, text: "You rated Halima B. 5 stars", time: "3d ago" },
              { icon: Activity, text: "Mobile app MVP entered Sprint 5", time: "5d ago" },
            ].map((a, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-3.5 text-sm">
                <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary"><a.icon className="h-3.5 w-3.5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-foreground">{a.text}</div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-gradient-hero p-8 text-white shadow-elegant">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Ready for the next one?</div>
            <h3 className="mt-1 text-2xl font-extrabold">Brief a new project in under 2 minutes.</h3>
            <p className="mt-1 text-sm text-white/80">A PM responds within 24 hours with scope, timeline and a fixed quote.</p>
          </div>
          <Button variant="hero" size="lg" onClick={() => setSection("submit")}>
            <Plus className="h-4 w-4" /> Submit a Task
          </Button>
        </div>
      </div>
    </div>
  );
}

function SubmitTask() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [data, setData] = useState({ service: "Design", tier: "Pro", budget: "1000-2500", negotiable: true, desc: "", deadline: "" });
  const set = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) => setData((d) => ({ ...d, [k]: v }));
  const steps = ["Service", "Tier", "Budget", "Brief", "Submit"];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">New brief</div>
      <h2 className="mb-6 text-xl font-extrabold">Tell us about your project</h2>
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${i <= step ? "bg-gradient-brand text-white shadow-glow" : "bg-secondary text-muted-foreground"}`}>{i + 1}</div>
            <div className="hidden text-xs font-semibold sm:block">{s}</div>
            {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-gradient-brand" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {done ? (
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-brand text-white"><CheckCircle2 className="h-7 w-7" /></div>
          <h3 className="mt-4 text-xl font-bold">Brief received.</h3>
          <p className="mt-2 text-sm text-muted-foreground">A Project Manager will reach out within 24 hours.</p>
          <Link to="/" className="mt-6 inline-block"><Button variant="brand">Back to home</Button></Link>
        </div>
      ) : (
        <>
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {services.map((s) => (
                <button type="button" key={s} onClick={() => set("service", s)} className={`rounded-xl border p-4 text-left transition ${data.service === s ? "border-[oklch(0.65_0.19_252)] bg-secondary/60" : "border-border hover:border-[oklch(0.65_0.19_252)]/40"}`}>
                  <div className="font-bold">{s}</div>
                </button>
              ))}
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {tiers.map((t) => (
                <button type="button" key={t.name} onClick={() => set("tier", t.name)} className={`rounded-xl border p-4 text-left transition ${data.tier === t.name ? "border-[oklch(0.65_0.19_252)] bg-secondary/60" : "border-border hover:border-[oklch(0.65_0.19_252)]/40"}`}>
                  <div className="font-bold">{t.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{t.desc}</div>
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Budget range</label>
                <select value={data.budget} onChange={(e) => set("budget", e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                  <option value="under-500">Under ₦750k</option>
                  <option value="500-1000">₦750k – ₦1.5m</option>
                  <option value="1000-2500">₦1.5m – ₦4m</option>
                  <option value="2500-5000">₦4m – ₦8m</option>
                  <option value="5000-plus">₦8m+</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={data.negotiable} onChange={(e) => set("negotiable", e.target.checked)} /> Open to negotiation
              </label>
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Project brief</label>
                <textarea rows={5} value={data.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Goal, audience, references, deliverables." className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium">Deadline (optional)</label>
                <input type="date" value={data.deadline} onChange={(e) => set("deadline", e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm">
              <div><span className="text-muted-foreground">Service:</span> <strong>{data.service}</strong></div>
              <div><span className="text-muted-foreground">Tier:</span> <strong>{data.tier}</strong></div>
              <div><span className="text-muted-foreground">Budget:</span> <strong>{data.budget}</strong> {data.negotiable && <em className="text-muted-foreground">(negotiable)</em>}</div>
            </div>
          )}
          <div className="mt-6 flex items-center justify-between">
            <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
            {step < steps.length - 1 ? (
              <Button type="button" variant="brand" onClick={() => setStep((s) => s + 1)}>Next <ArrowRight className="h-4 w-4" /></Button>
            ) : (
              <Button type="button" variant="brand" onClick={() => setDone(true)}>Submit brief</Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Projects({ format }: { format: (n: number) => string }) {
  const [filter, setFilter] = useState<"All" | "Active" | "Delivered">("All");
  const filtered = projects.filter(p => filter === "All" ? true : filter === "Delivered" ? p.status === "Delivered" : p.status !== "Delivered");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(["All", "Active", "Delivered"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filter === f ? "bg-gradient-brand text-white shadow-glow" : "border border-border text-muted-foreground hover:text-foreground"}`}>{f}</button>
          ))}
        </div>
        <Button variant="outline" size="sm"><Filter className="h-4 w-4" /> Filter</Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Project</th>
              <th className="px-5 py-3">PM</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Progress</th>
              <th className="px-5 py-3 text-right">Budget</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-secondary/30">
                <td className="px-5 py-4">
                  <div className="text-xs font-mono text-muted-foreground">{p.id}</div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.service} · Due {p.due}</div>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{p.pm}</td>
                <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusTone[p.status]}`}>{p.status}</span></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">{p.progress}%</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right font-semibold tabular-nums">{format(p.amount)}</td>
                <td className="px-5 py-4 text-right"><button className="text-muted-foreground hover:text-foreground"><MoreVertical className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Messages() {
  const [selected, setSelected] = useState(0);
  const m = messages[selected];
  return (
    <div className="grid gap-0 overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[300px_1fr]" style={{ minHeight: 560 }}>
      <div className="border-r border-border">
        <div className="border-b border-border px-4 py-3 text-sm font-bold">Inbox</div>
        <ul>
          {messages.map((msg, i) => (
            <li key={i}>
              <button onClick={() => setSelected(i)} className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition ${selected === i ? "bg-secondary/60" : "hover:bg-secondary/30"}`}>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-white">{msg.from.split(" ").map(p => p[0]).join("")}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-bold">{msg.from}</div>
                    <div className="shrink-0 text-[10px] text-muted-foreground">{msg.time}</div>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{msg.text}</div>
                </div>
                {msg.unread && <Circle className="mt-1 h-2 w-2 shrink-0 fill-[oklch(0.65_0.19_252)] text-[oklch(0.65_0.19_252)]" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <div className="text-sm font-bold">{m.from}</div>
            <div className="text-xs text-muted-foreground">{m.role}</div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Online</div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-2.5 text-sm">{m.text}</div>
          <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-brand px-4 py-2.5 text-sm text-white">Thanks — taking a look now.</div>
          <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-2.5 text-sm">Take your time. Happy to jump on a quick call if easier.</div>
        </div>
        <div className="flex items-center gap-2 border-t border-border p-3">
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground"><Paperclip className="h-4 w-4" /></button>
          <input placeholder="Write a message…" className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm" />
          <Button variant="brand" size="sm"><Send className="h-4 w-4" /> Send</Button>
        </div>
      </div>
    </div>
  );
}

function Invoices({ format }: { format: (n: number) => string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="text-sm font-bold">Invoices</div>
        <div className="text-xs text-muted-foreground">{invoices.length} total · {invoices.filter(i => i.status === "Pending").length} pending</div>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-secondary/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-5 py-3">Invoice</th>
            <th className="px-5 py-3">Project</th>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Amount</th>
            <th className="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {invoices.map(inv => (
            <tr key={inv.id} className="hover:bg-secondary/30">
              <td className="px-5 py-4 font-mono text-xs">{inv.id}</td>
              <td className="px-5 py-4 font-semibold">{inv.project}</td>
              <td className="px-5 py-4 text-muted-foreground">{inv.date}</td>
              <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusTone[inv.status]}`}>{inv.status}</span></td>
              <td className="px-5 py-4 text-right font-semibold tabular-nums">{format(inv.amount)}</td>
              <td className="px-5 py-4 text-right">
                {inv.status === "Pending" ? (
                  <Button variant="brand" size="sm">Pay now</Button>
                ) : (
                  <button className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"><Download className="h-3.5 w-3.5" /> PDF</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">How you appear to your project teams.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" defaultValue="Yusuf Adebayo" />
          <Field label="Company" defaultValue="Bayo & Co." />
          <Field label="Email" defaultValue="yusuf@bayo.co" type="email" />
          <Field label="Phone" defaultValue="+234 902 993 2794" />
        </div>
        <div className="mt-5 flex justify-end"><Button variant="brand">Save changes</Button></div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold">Notifications</h2>
        <ul className="mt-4 divide-y divide-border">
          {[
            { t: "Project updates", d: "Status changes, new deliverables, PM messages." },
            { t: "Invoices & receipts", d: "New invoices, payment confirmations." },
            { t: "Weekly digest", d: "A Monday summary of all activity." },
            { t: "Marketing", d: "Occasional news from NDH. We keep it rare." },
          ].map((n, i) => (
            <li key={i} className="flex items-center justify-between py-3.5">
              <div>
                <div className="text-sm font-semibold">{n.t}</div>
                <div className="text-xs text-muted-foreground">{n.d}</div>
              </div>
              <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
                <input type="checkbox" defaultChecked={i < 3} className="peer sr-only" />
                <span className="absolute inset-0 rounded-full bg-secondary transition peer-checked:bg-gradient-brand" />
                <span className="relative ml-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-lg font-bold text-destructive">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">Permanently delete your account and all associated project history.</p>
        <Button variant="outline" className="mt-4 border-destructive/40 text-destructive hover:bg-destructive/10">Delete account</Button>
      </div>
    </div>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <input type={type} defaultValue={defaultValue} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
    </label>
  );
}
