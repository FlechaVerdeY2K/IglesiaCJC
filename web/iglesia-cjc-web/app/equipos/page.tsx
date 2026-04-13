"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";

import { Users, Check, Loader } from "lucide-react";
import Link from "next/link";


type Equipo = { id: string; nombre: string; descripcion: string; lider: string; lider_id: string | null };

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [misEquipos, setMisEquipos] = useState<Record<string, string>>({}); // equipo_id → estado
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: eqs }, { data: { user } }] = await Promise.all([
        supabase.from("equipos").select("*").order("nombre"),
        supabase.auth.getUser(),
      ]);
      setEquipos(eqs ?? []);
      setUserId(user?.id ?? null);

      if (user?.id) {
        const { data: regs } = await supabase
          .from("gps_registros")
          .select("equipo_id, estado")
          .eq("usuario_id", user.id);
        const map: Record<string, string> = {};
        (regs ?? []).forEach((r: any) => { if (r.equipo_id) map[r.equipo_id] = r.estado; });
        setMisEquipos(map);
      }
    })();
  }, []);

  const solicitar = async (equipo: Equipo) => {
    if (!userId) return;
    setJoining(equipo.id);
    await supabase.from("gps_registros").insert({
      usuario_id: userId,
      equipo_id: equipo.id,
      equipo_nombre: equipo.nombre,
      estado: "pendiente",
    });
    setMisEquipos(prev => ({ ...prev, [equipo.id]: "pendiente" }));
    setJoining(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Comunidad</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">Grupos de Proceso Semanal</h1>
      <p className="text-muted mb-10 max-w-2xl">
        Los GPS son pequeños grupos donde la fe se vive en comunidad real. Reúnete con otros, ora, estudia la Palabra y crece juntos.
      </p>

      {/* CTA iniciar GPS */}
      <div className="card border-blue-800/40 bg-blue-950/20 mb-12 max-w-xl">
        <Users className="text-blue-400 mb-3" size={32} />
        <h3 className="font-bold text-white text-xl mb-1">¿Querés iniciar tu propio GPS?</h3>
        <p className="text-muted text-sm mb-4">Abrí tu propio grupo en tu casa o zona.</p>
        <Link href="/contacto" className="btn-secondary text-sm inline-block">Hablar con un pastor</Link>
      </div>

      {/* Equipos */}
      {equipos.length === 0 ? (
        <p className="text-muted text-center py-16">No hay equipos registrados aún.</p>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-white mb-6">Equipos disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {equipos.map(e => {
              const estado = misEquipos[e.id];
              return (
                <div key={e.id} className="card hover:border-accent/40 transition-all flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="bg-accent/10 rounded-xl w-11 h-11 flex items-center justify-center shrink-0">
                      <Users className="text-accent" size={20} />
                    </div>
                    {estado && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                        estado === "aprobada"  ? "bg-green-500/15 text-green-400 border border-green-500/20" :
                        estado === "rechazada" ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                        "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                      }`}>
                        {estado === "aprobada" ? "Miembro" : estado === "rechazada" ? "Rechazada" : "Pendiente"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{e.nombre}</h3>
                    {e.lider && <p className="text-accent text-xs font-semibold mt-0.5">Líder: {e.lider}</p>}
                    {e.descripcion && <p className="text-muted text-sm mt-2 leading-relaxed">{e.descripcion}</p>}
                  </div>
                  <div className="pt-1">
                    {!userId ? (
                      <Link href="/login" className="btn-secondary text-sm w-full text-center block">
                        Inicia sesión para unirte
                      </Link>
                    ) : estado === "aprobada" ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                        <Check size={16} /> Ya eres miembro
                      </div>
                    ) : estado === "pendiente" ? (
                      <p className="text-amber-400/70 text-sm">Solicitud enviada · esperando aprobación</p>
                    ) : estado === "rechazada" ? (
                      <button onClick={() => solicitar(e)} disabled={joining === e.id}
                        className="btn-secondary text-sm w-full flex items-center justify-center gap-2">
                        {joining === e.id ? <Loader size={13} className="animate-spin" /> : null}
                        Volver a solicitar
                      </button>
                    ) : (
                      <button onClick={() => solicitar(e)} disabled={joining === e.id}
                        className="btn-primary text-sm w-full flex items-center justify-center gap-2">
                        {joining === e.id ? <Loader size={13} className="animate-spin" /> : null}
                        Solicitar unirme
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
