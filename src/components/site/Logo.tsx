import logoNew from "@/assets/ndh-logo-new.jpg";

export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img src={logoNew} alt="Najeeb Digital Hub logo" width={40} height={40} decoding="async" fetchPriority="high" className={`${className} rounded-full object-cover ring-2 ring-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.3)]`} />
  );
}
