import type { ReactNode } from "react";
import { UnsplashImg } from "./UnsplashImg";

/**
 * Hero with auto-fetched looping background video + Unsplash poster fallback.
 * If the video fails to load, the poster stays visible.
 */
export function VideoHero({
  videoSrc,
  posterQuery,
  posterAlt,
  children,
  className = "",
}: {
  videoSrc?: string;
  posterQuery: string;
  posterAlt: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative isolate overflow-hidden bg-[#06091e] text-white ${className}`}>
      <div className="absolute inset-0">
        <UnsplashImg
          q={posterQuery}
          alt={posterAlt}
          w={1920}
          h={1080}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        {videoSrc && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.1 0.06 268 / 0.85), oklch(0.08 0.05 268 / 0.95)), radial-gradient(ellipse 70% 50% at 50% 0%, oklch(0.65 0.19 252 / 0.35), transparent 60%)",
          }}
        />
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}