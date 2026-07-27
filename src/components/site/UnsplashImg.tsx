import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPexelsPhoto } from "@/lib/pexels.functions";

// Module-level in-flight/result cache so we don't refetch the same
// keyword+size on every remount within a session.
const memo = new Map<string, Promise<string | null>>();

function loadPexels(q: string, w: number, h: number, sig?: string) {
  const orientation: "landscape" | "portrait" | "square" =
    w > h ? "landscape" : h > w ? "portrait" : "square";
  const key = `${q}|${w}x${h}|${orientation}|${sig ?? ""}`;
  const cached = memo.get(key);
  if (cached) return cached;
  const p = (getPexelsPhoto as unknown as (a: { data: { q: string; w: number; h: number; orientation: "landscape" | "portrait" | "square"; sig?: string } }) => Promise<{ url: string | null }>)
    ({ data: { q, w, h, orientation, sig } })
    .then((r) => r.url)
    .catch(() => null);
  memo.set(key, p);
  return p;
}

/**
 * Auto-fetches a photo from Pexels by keyword. Falls back to a seeded
 * picsum photo and finally to a branded gradient block. Public API kept
 * identical to the previous UnsplashImg for drop-in compatibility.
 */
export function UnsplashImg({
  q,
  w = 1200,
  h = 800,
  alt,
  className = "",
  sig,
}: {
  q: string;
  w?: number;
  h?: number;
  alt: string;
  className?: string;
  sig?: string | number;
}) {
  const sigStr = sig !== undefined ? String(sig) : undefined;
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  // Attach server fn once so tree-shaking keeps the reference.
  useServerFn(getPexelsPhoto);

  useEffect(() => {
    let cancelled = false;
    loadPexels(q, w, h, sigStr).then((url) => {
      if (!cancelled) {
        if (url) setSrc(url);
        else setFailed(true);
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, w, h, sigStr]);

  if (failed) {
    return (
      <div
        aria-label={alt}
        role="img"
        className={`bg-gradient-brand ${className}`}
        style={{ aspectRatio: `${w}/${h}` }}
      />
    );
  }
  if (!src) {
    return (
      <div
        aria-label={alt}
        role="img"
        className={`animate-pulse bg-secondary ${className}`}
        style={{ aspectRatio: `${w}/${h}` }}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={w}
      height={h}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}