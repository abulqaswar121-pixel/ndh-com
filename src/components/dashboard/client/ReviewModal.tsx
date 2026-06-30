import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

function StarRow({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)}>
            <Star className={`h-5 w-5 ${n <= value ? "fill-yellow-400 stroke-yellow-400" : "stroke-muted-foreground"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewModal({
  taskId,
  pmId,
  onClose,
  onSubmitted,
}: {
  taskId: string;
  pmId: string | null;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const { user } = useAuth();
  const [overall, setOverall] = useState(5);
  const [quality, setQuality] = useState(5);
  const [comms, setComms] = useState(5);
  const [speed, setSpeed] = useState(5);
  const [written, setWritten] = useState("");
  const [hireAgain, setHireAgain] = useState<boolean | null>(true);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        task_id: taskId,
        client_id: user.id,
        pm_id: pmId,
        overall_rating: overall,
        quality_rating: quality,
        communication_rating: comms,
        speed_rating: speed,
        written_review: written.trim() || null,
        would_hire_again: hireAgain,
      });
      if (error) throw error;
      await supabase.from("tasks").update({ reviewed: true }).eq("id", taskId);
      toast.success("Thanks for your review!");
      onSubmitted();
      onClose();
    } catch (e) {
      toast.error((e as Error).message || "Could not submit review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elegant" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground"><X className="h-5 w-5" /></button>
        <h2 className="text-xl font-extrabold">How did we do?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your feedback helps us deliver excellence.</p>
        <div className="mt-5 space-y-3 rounded-xl border border-border bg-background p-4">
          <StarRow label="Overall" value={overall} onChange={setOverall} />
          <StarRow label="Quality" value={quality} onChange={setQuality} />
          <StarRow label="Communication" value={comms} onChange={setComms} />
          <StarRow label="Speed" value={speed} onChange={setSpeed} />
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium">Tell us more (optional)</label>
          <textarea
            value={written}
            onChange={(e) => setWritten(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="What stood out about this experience?"
          />
        </div>
        <div className="mt-4">
          <div className="text-sm font-medium">Would you hire NDH again?</div>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant={hireAgain === true ? "brand" : "outline"} onClick={() => setHireAgain(true)}>Yes</Button>
            <Button size="sm" variant={hireAgain === false ? "brand" : "outline"} onClick={() => setHireAgain(false)}>No</Button>
          </div>
        </div>
        <Button className="mt-5 w-full" variant="brand" onClick={submit} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit review"}
        </Button>
      </div>
    </div>
  );
}