// Deterministic anonymous Talent ID derived from user_id + optional headline.
// Format: NDH-<CAT>-<NNNN>  e.g. NDH-DS-0421
//
// The public site never renders talent names or photos; the Talent ID is what
// clients quote in briefs. It is stable per user and safe to display publicly.

const CATEGORY_MAP: Array<{ test: RegExp; code: string }> = [
  { test: /design|brand|ui|ux|figma|illustrat/i, code: "DS" },
  { test: /engineer|developer|frontend|backend|full[- ]?stack|react|node|python|devops|mobile/i, code: "EN" },
  { test: /market|seo|ads|growth|paid|social/i, code: "MK" },
  { test: /writ|content|copy|editor|script/i, code: "WR" },
  { test: /video|motion|edit|film|animator|photograph|producer|studio/i, code: "MD" },
  { test: /data|analyt|dashboard|report/i, code: "DA" },
  { test: /ai|ml|automation|agent|prompt/i, code: "AI" },
  { test: /project manager|pm|producer|ops|operation|coordinator/i, code: "PM" },
];

function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function talentCodeFor(userId: string, headline?: string | null): string {
  const cat =
    CATEGORY_MAP.find((c) => c.test.test(headline ?? ""))?.code ?? "TL";
  const num = (fnv1a(userId) % 9000) + 1000; // 1000..9999
  return `NDH-${cat}-${num}`;
}

export function tierLabel(tier: string | number | null | undefined): string {
  if (tier == null || tier === "") return "";
  if (typeof tier === "number") {
    // Numeric tiers 1..5 → Junior..Elite
    const map = ["Junior", "Mid", "Senior", "Lead", "Elite"];
    return map[Math.max(0, Math.min(map.length - 1, tier - 1))];
  }
  const map: Record<string, string> = {
    junior: "Junior",
    mid: "Mid",
    senior: "Senior",
    lead: "Lead",
    elite: "Elite",
    principal: "Principal",
  };
  return map[tier.toLowerCase()] ?? tier.charAt(0).toUpperCase() + tier.slice(1);
}