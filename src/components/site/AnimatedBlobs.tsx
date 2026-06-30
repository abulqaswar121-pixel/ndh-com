export function AnimatedBlobs({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div
        className="animate-blob absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.65 0.19 252 / 0.9), transparent 60%)" }}
      />
      <div
        className="animate-blob absolute top-1/3 -right-32 h-[32rem] w-[32rem] rounded-full opacity-35 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.62 0.21 290 / 0.9), transparent 60%)", animationDelay: "4s" }}
      />
      <div
        className="animate-blob absolute -bottom-32 left-1/3 h-[26rem] w-[26rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.78 0.13 180 / 0.9), transparent 60%)", animationDelay: "8s" }}
      />
    </div>
  );
}