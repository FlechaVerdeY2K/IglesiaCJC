"use client";
import { useState, useEffect } from "react";
import { MapPin, X, Calendar } from "lucide-react";
import type { Evento } from "@/lib/supabase";

export default function EventosGrid({ eventos }: { eventos: Evento[] }) {
  const [selected, setSelected] = useState<Evento | null>(null);
  const [closing, setClosing] = useState(false);

  const closeModal = () => {
    setClosing(true);
    setTimeout(() => { setSelected(null); setClosing(false); }, 300);
  };

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {eventos.map((e) => {
          const fecha = new Date(e.fecha);
          return (
            <div
              key={e.id}
              onClick={() => setSelected(e)}
              className="group relative rounded-2xl border border-white/5 p-5 hover:border-accent/30 transition-all duration-300 overflow-hidden cursor-pointer"
              style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: "radial-gradient(ellipse at top left, rgba(191,30,46,0.08) 0%, transparent 60%)" }} />
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-xl text-center min-w-12 py-1.5 px-2 border border-accent/20" style={{ backgroundColor: "rgba(191,30,46,0.08)" }}>
                  <p className="text-accent font-black text-xl leading-none">{fecha.getDate()}</p>
                  <p className="text-accent/70 text-[10px] uppercase tracking-wider mt-0.5">{fecha.toLocaleString("es", { month: "short" })}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm leading-tight">{e.titulo}</h3>
                  {e.lugar && <p className="text-white/35 text-xs flex items-center gap-1 mt-1"><MapPin size={9} /> {e.lugar}</p>}
                </div>
              </div>
              <p className="text-white/35 text-xs line-clamp-2">{e.descripcion}</p>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(8,14,30,0.85)", backdropFilter: "blur(8px)", animation: closing ? "menu-slide-up 0.3s ease forwards" : "menu-slide-down 0.3s ease forwards" }}
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* línea accent top */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px" style={{ background: "linear-gradient(90deg, transparent, #BF1E2E, transparent)" }} />

            {/* imagen */}
            {selected.image_url && (
              <img src={selected.image_url} alt={selected.titulo} className="w-full h-72 object-cover" />
            )}

            <div className="p-8">
              {/* header */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl text-center min-w-12 py-2 px-2 border border-accent/20" style={{ backgroundColor: "rgba(191,30,46,0.08)" }}>
                    <p className="text-accent font-black text-2xl leading-none">{new Date(selected.fecha).getDate()}</p>
                    <p className="text-accent/70 text-[10px] uppercase tracking-wider mt-0.5">{new Date(selected.fecha).toLocaleString("es", { month: "short" })}</p>
                  </div>
                  <div>
                    <h2 className="text-white font-extrabold text-xl leading-tight">{selected.titulo}</h2>
                    <p className="text-white/40 text-xs mt-1">
                      {new Date(selected.fecha).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors shrink-0 mt-1">
                  <X size={20} />
                </button>
              </div>

              {/* lugar */}
              {selected.lugar && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg border border-white/5" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                  <MapPin size={14} className="text-accent shrink-0" />
                  <p className="text-white/70 text-sm">{selected.lugar}</p>
                </div>
              )}

              {/* descripción */}
              {selected.descripcion && (
                <p className="text-white/60 text-sm leading-relaxed">{selected.descripcion}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
