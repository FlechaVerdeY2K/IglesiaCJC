"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";

import { Check, X, Users } from "lucide-react";


type Solicitud = {
  id: string; usuario_id: string; estado: string; created_at: string;
  usuario?: { nombre: string; foto_url: string | null; email: string };
};
type Miembro = { id: string; nombre: string; foto_url: string | null; email: string };

export default function LiderEquipoPage() {
  const [equipo, setEquipo] = useState<{ id: string; nombre: string; descripcion: string } | null>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [loading, setLoading] = useState(true);
  const [noEquipo, setNoEquipo] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Find the equipo where this user is the leader
    const { data: eq } = await supabase
      .from("equipos")
      .select("id, nombre, descripcion")
      .eq("lider_id", user.id)
      .single();

    if (!eq) { setNoEquipo(true); setLoading(false); return; }
    setEquipo(eq);

    // Load requests and members
    const [{ data: sols }, { data: membs }] = await Promise.all([
      supabase.from("gps_registros")
        .select("*, usuario:usuarios(nombre, foto_url, email)")
        .eq("equipo_id", eq.id)
        .order("created_at", { ascending: false }),
      supabase.from("gps_registros")
        .select("usuario:usuarios(id, nombre, foto_url, email)")
        .eq("equipo_id", eq.id)
        .eq("estado", "aprobada"),
    ]);

    setSolicitudes(sols ?? []);
    setMiembros((membs ?? []).map((r: any) => r.usuario).filter(Boolean));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateEstado = async (id: string, estado: string) => {
    await supabase.from("gps_registros").update({ estado }).eq("id", id);
    load();
  };

  const pendientes = solicitudes.filter(s => s.estado === "pendiente");

  if (loading) return <div className="text-white/30 text-sm py-8">Cargando...</div>;

  if (noEquipo) return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-black text-white mb-2">Mi Equipo</h1>
      <div className="p-6 rounded-2xl border border-border text-center" style={{ background: "#0D1628" }}>
        <Users size={32} className="text-white/20 mx-auto mb-3" />
        <p className="text-white/50 text-sm">No tienes un equipo GPS asignado todavía.</p>
        <p className="text-white/30 text-xs mt-1">Pide a un administrador que te asigne como líder de un equipo.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">{equipo?.nombre}</h1>
        {equipo?.descripcion && <p className="text-white/40 text-sm mt-1">{equipo.descripcion}</p>}
      </div>

      {/* Solicitudes pendientes */}
      {pendientes.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 overflow-hidden" style={{ background: "#0D1628" }}>
          <div className="px-5 py-3.5 border-b border-amber-500/10" style={{ background: "rgba(245,158,11,0.05)" }}>
            <p className="text-amber-400 font-bold text-sm">
              {pendientes.length} solicitud{pendientes.length !== 1 ? "es" : ""} pendiente{pendientes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="divide-y divide-white/5">
            {pendientes.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                {s.usuario?.foto_url
                  ? <img src={s.usuario.foto_url} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
                  : <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-white shrink-0">{s.usuario?.nombre?.[0] ?? "?"}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{s.usuario?.nombre ?? s.usuario_id}</p>
                  <p className="text-white/30 text-xs truncate">{s.usuario?.email}</p>
                </div>
                <p className="text-white/25 text-xs shrink-0">
                  {new Date(s.created_at).toLocaleDateString("es", { timeZone: "America/Costa_Rica", day: "numeric", month: "short" })}
                </p>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => updateEstado(s.id, "aprobada")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold transition-colors">
                    <Check size={13} /> Aceptar
                  </button>
                  <button onClick={() => updateEstado(s.id, "rechazada")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors">
                    <X size={13} /> Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Miembros */}
      <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "#0D1628" }}>
        <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
          <p className="text-white font-bold text-sm flex items-center gap-2">
            <Users size={15} className="text-blue-400" /> Miembros
          </p>
          <span className="text-white/30 text-xs">{miembros.length} personas</span>
        </div>
        {miembros.length === 0 ? (
          <p className="text-white/25 text-sm text-center py-10">Aún no hay miembros aprobados</p>
        ) : (
          <div className="divide-y divide-white/5">
            {miembros.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                {m.foto_url
                  ? <img src={m.foto_url} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                  : <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-white shrink-0">{m.nombre?.[0] ?? "?"}</div>
                }
                <div className="min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">{m.nombre}</p>
                  <p className="text-white/30 text-xs truncate">{m.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
