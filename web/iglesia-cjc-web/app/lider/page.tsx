"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";

import { Users, HandHeart, CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";
import { todayCR, hourCR } from "@/lib/date";


export default function LiderDashboard() {
  const [nombre, setNombre] = useState("");
  const [stats, setStats] = useState({ equipo: 0, oraciones: 0, eventos: 0 });
  const [oraciones, setOraciones] = useState<{ id: string; titulo: string; created_at: string }[]>([]);
  const [eventos, setEventos] = useState<{ id: string; titulo: string; fecha: string; hora?: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const user = session.user;
      const { data: u } = await supabase.from("usuarios").select("nombre").eq("id", user.id).single();
      setNombre(u?.nombre ?? user.user_metadata?.full_name ?? "");

      const [liderIdRes, lideresRes, oracionesRes, eventosRes] = await Promise.all([
        supabase.from("equipos").select("id").eq("lider_id", user.id),
        supabase.from("equipos").select("id").contains("lideres", [{ id: user.id }]),
        supabase.from("oraciones").select("id, titulo, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("eventos").select("id, titulo, fecha, hora").eq("activo", true).gte("fecha", todayCR()).order("fecha", { ascending: true }).limit(4),
      ]);

      const equipoIds = Array.from(new Set([
        ...((liderIdRes.data ?? []) as Array<{ id: string }>).map((r) => r.id),
        ...((lideresRes.data ?? []) as Array<{ id: string }>).map((r) => r.id),
      ]));

      let memberCount = 0;
      if (equipoIds.length > 0) {
        const { count } = await supabase.from("equipo_solicitudes")
          .select("id", { count: "exact", head: true })
          .in("equipo_id", equipoIds)
          .eq("estado", "aprobado");
        memberCount = count ?? 0;
      }

      setStats({
        equipo: memberCount,
        oraciones: (oracionesRes.data ?? []).length,
        eventos: (eventosRes.data ?? []).length,
      });
      setOraciones(oracionesRes.data ?? []);
      setEventos(eventosRes.data ?? []);
    })();
  }, []);

  const hour = hourCR();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-white/40 text-sm">{greeting}</p>
        <h1 className="text-3xl font-black text-white mt-0.5">{nombre || "Líder"} 👋</h1>
        <p className="text-white/30 text-sm mt-1">Aquí tienes un resumen de tu comunidad</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Miembros", value: stats.equipo, icon: Users, href: "/lider/equipo", color: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.3)", text: "#60a5fa" },
          { label: "Oraciones", value: stats.oraciones, icon: HandHeart, href: "/oraciones", color: "rgba(191,30,46,0.12)", border: "rgba(191,30,46,0.3)", text: "#BF1E2E" },
          { label: "Eventos próximos", value: stats.eventos, icon: CalendarDays, href: "/lider/eventos", color: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", text: "#34d399" },
        ].map(s => (
          <Link key={s.label} href={s.href}
            className="group flex items-center gap-4 p-5 rounded-2xl border border-border hover:border-white/20 transition-all"
            style={{ background: "#0D1628" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: s.color, border: `1px solid ${s.border}` }}>
              <s.icon size={20} style={{ color: s.text }} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-white/20 group-hover:text-white/50 transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Oraciones recientes */}
        <div className="rounded-2xl border border-border p-5" style={{ background: "#0D1628" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <HandHeart size={16} className="text-accent" /> Oraciones recientes
            </h2>
            <Link href="/oraciones" className="text-xs text-white/30 hover:text-white transition-colors">Ver todas →</Link>
          </div>
          <div className="space-y-2">
            {oraciones.length === 0 && <p className="text-white/25 text-sm py-4 text-center">Sin solicitudes</p>}
            {oraciones.map(o => (
              <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                style={{ background: "#080E1E" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <p className="text-white/70 text-sm truncate flex-1">{o.titulo}</p>
                <p className="text-white/20 text-xs shrink-0">
                  {new Date(o.created_at).toLocaleDateString("es", { timeZone: "America/Costa_Rica", day: "numeric", month: "short" })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Próximos eventos */}
        <div className="rounded-2xl border border-border p-5" style={{ background: "#0D1628" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <CalendarDays size={16} className="text-emerald-400" /> Próximos eventos
            </h2>
            <Link href="/lider/eventos" className="text-xs text-white/30 hover:text-white transition-colors">Ver todos →</Link>
          </div>
          <div className="space-y-2">
            {eventos.length === 0 && <p className="text-white/25 text-sm py-4 text-center">Sin eventos próximos</p>}
            {eventos.map(ev => {
              const [y, m, d] = ev.fecha.split("T")[0].split("-").map(Number);
              const fecha = new Date(y, m - 1, d);
              return (
                <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5"
                  style={{ background: "#080E1E" }}>
                  <div className="text-center min-w-10">
                    <p className="text-emerald-400 font-black text-lg leading-none">{fecha.getDate()}</p>
                    <p className="text-emerald-400/60 text-[10px] uppercase">{fecha.toLocaleString("es", { month: "short" })}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/70 text-sm truncate">{ev.titulo}</p>
                    {ev.hora && <p className="text-white/30 text-xs">{ev.hora}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
