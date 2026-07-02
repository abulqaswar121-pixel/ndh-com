import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// In-memory cache (per-worker instance) so we do not hammer Pexels.
const cache = new Map<string, { url: string; at: number }>();
const TTL_MS = 1000 * 60 * 60 * 24; // 24h

const Input = z.object({
  q: z.string().min(1).max(120),
  w: z.number().int().min(120).max(2400).default(1200),
  h: z.number().int().min(120).max(2400).default(800),
  orientation: z.enum(["landscape", "portrait", "square"]).optional(),
  // Deterministic pick index so the same keyword+sig returns the same photo
  sig: z.string().max(120).optional(),
});

export const getPexelsPhoto = createServerFn({ method: "GET" })
  .inputValidator((raw) => Input.parse(raw))
  .handler(async ({ data }) => {
    const key = `${data.q}|${data.w}x${data.h}|${data.orientation ?? "any"}|${data.sig ?? ""}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < TTL_MS) return { url: hit.url };

    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) return { url: null as string | null };

    const params = new URLSearchParams({
      query: data.q,
      per_page: "15",
      ...(data.orientation ? { orientation: data.orientation } : {}),
    });
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
        headers: { Authorization: apiKey },
      });
      if (!res.ok) return { url: null };
      const json = (await res.json()) as {
        photos?: Array<{ src: { large2x: string; large: string; medium: string; original: string } }>;
      };
      const photos = json.photos ?? [];
      if (!photos.length) return { url: null };
      // Deterministic pick using sig hash so images stay stable across renders.
      let idx = 0;
      if (data.sig) {
        let h = 0;
        for (let i = 0; i < data.sig.length; i++) h = (h * 31 + data.sig.charCodeAt(i)) | 0;
        idx = Math.abs(h) % photos.length;
      }
      const src = photos[idx].src;
      // Pick best-fitting size based on requested width.
      const url = data.w >= 1200 ? src.large2x : data.w >= 800 ? src.large : src.medium;
      cache.set(key, { url, at: Date.now() });
      return { url };
    } catch {
      return { url: null };
    }
  });