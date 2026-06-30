export type TalentTask = {
  id: string;
  title: string;
  description: string | null;
  service_category: string;
  tier: string;
  status: string;
  files: { name: string; path: string }[] | null;
  deliverables: { name: string; path: string }[] | null;
  deadline: string | null;
  assigned_pm_id: string | null;
  assigned_talent_id: string;
  talent_pay_rate: number | null;
  talent_response: "pending" | "accepted" | "declined" | null;
  talent_response_deadline: string | null;
  talent_assigned_at: string | null;
  revision_notes: string | null;
  revision_count: number;
  delivered_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export const TIER_NAMES: Record<number, string> = {
  1: "Tier 1 · Junior",
  2: "Tier 2 · Associate",
  3: "Tier 3 · Professional",
  4: "Tier 4 · Senior",
  5: "Tier 5 · Elite",
};

export const TIER_TARGETS: Record<number, { tasks: number; approval: number; months: number }> = {
  1: { tasks: 5, approval: 90, months: 1 },
  2: { tasks: 20, approval: 92, months: 3 },
  3: { tasks: 50, approval: 94, months: 6 },
  4: { tasks: 120, approval: 96, months: 12 },
  5: { tasks: 300, approval: 98, months: 24 },
};