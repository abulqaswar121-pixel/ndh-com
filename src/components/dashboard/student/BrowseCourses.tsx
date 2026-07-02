import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, GraduationCap, Clock, ArrowRight } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { initEnrollmentPayment } from "@/lib/academy/enrollment.functions";
import { toast } from "sonner";

type Course = {
  id: string;
  slug: string;
  program_name: string;
  description: string | null;
  program_type: "certificate" | "diploma" | "professional" | string;
  duration: string | null;
  tuition_ngn: number;
  cover_image: string | null;
};

const TIERS: Array<{ key: string; label: string }> = [
  { key: "all", label: "All" },
  { key: "certificate", label: "Certificate" },
  { key: "diploma", label: "Diploma" },
  { key: "professional", label: "Professional" },
];

export function BrowseCourses() {
  const { user } = useAuth();
  const { format, currency } = useCurrency();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState("all");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Course | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("courses")
        .select("id,slug,program_name,description,program_type,duration,tuition_ngn,cover_image")
        .eq("is_published", true)
        .order("program_type")
        .order("program_name");
      setCourses((data as unknown as Course[]) ?? []);
      if (user) {
        const { data: en } = await supabase
          .from("enrollments")
          .select("course_id,status")
          .eq("student_id", user.id);
        setEnrolledIds(new Set((en ?? []).filter((e) => e.status === "active").map((e) => e.course_id as string)));
      }
      setLoading(false);
    })();
  }, [user]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return courses.filter((c) => {
      if (tier !== "all" && c.program_type !== tier) return false;
      if (needle && !`${c.program_name} ${c.description ?? ""}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [courses, tier, q]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Browse Courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enrol in a new NDH Academy programme without leaving your dashboard.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search courses…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {TIERS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTier(t.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                tier === t.key ? "border-transparent bg-gradient-brand text-white shadow-glow" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <GraduationCap className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No courses match your filters.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const enrolled = enrolledIds.has(c.id);
            return (
              <div key={c.id} className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-elegant">
                <div className="aspect-[16/10] w-full overflow-hidden bg-secondary">
                  {c.cover_image && <img src={c.cover_image} alt={c.program_name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize">{c.program_type}</Badge>
                    {c.duration && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {c.duration}</span>}
                  </div>
                  <h3 className="mt-2 font-bold leading-snug">{c.program_name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-base font-extrabold text-gradient-brand">{format(Number(c.tuition_ngn))}</div>
                    {enrolled ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Enrolled</Badge>
                    ) : (
                      <Button size="sm" variant="brand" onClick={() => setPicked(c)}>
                        Enrol <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {picked && <EnrollDialog course={picked} currency={currency} onClose={() => setPicked(null)} />}
    </div>
  );
}

function EnrollDialog({ course, currency, onClose }: { course: Course; currency: string; onClose: () => void }) {
  const submit = useServerFn(initEnrollmentPayment);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    country: "",
    highestLevel: "",
    motivationEssay: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.motivationEssay.trim().length < 30) {
      toast.error("Please write at least 30 characters about why you want to enrol.");
      return;
    }
    setBusy(true);
    try {
      const res = await submit({
        data: {
          courseSlug: course.slug,
          personalInfo: {
            fullName: form.fullName,
            phone: form.phone,
            country: form.country,
          },
          educationBackground: { highestLevel: form.highestLevel },
          motivationEssay: form.motivationEssay,
          amount: Number(course.tuition_ngn),
          currency: "NGN", // Paystack NGN account; geo-display only for now
        },
      });
      window.location.href = res.authorization_url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enrolment failed");
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enrol in {course.program_name}</DialogTitle>
          <DialogDescription>Complete this short application. You will be sent to Paystack to pay tuition and unlock your course instantly.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Full name</Label>
            <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Phone (WhatsApp)</Label>
              <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Country</Label>
              <Input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Highest education level</Label>
            <Input required placeholder="e.g. Secondary School, BSc, MSc" value={form.highestLevel} onChange={(e) => setForm({ ...form, highestLevel: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label>Why do you want to take this course? (min 30 chars)</Label>
            <Textarea rows={4} required value={form.motivationEssay} onChange={(e) => setForm({ ...form, motivationEssay: e.target.value })} />
          </div>
          <div className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
            Tuition: <b className="text-foreground">₦{Number(course.tuition_ngn).toLocaleString()}</b>
            {currency !== "NGN" && <span className="ml-1">(shown in NGN — {currency} display is preview only)</span>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button type="submit" variant="brand" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}