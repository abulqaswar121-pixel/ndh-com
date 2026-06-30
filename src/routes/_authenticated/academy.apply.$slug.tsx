import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/lib/currency";
import { useAuth } from "@/lib/auth";
import { initEnrollmentPayment } from "@/lib/academy/enrollment.functions";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, Loader2, ShieldCheck, User2, BookOpen, Sparkles,
} from "lucide-react";

type Course = {
  id: string; slug: string; program_name: string; program_type: string;
  tuition_ngn: number; duration: string | null; cover_image: string | null;
  entry_requirements: string | null;
};

export const Route = createFileRoute("/_authenticated/academy/apply/$slug")({
  component: ApplyWizard,
});

const COUNTRIES = ["Nigeria","United Kingdom","United States","Canada","Germany","France","Italy","Spain","Netherlands","United Arab Emirates","Saudi Arabia","South Africa","Ghana","Kenya","Other"];
const EDU_LEVELS = ["Secondary school (SSCE)","Diploma / OND","Bachelor's degree","Master's degree","PhD","Self-taught"];

function ApplyWizard() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { format, currency } = useCurrency();
  const initPay = useServerFn(initEnrollmentPayment);

  const [course, setCourse] = useState<Course | null>(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [city, setCity] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  // Step 2
  const [highestLevel, setHighestLevel] = useState("");
  const [institution, setInstitution] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  // Step 3
  const [motivation, setMotivation] = useState("");

  // Step 4 → payment

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("courses")
        .select("id,slug,program_name,program_type,tuition_ngn,duration,cover_image,entry_requirements")
        .eq("slug", slug).eq("is_published", true).maybeSingle();
      setCourse(data as Course | null);
    })();
  }, [slug]);

  // Prefill name from profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      if (data?.full_name && !fullName) setFullName(data.full_name);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const priceLabel = useMemo(() => course ? format(course.tuition_ngn) : "—", [course, format]);

  // Compute the actual numeric amount + currency (mirrors useCurrency.format math)
  const computedAmount = useMemo(() => {
    if (!course) return { amount: 0, code: "NGN" };
    const rates: Record<string, number> = { NGN: 1, USD: 1/1550, GBP: 1/1950, EUR: 1/1680, CAD: 1/1140, AED: 1/420 };
    const r = rates[currency] ?? 1;
    return { amount: Math.max(1, Math.round(course.tuition_ngn * r)), code: currency };
  }, [course, currency]);

  function validateStep(n: number): boolean {
    if (n === 1) {
      if (!fullName.trim()) return false;
      if (!phone.trim()) return false;
      if (!country) return false;
    }
    if (n === 2) {
      if (!highestLevel) return false;
    }
    if (n === 3) {
      if (motivation.trim().length < 30) return false;
    }
    return true;
  }

  async function handlePay() {
    if (!course) return;
    setSubmitting(true);
    try {
      const res = await initPay({
        data: {
          courseSlug: course.slug,
          personalInfo: { fullName, phone, country, city, dateOfBirth: dob, gender },
          educationBackground: { highestLevel, institution, fieldOfStudy, yearsExperience },
          motivationEssay: motivation,
          amount: computedAmount.amount,
          currency: computedAmount.code,
        },
      });
      window.location.href = res.authorization_url;
    } catch (e) {
      toast.error((e as Error).message || "Could not start payment");
      setSubmitting(false);
    }
  }

  if (!course) {
    return <SiteLayout><div className="mx-auto max-w-3xl px-6 py-24"><div className="h-64 animate-pulse rounded-3xl bg-secondary/40" /></div></SiteLayout>;
  }

  return (
    <SiteLayout>
      <Section className="!py-10">
        <div className="mx-auto max-w-4xl">
          <Link to="/academy/course/$slug" params={{ slug: course.slug }} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Back to course
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[oklch(0.65_0.19_252)]/10 text-[oklch(0.65_0.19_252)]"><GraduationCap className="h-6 w-6" /></div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{course.program_type}</div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">Apply for {course.program_name}</h1>
            </div>
          </div>

          {/* Stepper */}
          <ol className="mt-8 grid grid-cols-4 gap-2 text-xs">
            {["Personal","Background","Motivation","Payment"].map((label, i) => {
              const n = i + 1;
              const active = step === n; const done = step > n;
              return (
                <li key={label} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${active ? "border-[oklch(0.65_0.19_252)] bg-[oklch(0.65_0.19_252)]/5" : done ? "border-emerald-500/40 bg-emerald-500/5" : "border-border"}`}>
                  {done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${active ? "bg-[oklch(0.65_0.19_252)] text-white" : "bg-secondary"}`}>{n}</span>}
                  <span className="font-medium">{label}</span>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-border bg-card p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <SectionTitle icon={<User2 className="h-4 w-4" />} title="Personal information" />
                  <Grid>
                    <Field label="Full name *"><Input value={fullName} onChange={setFullName} placeholder="Aisha Mohammed" /></Field>
                    <Field label="Phone / WhatsApp *"><Input value={phone} onChange={setPhone} placeholder="+234 80…" /></Field>
                    <Field label="Country *">
                      <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="City"><Input value={city} onChange={setCity} placeholder="Sokoto" /></Field>
                    <Field label="Date of birth"><Input type="date" value={dob} onChange={setDob} /></Field>
                    <Field label="Gender">
                      <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option value="">Prefer not to say</option>
                        <option>Female</option><option>Male</option><option>Other</option>
                      </select>
                    </Field>
                  </Grid>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <SectionTitle icon={<BookOpen className="h-4 w-4" />} title="Education & background" />
                  <Grid>
                    <Field label="Highest level of education *">
                      <select value={highestLevel} onChange={(e) => setHighestLevel(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option value="">Select…</option>
                        {EDU_LEVELS.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </Field>
                    <Field label="Institution"><Input value={institution} onChange={setInstitution} placeholder="University of …" /></Field>
                    <Field label="Field of study"><Input value={fieldOfStudy} onChange={setFieldOfStudy} placeholder="Computer Science" /></Field>
                    <Field label="Years of related experience"><Input value={yearsExperience} onChange={setYearsExperience} placeholder="0 – 1" /></Field>
                  </Grid>
                  {course.entry_requirements && (
                    <div className="rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
                      <strong className="text-foreground">Entry requirements:</strong> {course.entry_requirements}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <SectionTitle icon={<Sparkles className="h-4 w-4" />} title="Tell us why you're applying" />
                  <Field label={`Motivation essay * (min 30 characters — ${motivation.trim().length} so far)`}>
                    <textarea
                      value={motivation} onChange={(e) => setMotivation(e.target.value)} rows={8}
                      placeholder="What do you want to achieve with this program? What's your background and how will this course help you?"
                      className="w-full rounded-lg border border-border bg-background p-3 text-sm"
                    />
                  </Field>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <SectionTitle icon={<ShieldCheck className="h-4 w-4" />} title="Review & pay tuition" />
                  <Review label="Name" value={fullName} />
                  <Review label="Phone" value={phone} />
                  <Review label="Location" value={[city, country].filter(Boolean).join(", ")} />
                  <Review label="Education" value={[highestLevel, institution, fieldOfStudy].filter(Boolean).join(" · ")} />
                  <Review label="Program" value={`${course.program_name} (${course.program_type})`} />
                  <Review label="Tuition" value={priceLabel} />
                  <div className="rounded-lg border border-[oklch(0.65_0.19_252)]/30 bg-[oklch(0.65_0.19_252)]/5 p-3 text-xs">
                    Secure checkout via Paystack. You'll be redirected and returned here once payment completes. We never store your card details.
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <Button variant="ghost" disabled={step === 1 || submitting} onClick={() => setStep((s) => Math.max(1, s - 1))}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                {step < 4 ? (
                  <Button variant="brand" onClick={() => validateStep(step) ? setStep((s) => s + 1) : toast.error("Please complete the required fields")}>
                    Continue <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="brand" onClick={handlePay} disabled={submitting}>
                    {submitting ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Redirecting…</> : <>Pay {priceLabel} with Paystack</>}
                  </Button>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {course.cover_image && (
                  <img src={course.cover_image} alt={course.program_name} className="aspect-video w-full object-cover" />
                )}
                <div className="p-4">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{course.program_type}</div>
                  <div className="mt-1 font-bold leading-tight">{course.program_name}</div>
                  {course.duration && <div className="mt-2 text-xs text-muted-foreground">{course.duration}</div>}
                  <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">Tuition</span>
                    <span className="text-lg font-extrabold">{priceLabel}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground">
                After payment, you'll get instant access to your learning portal, course materials, and your instructor.
              </div>
            </aside>
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center gap-2 text-sm font-semibold"><span className="text-[oklch(0.65_0.19_252)]">{icon}</span>{title}</div>;
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs"><span className="mb-1 block font-medium text-muted-foreground">{label}</span>{children}</label>;
}
function Input(props: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={props.type || "text"} value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={props.placeholder}
    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />;
}
function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || "—"}</span>
    </div>
  );
}