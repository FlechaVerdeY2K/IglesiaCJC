"use client";
import { useState } from "react";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import type { Evento } from "@/lib/supabase";

function splitEventos(eventos: Evento[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const proximos: Evento[] = [];
  const pasados: Evento[] = [];

  for (const e of eventos) {
    const [y, m, d] = e.fecha.split("T")[0].split("-").map(Number);
    const dt = new Date(y, m - 1, d);

    if (e.hora) {
      const [h, min] = e.hora.split(":").map(Number);
      dt.setHours(h, min, 0, 0);
    } else {
      dt.setHours(23, 59, 0, 0);
    }

    if (dt < new Date()) {
      pasados.push(e);
    } else {
      proximos.push(e);
    }
  }

  return { proximos, pasados: pasados.reverse() }; // pasados most recent first
}

function EventoCard({ e, past }: { e: Evento; past?: boolean }) {
  const [y, m, d] = e.fecha.split("T")[0].split("-").map(Number);
  const fecha = new Date(y, m - 1, d);

  return (
    <div className={`card flex gap-5 transition-colors ${past ? "opacity-55" : "hover:border-accent"}`}>
      {/* Date badge */}
      <div className={`rounded-xl p-4 text-center min-w-[72px] flex flex-col items-center justify-center shrink-0 border ${past ? "border-white/8 bg-white/3" : "border-accent/20 bg-accent/10"}`}>
        <p className={`font-extrabold text-2xl leading-none ${past ? "text-white/40" : "text-accent"}`}>
          {fecha.getDate()}
        </p>
        <p className={`text-xs uppercase font-semibold mt-1 ${past ? "text-white/30" : "text-accent"}`}>
          {fecha.toLocaleString("es", { timeZone: "America/Costa_Rica", month: "short" })}
        </p>
        <p className="text-white/20 text-xs">{fecha.getFullYear()}</p>
      </div>

      <div className="flex-1 min-w-0">
        {e.image_url && (
          <Image src={e.image_url} alt={e.titulo} className={`w-full h-32 object-cover rounded-lg mb-3 ${past ? "grayscale opacity-60" : ""}`} width={800} height={128} />
        )}
        <div className="flex items-start justify-between gap-3">
          <h3 className={`font-bold text-lg mb-2 ${past ? "text-white/50" : "text-white"}`}>{e.titulo}</h3>
          {past && (
            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.09)" }}>
              Concluido
            </span>
          )}
        </div>
        {e.lugar && (
          <p className="text-muted text-sm flex items-center gap-2 mb-2">
            <MapPin size={14} className={past ? "text-white/20" : "text-accent"} /> {e.lugar}
          </p>
        )}
        <p className="text-muted text-sm flex items-center gap-2 mb-3">
          <Calendar size={14} className={past ? "text-white/20" : "text-accent"} />
          {fecha.toLocaleDateString("es", { timeZone: "America/Costa_Rica", weekday: "long", day: "numeric", month: "long" })}
          {e.hora && ` · ${e.hora}`}
        </p>
        {e.descripcion && (
          <p className="text-muted text-sm leading-relaxed line-clamp-3">{e.descripcion}</p>
        )}
      </div>
    </div>
  );
}

export default function EventosTabs({ eventos }: { eventos: Evento[] }) {
  const { proximos, pasados } = splitEventos(eventos);
  const [tab, setTab] = useState<"proximos" | "pasados">("proximos");

  const tabs = [
    { id: "proximos" as const, label: "Próximos", count: proximos.length },
    { id: "pasados" as const, label: "Pasados", count: pasados.length },
  ];

  const list = tab === "proximos" ? proximos : pasados;

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-10 p-1 rounded-xl border border-border w-fit" style={{ background: "#080E1E" }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-accent text-white"
                : "text-white/40 hover:text-white"
            }`}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              tab === t.id ? "bg-white/20 text-white" : "bg-white/8 text-white/30"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {list.length === 0 ? (
        <p className="text-muted text-center py-20">
          {tab === "proximos" ? "No hay eventos próximos." : "No hay eventos pasados."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map(e => (
            <EventoCard key={e.id} e={e} past={tab === "pasados"} />
          ))}
        </div>
      )}
    </>
  );
}
