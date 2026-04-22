"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type Country = { code: string; dial: string; flag: string; name: string };

const COUNTRIES: Country[] = [
  { code: "CR", dial: "+506", flag: "🇨🇷", name: "Costa Rica" },
  { code: "US", dial: "+1",   flag: "🇺🇸", name: "Estados Unidos" },
  { code: "MX", dial: "+52",  flag: "🇲🇽", name: "México" },
  { code: "GT", dial: "+502", flag: "🇬🇹", name: "Guatemala" },
  { code: "SV", dial: "+503", flag: "🇸🇻", name: "El Salvador" },
  { code: "HN", dial: "+504", flag: "🇭🇳", name: "Honduras" },
  { code: "NI", dial: "+505", flag: "🇳🇮", name: "Nicaragua" },
  { code: "PA", dial: "+507", flag: "🇵🇦", name: "Panamá" },
  { code: "CO", dial: "+57",  flag: "🇨🇴", name: "Colombia" },
  { code: "VE", dial: "+58",  flag: "🇻🇪", name: "Venezuela" },
  { code: "EC", dial: "+593", flag: "🇪🇨", name: "Ecuador" },
  { code: "PE", dial: "+51",  flag: "🇵🇪", name: "Perú" },
  { code: "BO", dial: "+591", flag: "🇧🇴", name: "Bolivia" },
  { code: "CL", dial: "+56",  flag: "🇨🇱", name: "Chile" },
  { code: "AR", dial: "+54",  flag: "🇦🇷", name: "Argentina" },
  { code: "PY", dial: "+595", flag: "🇵🇾", name: "Paraguay" },
  { code: "UY", dial: "+598", flag: "🇺🇾", name: "Uruguay" },
  { code: "BR", dial: "+55",  flag: "🇧🇷", name: "Brasil" },
  { code: "DO", dial: "+1",   flag: "🇩🇴", name: "Rep. Dominicana" },
  { code: "PR", dial: "+1",   flag: "🇵🇷", name: "Puerto Rico" },
  { code: "CU", dial: "+53",  flag: "🇨🇺", name: "Cuba" },
  { code: "ES", dial: "+34",  flag: "🇪🇸", name: "España" },
  { code: "CA", dial: "+1",   flag: "🇨🇦", name: "Canadá" },
];

const DEFAULT_COUNTRY = COUNTRIES[0];

function parseValue(value: string): { country: Country; number: string } {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return { country: DEFAULT_COUNTRY, number: "" };

  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (trimmed.startsWith(c.dial)) {
      return { country: c, number: trimmed.slice(c.dial.length).trim() };
    }
  }
  return { country: DEFAULT_COUNTRY, number: trimmed };
}

type Props = {
  value: string;
  onChange: (combined: string) => void;
  placeholder?: string;
  className?: string;
};

export default function PhoneInput({ value, onChange, placeholder = "8888-8888", className = "" }: Props) {
  const parsed = useMemo(() => parseValue(value), [value]);
  const [country, setCountry] = useState<Country>(parsed.country);
  const [number, setNumber] = useState<string>(parsed.number);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCountry(parsed.country);
    setNumber(parsed.number);
  }, [parsed.country, parsed.number]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const emit = (c: Country, n: string) => {
    const cleanNum = n.trim();
    onChange(cleanNum ? `${c.dial} ${cleanNum}` : "");
  };

  const pickCountry = (c: Country) => {
    setCountry(c);
    setOpen(false);
    emit(c, number);
  };

  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = e.target.value;
    setNumber(n);
    emit(country, n);
  };

  return (
    <div ref={rootRef} className={`relative flex items-stretch w-full ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 rounded-l-xl border border-r-0 border-border text-white/80 hover:bg-white/5 transition-colors shrink-0"
        style={{ background: "#080E1E" }}
        aria-label="Código de país"
      >
        <span className="text-base leading-none">{country.flag}</span>
        <span className="text-white/70 text-sm font-mono">{country.dial}</span>
        <ChevronDown size={12} className="text-white/40" />
      </button>
      <input
        type="tel"
        className="input flex-1 min-w-0 !rounded-l-none"
        value={number}
        onChange={onNumberChange}
        placeholder={placeholder}
        inputMode="tel"
      />
      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-64 max-h-72 overflow-y-auto rounded-xl border border-border z-50 shadow-xl [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.22)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20"
          style={{ background: "#0D1628" }}
        >
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => pickCountry(c)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors ${
                c.code === country.code ? "bg-accent/10" : ""
              }`}
            >
              <span className="text-lg leading-none">{c.flag}</span>
              <span className="text-white/80 text-sm flex-1 truncate">{c.name}</span>
              <span className="text-white/40 text-xs font-mono">{c.dial}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
