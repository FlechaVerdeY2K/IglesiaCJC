"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Check, X } from "lucide-react";

const supabase = createBrowserClient(
  "https://fvffsnenebscigtywgwn.supabase.co",
  "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN"
);

type Oracion = { id: string; contenido: string; anonimo: boolean; estado: string; created_at: string; usuario_id: string; orantes: number };

export default function AdminOraciones() {
  const [items, setItems] = useState<Oracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pendiente");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("oraciones").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateEstado = async (id: string, estado: string) => {
    await supabase.from("oraciones").update({ estado }).eq("id", id);
    load();
  };

  const filtered = items.filter(o => filter === "todas" ? true : o.estado === filter);

  const TABS = ["pendiente", "aprobada", "rechazada", "todas"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-black text-white">Oraciones</h1><p className="text-white/40 text-sm mt-1">{items.filter(o => o.estado === "pendiente").length} pendientes</p></div>
      </div>

      <div className="flex gap-2 mb-5">
        {TABS.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === t ? "bg-accent text-white" : "bg-white/5 text-white/50 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-white/30 text-sm">Cargando...</p> : filtered.map(o => (
          <div key={o.id} className="p-4 rounded-2xl border border-border" style={{ background: "#0D1628" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {o.anonimo && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">Anónimo</span>}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    o.estado === "aprobada" ? "bg-green-500/15 text-green-400" :
                    o.estado === "rechazada" ? "bg-red-500/15 text-red-400" :
                    "bg-amber-500/15 text-amber-400"
                  }`}>{o.estado}</span>
                  <span className="text-white/30 text-xs ml-auto">{o.orantes ?? 0} orantes</span>
                </div>
                <p className="text-white/80 text-sm">{o.contenido}</p>
              </div>
              {o.estado === "pendiente" && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => updateEstado(o.id, "aprobada")}
                    className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400"><Check size={14} /></button>
                  <button onClick={() => updateEstado(o.id, "rechazada")}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"><X size={14} /></button>
                </div>
              )}
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No hay oraciones {filter !== "todas" ? filter + "s" : ""}</p>
        )}
      </div>
    </div>
  );
}
