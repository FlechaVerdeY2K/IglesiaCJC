"use client";
import { useState, useEffect } from "react";
import { BookMarked, X, ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Lazy-load BibleReader so it doesn't inflate the homepage bundle
const BibleReader = dynamic(() => import("./BibleReader"), {
  loading: () => (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  ),
  ssr: false,
});

type Props = {
  libro: string;
  capitulo: number;
  versiculo?: number;
  titulo: string;
  verseText: string;
  libroNombre: string;
};

export default function BibleBanner({ libro, capitulo, versiculo, titulo, verseText, libroNombre }: Props) {
  const [open, setOpen] = useState(false);
  const ref = `${libroNombre} ${capitulo}${versiculo ? `:${versiculo}` : ""}`;
  const displayTitle = titulo || ref;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Banner ── */}
      <button
        onClick={() => setOpen(true)}
        className="group relative w-full flex flex-col sm:flex-row items-start gap-6 rounded-2xl border border-accent/20 p-7 overflow-hidden hover:border-accent/40 transition-all duration-300 text-left"
        style={{ background: "linear-gradient(135deg, #0F1C30 0%, #0D0A18 100%)" }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at left, rgba(191,30,46,0.07) 0%, transparent 60%)" }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #BF1E2E, transparent)" }} />

        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(191,30,46,0.12)", border: "1px solid rgba(191,30,46,0.25)" }}>
          <BookMarked size={24} className="text-accent" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-accent text-[10px] font-black tracking-[3px] uppercase mb-1">Lectura de la Semana</p>
          <h3 className="text-white font-extrabold text-lg leading-tight">{displayTitle}</h3>
          {verseText && (
            <p className="text-white/55 text-sm mt-2 leading-relaxed italic line-clamp-2"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              &ldquo;{verseText}&rdquo;
            </p>
          )}
          <p className="text-white/30 text-xs mt-2">{ref} · RV1960</p>
        </div>

        <div className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-accent/30 group-hover:bg-accent/10 transition-colors self-center"
          style={{ background: "rgba(191,30,46,0.08)" }}>
          Leer →
        </div>
      </button>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center p-3 sm:p-6"
          style={{ background: "rgba(0,0,0,0.88)" }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-border overflow-hidden"
            style={{ background: "#080E1E" }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 shrink-0"
              style={{ background: "#0A1220" }}>
              <div className="flex items-center gap-2.5">
                <BookMarked size={16} className="text-accent" />
                <span className="text-white font-bold text-sm">Santa Biblia</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/biblia?libro=${libro}&capitulo=${capitulo}${versiculo ? `&versiculo=${versiculo}` : ""}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/20 transition-all"
                  onClick={() => setOpen(false)}
                >
                  <ExternalLink size={12} /> Abrir página
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Scrollable reader */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-5">
              <BibleReader
                initialLibro={libro}
                initialCapitulo={capitulo}
                highlightVersiculo={versiculo}
                inModal
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
