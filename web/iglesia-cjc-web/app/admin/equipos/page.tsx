"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Check, X } from "lucide-react";

const supabase = createBrowserClient(
  "https://fvffsnenebscigtywgwn.supabase.co",
  "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN"
);

type Solicitud = { id: string; usuario_id: string; equipo_nombre: string; estado: string; created_at: string; usuario?: { nombre: string; foto_url: string } };

export default function AdminEquipos() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [equipos, setEquipos] = useState<{ id: string; nombre: string; descripcion: string; lider: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"solicitudes" | "equipos">("solicitudes");

  const load = async () => {
    setLoading(true);
    const [{ data: sols }, { data: eqs }] = await Promise.all([
      supabase.from("gps_registros").select("*, usuario:usuarios(nombre, foto_url)").order("created_at", { ascending: false }),
      supabase.from("equipos").select("*").order("nombre"),
    ]);
    setSolicitudes(sols ?? []);
    setEquipos(eqs ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateEstado = async (id: string, estado: string) => {
    await supabase.from("gps_registros").update({ estado }).eq("id", id);
    load();
  };

  const pendientes = solicitudes.filter(s => s.estado === "pendiente");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">GPS Equipos</h1>
          <p className="text-white/40 text-sm mt-1">{pendientes.length} solicitudes pendientes</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {(["solicitudes", "equipos"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? "bg-accent text-white" : "bg-white/5 text-white/50 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <p className="text-white/30 text-sm">Cargando...</p> : tab === "solicitudes" ? (
        <div className="space-y-3">
          {solicitudes.map(s => (
            <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border" style={{ background: "#0D1628" }}>
              {s.usuario?.foto_url
                ? <img src={s.usuario.foto_url} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
                : <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-white shrink-0">{s.usuario?.nombre?.[0] ?? "?"}</div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{s.usuario?.nombre ?? s.usuario_id}</p>
                <p className="text-white/40 text-xs">Equipo: {s.equipo_nombre}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                s.estado === "aprobada" ? "bg-green-500/15 text-green-400" :
                s.estado === "rechazada" ? "bg-red-500/15 text-red-400" :
                "bg-amber-500/15 text-amber-400"
              }`}>{s.estado}</span>
              {s.estado === "pendiente" && (
                <div className="flex gap-2">
                  <button onClick={() => updateEstado(s.id, "aprobada")} className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400"><Check size={14} /></button>
                  <button onClick={() => updateEstado(s.id, "rechazada")} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"><X size={14} /></button>
                </div>
              )}
            </div>
          ))}
          {solicitudes.length === 0 && <p className="text-white/30 text-sm text-center py-8">No hay solicitudes</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {equipos.map(e => (
            <div key={e.id} className="p-4 rounded-2xl border border-border" style={{ background: "#0D1628" }}>
              <p className="text-white font-semibold">{e.nombre}</p>
              {e.lider && <p className="text-accent text-xs mt-0.5">Líder: {e.lider}</p>}
              {e.descripcion && <p className="text-white/40 text-sm mt-1">{e.descripcion}</p>}
            </div>
          ))}
          {equipos.length === 0 && <p className="text-white/30 text-sm text-center py-8">No hay equipos</p>}
        </div>
      )}
    </div>
  );
}
