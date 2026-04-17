"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";

import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { todayCR, hourCR } from "@/lib/date";


export default function CocinaDashboard() {
  const [nombre, setNombre] = useState("");
  const [eventos, setEventos] = useState<{ id: string; titulo: string; fecha: string; hora?: string; lugar?: string; descripcion?: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const user = session.user;
      const { data: u } = await supabase.from("usuarios").select("nombre").eq("id", user.id).single();
      setNombre(u?.nombre ?? user.user_metadata?.full_name ?? "");

      const today = todayCR();
      const { data } = await supabase
        .from("eventos")
        .select("id, titulo, fecha, hora, lugar, descripcion")
        .eq("activo", true)
        .gte("fecha", today)
        .order("fecha", { ascending: true })
        .limit(10);
      setEventos(data ?? []);
    })();
  }, []);

  const hour = hourCR();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <p className="text-white/40 text-sm">{greeting}</p>
        <h1 className="text-3xl font-black text-white mt-0.5">{nombre || "Cocina"} 👋</h1>
        <p className="text-white/30 text-sm mt-1">Eventos próximos para preparar</p>
      </div>

      {/* Eventos card */}
      <div className="rounded-2xl border border-border p-5" style={{ background: "#0D1628" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white flex items-center gap-2">
            <CalendarDays size={16} className="text-orange-400" /> Próximos eventos
          </h2>
          <Link href="/cocina/eventos" className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors">
            Ver todos <ChevronRight size={13} />
          </Link>
        </div>

        {eventos.length === 0 ? (
          <p className="text-white/25 text-sm text-center py-10">No hay eventos próximos</p>
        ) : (
          <div className="space-y-3">
            {eventos.map(ev => {
              const [y, m, d] = ev.fecha.split("T")[0].split("-").map(Number);
              const fecha = new Date(y, m - 1, d);
              const isToday = fecha.toDateString() === new Date().toDateString();
              return (
                <div key={ev.id}
                  className={`flex gap-4 p-4 rounded-xl border transition-colors ${isToday ? "border-orange-500/30" : "border-white/5"}`}
                  style={{ background: isToday ? "rgba(251,146,60,0.06)" : "#080E1E" }}>
                  <div className="text-center min-w-12 shrink-0">
                    <p className={`font-black text-2xl leading-none ${isToday ? "text-orange-400" : "text-white/50"}`}>
                      {fecha.getDate()}
                    </p>
                    <p className={`text-[10px] uppercase mt-0.5 ${isToday ? "text-orange-400/70" : "text-white/25"}`}>
                      {fecha.toLocaleString("es", { month: "short" })}
                    </p>
                    {isToday && <p className="text-[9px] text-orange-400 font-bold mt-0.5">HOY</p>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{ev.titulo}</p>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {ev.hora && <p className="text-white/40 text-xs">{ev.hora}</p>}
                      {ev.lugar && (
                        <p className="text-white/30 text-xs flex items-center gap-1">
                          <MapPin size={9} /> {ev.lugar}
                        </p>
                      )}
                    </div>
                    {ev.descripcion && (
                      <p className="text-white/30 text-xs mt-1.5 line-clamp-2">{ev.descripcion}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
