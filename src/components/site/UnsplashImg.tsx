import { useState } from "react";

/**
 * Auto-fetches an Unsplash image by keyword. If the image fails to load
 * (rate limit, network error), gracefully falls back to a branded gradient
 * block so the page never shows a broken-image icon.
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
  const [failed, setFailed] = useState(false);
  const keyword = encodeURIComponent(q);
  const seed = encodeURIComponent(String(sig ?? q));
  // Use source.unsplash.com (random by keyword). Fallback chain: picsum seeded -> gradient.
  const primary = `https://source.unsplash.com/${w}x${h}/?${keyword}`;
  const fallback = `https://picsum.photos/seed/${seed}/${w}/${h}`;

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
  return (
    <img
      src={primary}
      alt={alt}
      width={w}
      height={h}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const el = e.currentTarget;
        if (el.src === primary) {
          el.src = fallback;
        } else {
          setFailed(true);
        }
      }}
      className={className}
    />
  );
}