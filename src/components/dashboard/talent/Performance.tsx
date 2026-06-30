import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type Review = { id: string; quality_rating: number; communication_rating: number; timeliness_rating: number; notes: string | null; approved: boolean; created_at: string };

export function TalentPerformance() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("talent_reviews").select("*").eq("talent_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setReviews((data as Review[]) || []));
  }, [user]);

  const n = reviews.length || 1;
  const avg = (k: keyof Review) => (reviews.reduce((s, r) => s + (r[k] as number), 0) / n).toFixed(2);
  const approval = reviews.length ? Math.round((reviews.filter((r) => r.approved).length / reviews.length) * 100) : 100;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">My performance</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        <Card label="Approval rate" value={`${approval}%`} />
        <Card label="Avg quality" value={avg("quality_rating")} />
        <Card label="Avg communication" value={avg("communication_rating")} />
        <Card label="Avg timeliness" value={avg("timeliness_rating")} />
      </div>
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3 text-sm font-bold">Recent reviews from PMs</div>
        {reviews.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {reviews.slice(0, 20).map((r) => (
              <li key={r.id} className="px-5 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Quality {r.quality_rating} · Comms {r.communication_rating} · Timeliness {r.timeliness_rating}</span>
                  <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {r.notes && <p className="mt-1 text-sm text-muted-foreground">{r.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
    </div>
  );
}