"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { ConfigOfrenda } from "@/lib/supabase";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded text-white/20 hover:text-white/70 transition-colors"
      title="Copiar"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  );
}

export default function OfrendaCards({ ofrenda }: { ofrenda: ConfigOfrenda }) {
  if (!ofrenda.sinpe_numero && !ofrenda.bcr_iban_colones) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {/* SINPE */}
      {ofrenda.sinpe_numero && (
        <div className="rounded-2xl border border-white/5 p-6" style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <p className="text-accent text-[10px] font-black tracking-[3px] uppercase">SINPE Móvil</p>
          </div>
          <div className="flex items-center gap-1">
            <p className="text-white font-black text-3xl tracking-tight">{ofrenda.sinpe_numero}</p>
            <CopyButton value={ofrenda.sinpe_numero} />
          </div>
          {ofrenda.sinpe_nombre && <p className="text-white/40 text-sm mt-1">{ofrenda.sinpe_nombre}</p>}
        </div>
      )}

      {/* BCR */}
      {(ofrenda.bcr_iban_colones || ofrenda.bcr_iban_dolares) && (
        <div className="rounded-2xl border border-white/5 p-6" style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <p className="text-accent text-[10px] font-black tracking-[3px] uppercase">Transferencia BCR</p>
          </div>
          {ofrenda.bcr_nombre && <p className="text-white font-semibold text-sm mb-0.5">{ofrenda.bcr_nombre}</p>}
          {ofrenda.bcr_cedula && <p className="text-white/40 text-xs mb-4">Cédula jurídica: {ofrenda.bcr_cedula}</p>}
          {ofrenda.bcr_iban_colones && (
            <div className="mb-3">
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Colones — IBAN</p>
              <div className="flex items-center gap-1">
                <p className="text-white font-mono text-sm tracking-wider">{ofrenda.bcr_iban_colones}</p>
                <CopyButton value={ofrenda.bcr_iban_colones} />
              </div>
            </div>
          )}
          {ofrenda.bcr_iban_dolares && (
            <div>
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Dólares — IBAN</p>
              <div className="flex items-center gap-1">
                <p className="text-white font-mono text-sm tracking-wider">{ofrenda.bcr_iban_dolares}</p>
                <CopyButton value={ofrenda.bcr_iban_dolares} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
