"use client";
import { useState, useEffect } from "react";
import { MapPin, X } from "lucide-react";
import type { Evento } from "@/lib/supabase";

const GRACE_HOURS = 3; // hours after event start before it disappears

function getEventStatus(e: Evento): "upcoming" | "concluded" | "expired" {
  const [y, m, d] = e.fecha.split("T")[0].split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (e.hora) {
    const [h, min] = e.hora.split(":").map(Number);
    dt.setHours(h, min, 0, 0);
  } else {
    dt.setHours(23, 59, 0, 0); // no hour = treat as end of day
  }
  const diffHours = (Date.now() - dt.getTime()) / 3_600_000;
  if (diffHours > GRACE_HOURS) return "expired";
  if (diffHours > 0) return "concluded";
  return "upcoming";
}

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
          const status = getEventStatus(e);
          if (status === "expired") return null;

          const [y, m, d] = e.fecha.split("T")[0].split("-").map(Number);
          const fecha = new Date(y, m - 1, d);
          const concluded = status === "concluded";

          return (
            <div
              key={e.id}
              onClick={() => setSelected(e)}
              className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${concluded ? "border-white/5 opacity-60" : "border-white/5 hover:border-accent/30"}`}
              style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}
            >
              {!concluded && <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: "radial-gradient(ellipse at top left, rgba(191,30,46,0.08) 0%, transparent 60%)" }} />}

              {/* Concluded badge */}
              {concluded && (
                <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Concluido
                </div>
              )}

              {/* Thumbnail image */}
              {e.image_url ? (
                <div className="relative h-32 overflow-hidden">
                  <img src={e.image_url} alt={e.titulo} className={`w-full h-full object-cover transition-transform duration-500 ${concluded ? "" : "group-hover:scale-105"}`} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(8,14,30,0.85) 100%)" }} />
                </div>
              ) : (
                <div className="h-2" />
              )}

              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`rounded-xl text-center min-w-12 py-1.5 px-2 border shrink-0 ${concluded ? "border-white/10" : "border-accent/20"}`}
                    style={{ backgroundColor: concluded ? "rgba(255,255,255,0.04)" : "rgba(191,30,46,0.08)" }}>
                    <p className={`font-black text-xl leading-none ${concluded ? "text-white/30" : "text-accent"}`}>{fecha.getDate()}</p>
                    <p className={`text-[10px] uppercase tracking-wider mt-0.5 ${concluded ? "text-white/20" : "text-accent/70"}`}>{fecha.toLocaleString("es", { timeZone: "America/Costa_Rica", month: "short" })}</p>
                  </div>
                  <div>
                    <h3 className={`font-semibold text-sm leading-tight ${concluded ? "text-white/50" : "text-white"}`}>{e.titulo}</h3>
                    {e.hora && <p className={`text-xs mt-0.5 ${concluded ? "text-white/25" : "text-accent/60"}`}>{e.hora}</p>}
                    {e.lugar && <p className="text-white/25 text-xs flex items-center gap-1 mt-1"><MapPin size={9} /> {e.lugar}</p>}
                  </div>
                </div>
                <p className="text-white/30 text-xs line-clamp-2">{e.descripcion}</p>
              </div>
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
                    {(() => { const [sy, sm, sd] = selected.fecha.split("T")[0].split("-").map(Number); const sf = new Date(sy, sm-1, sd); return (<><p className="text-accent font-black text-2xl leading-none">{sf.getDate()}</p><p className="text-accent/70 text-[10px] uppercase tracking-wider mt-0.5">{sf.toLocaleString("es", { month: "short" })}</p></>); })()}
                  </div>
                  <div>
                    <h2 className="text-white font-extrabold text-xl leading-tight">{selected.titulo}</h2>
                    <p className="text-white/40 text-xs mt-1">
                      {(() => { const [sy, sm, sd] = selected.fecha.split("T")[0].split("-").map(Number); return new Date(sy, sm-1, sd).toLocaleDateString("es", { timeZone: "America/Costa_Rica", weekday: "long", day: "numeric", month: "long", year: "numeric" }); })()}
                      {selected.hora && ` · ${selected.hora}`}
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
