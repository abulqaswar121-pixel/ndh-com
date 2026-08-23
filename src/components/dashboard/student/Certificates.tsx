import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Award, Download, Linkedin } from "lucide-react";
import { getCertificateDownloadUrl } from "@/lib/academy/certificate.functions";
import { toast } from "sonner";

type Cert = {
  id: string;
  certificate_number: string;
  issue_date: string;
  grade: string | null;
  pdf_url: string | null;
  course: { program_name: string; program_type: string } | null;
};

export function Certificates() {
  const { user } = useAuth();
  const [certs, setCerts] = useState<Cert[]>([]);
  const downloadFn = useServerFn(getCertificateDownloadUrl);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("certificates")
      .select("id,certificate_number,issue_date,grade,pdf_url,course:courses(program_name,program_type)")
      .eq("student_id", user.id)
      .order("issue_date", { ascending: false })
      .then(({ data }) => setCerts((data as unknown as Cert[]) || []));
  }, [user]);

  async function download(c: Cert) {
    try {
      const { url } = await downloadFn({ data: { certificateId: c.id } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      toast.error(err?.message || "Download failed");
    }
  }

  function shareOnLinkedIn(c: Cert) {
    const verifyUrl = `${window.location.origin}/verify/${c.certificate_number}`;
    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: c.course?.program_name || "NDH Program",
      organizationName: "Najeeb Digital Hub Academy",
      issueYear: String(new Date(c.issue_date).getFullYear()),
      issueMonth: String(new Date(c.issue_date).getMonth() + 1),
      certUrl: verifyUrl,
      certId: c.certificate_number,
    });
    window.open(`https://www.linkedin.com/profile/add?${params.toString()}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Certificates</h1>
      {certs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Award className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Complete a course to earn your NDH certificate. Once you reach 100% in My Courses, click <strong>Claim certificate</strong>.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certs.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-gradient-to-br from-card to-secondary/40 p-6">
              <div className="flex items-start justify-between">
                <Award className="h-8 w-8 text-primary" />
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">{c.grade || "Pass"}</span>
              </div>
              <div className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">{c.course?.program_type}</div>
              <div className="text-lg font-bold">{c.course?.program_name}</div>
              <div className="mt-2 font-mono text-xs text-muted-foreground">{c.certificate_number}</div>
              <div className="mt-1 text-xs text-muted-foreground">Issued {new Date(c.issue_date).toLocaleDateString()}</div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <Link to="/verify/$id" params={{ id: c.certificate_number }} className="font-semibold text-primary hover:underline">Verify</Link>
                <button onClick={() => download(c)} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </button>
                <button onClick={() => shareOnLinkedIn(c)} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                  <Linkedin className="h-3.5 w-3.5" /> Add to LinkedIn
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
