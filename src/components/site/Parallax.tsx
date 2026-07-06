import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

/**
 * Premium scroll-linked parallax wrapper. Content translates on Y axis as the
 * element passes through the viewport, tied continuously to scroll progress.
 * Respects prefers-reduced-motion.
 */
export function Parallax({
  children,
  offset = 60,
  className = "",
}: {
  children: ReactNode;
  offset?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [offset, -offset]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Fixed top scroll-progress bar. Animates on scroll via framer-motion's
 * useScroll — no re-renders per frame.
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{ scaleX: scrollYProgress, transformOrigin: "0% 50%" }}
      className="fixed left-0 right-0 top-0 z-[60] h-0.5 bg-gradient-brand"
      aria-hidden
    />
  );
}