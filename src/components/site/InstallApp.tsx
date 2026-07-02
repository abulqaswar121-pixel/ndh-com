import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(display-mode: standalone)").matches) setInstalled(true);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  return { canInstall: !!deferred && !installed, installed, install };
}

/** Full section for the homepage. */
export function InstallAppSection() {
  const { canInstall, installed, install } = useInstallPrompt();
  return (
    <section id="install" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[oklch(0.25_0.11_270)] via-[oklch(0.20_0.08_260)] to-[oklch(0.18_0.09_275)] opacity-90" />
      <div className="container relative mx-auto grid gap-12 px-4 md:grid-cols-2 md:items-center">
        <div className="text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            <Smartphone className="h-3.5 w-3.5" /> NDH App
          </span>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            Install NDH on your phone.
          </h2>
          <p className="mt-4 max-w-lg text-white/80">
            One-tap access to your dashboard, briefs, invoices, class recordings and messages — with offline caching and push-ready notifications.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {installed ? (
              <span className="rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-200">
                ✓ Installed on this device
              </span>
            ) : canInstall ? (
              <Button size="lg" onClick={install} className="bg-white text-[oklch(0.25_0.11_270)] hover:bg-white/90">
                <Download className="mr-2 h-4 w-4" /> Install NDH
              </Button>
            ) : (
              <p className="text-sm text-white/70">
                Open <span className="font-semibold text-white">ndh.com.ng</span> in Chrome, Edge or Safari, then choose <span className="font-semibold text-white">Add to Home Screen</span>.
              </p>
            )}
            <a href="#services" className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
              Learn more
            </a>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm">
          <div className="rounded-[2.5rem] border border-white/20 bg-white/5 p-3 shadow-2xl backdrop-blur">
            <div className="rounded-[2rem] bg-gradient-to-br from-[oklch(0.65_0.19_252)] via-[oklch(0.55_0.20_285)] to-[oklch(0.60_0.15_200)] p-6 text-white">
              <div className="mb-6 flex items-center justify-between text-[10px] font-semibold">
                <span>9:41</span>
                <span>NDH</span>
              </div>
              <div className="text-xs uppercase tracking-widest opacity-80">Today</div>
              <div className="mt-1 text-2xl font-extrabold">3 briefs in review</div>
              <div className="mt-6 space-y-3">
                {["Brand identity — v3 delivered", "Website copy — approved ✓", "Live class in 2h"].map((t) => (
                  <div key={t} className="rounded-xl bg-white/15 px-3 py-2 text-sm">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Floating banner shown to signed-in users on their dashboard. */
export function InstallAppBanner() {
  const { canInstall, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.sessionStorage.getItem("ndh_install_dismissed") === "1";
  });
  if (!canInstall || dismissed) return null;
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
      <div className="flex items-center gap-3">
        <Smartphone className="h-5 w-5 text-primary" />
        <div>
          <div className="font-semibold text-foreground">Install the NDH app</div>
          <div className="text-muted-foreground">One-tap access, offline caching and notifications.</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={install}><Download className="mr-1.5 h-3.5 w-3.5" /> Install</Button>
        <button
          onClick={() => { window.sessionStorage.setItem("ndh_install_dismissed", "1"); setDismissed(true); }}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}