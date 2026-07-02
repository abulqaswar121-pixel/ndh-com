import logoAsset from "@/assets/ndh-logo.png.asset.json";

export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img src={logoAsset.url} alt="Najeeb Digital Hub logo" width={40} height={40} decoding="async" fetchPriority="high" className={`${className} rounded-full object-cover`} />
  );
}