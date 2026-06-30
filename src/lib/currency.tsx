import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CurrencyCode = "NGN" | "USD" | "GBP" | "EUR" | "CAD" | "AED";

type CurrencyInfo = { code: CurrencyCode; symbol: string; rate: number; label: string };

// Approximate FX rates relative to NGN base = 1.
// Values used purely for display until live FX is wired.
export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  NGN: { code: "NGN", symbol: "₦", rate: 1, label: "Nigerian Naira" },
  USD: { code: "USD", symbol: "$", rate: 1 / 1550, label: "US Dollar" },
  GBP: { code: "GBP", symbol: "£", rate: 1 / 1950, label: "British Pound" },
  EUR: { code: "EUR", symbol: "€", rate: 1 / 1680, label: "Euro" },
  CAD: { code: "CAD", symbol: "C$", rate: 1 / 1140, label: "Canadian Dollar" },
  AED: { code: "AED", symbol: "د.إ", rate: 1 / 420, label: "UAE Dirham" },
};

const COUNTRY_TO_CCY: Record<string, CurrencyCode> = {
  NG: "NGN", GB: "GBP", UK: "GBP", US: "USD", CA: "CAD",
  AE: "AED",
  // Eurozone
  DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", BE: "EUR", IE: "EUR",
  PT: "EUR", AT: "EUR", FI: "EUR", GR: "EUR", LU: "EUR",
};

type Ctx = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  format: (amountNgn: number) => string;
};

const CurrencyCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "ndh-currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("NGN");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved && saved in CURRENCIES) {
      setCurrencyState(saved as CurrencyCode);
      return;
    }
    // Auto-detect by IP (best-effort, silent fallback to NGN).
    fetch("https://ipapi.co/json/")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const cc = d?.country_code as string | undefined;
        if (cc && COUNTRY_TO_CCY[cc]) setCurrencyState(COUNTRY_TO_CCY[cc]);
      })
      .catch(() => {});
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch {}
  };

  const value = useMemo<Ctx>(() => ({
    currency,
    setCurrency,
    format: (ngn: number) => {
      const info = CURRENCIES[currency];
      const v = ngn * info.rate;
      const rounded = v >= 1000 ? Math.round(v) : Math.round(v * 100) / 100;
      return `${info.symbol}${rounded.toLocaleString()}`;
    },
  }), [currency]);

  return <CurrencyCtx.Provider value={value}>{children}</CurrencyCtx.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyCtx);
  if (!ctx) {
    // Safe fallback when used outside provider (e.g. SSR shell).
    return {
      currency: "NGN" as CurrencyCode,
      setCurrency: () => {},
      format: (n: number) => `₦${Math.round(n).toLocaleString()}`,
    };
  }
  return ctx;
}

export function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <label className={`inline-flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
      <span className="uppercase tracking-widest">Currency</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        className="rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground"
      >
        {Object.values(CURRENCIES).map((c) => (
          <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
        ))}
      </select>
    </label>
  );
}