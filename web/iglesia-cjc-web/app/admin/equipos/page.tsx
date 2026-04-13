"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";

import { Check, X, Plus, Users, ChevronDown, ChevronUp, Trash2 } from "lucide-react";


type Equipo = { id: string; nombre: string; descripcion: string; lider: string; lider_id: string | null };
type Solicitud = {
  id: string; usuario_id: string; equipo_id: string | null; equipo_nombre: string;
  estado: string; created_at: string;
  usuario?: { nombre: string; foto_url: string | null };
};
type Usuario = { id: string; nombre: string; email: string; foto_url: string | null; rol: string };

export default function AdminEquipos() {
  const [tab, setTab] = useState<"solicitudes" | "equipos">("solicitudes");
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEquipo, setExpandedEquipo] = useState<string | null>(null);
  const [miembros, setMiembros] = useState<Record<string, Usuario[]>>({});

  // New equipo form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "", lider_id: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: sols }, { data: eqs }, { data: usrs }] = await Promise.all([
      supabase.from("gps_registros")
        .select("*, usuario:usuarios(nombre, foto_url)")
        .order("created_at", { ascending: false }),
      supabase.from("equipos").select("*").order("nombre"),
      supabase.from("usuarios").select("id, nombre, email, foto_url, rol").order("nombre"),
    ]);
    setSolicitudes(sols ?? []);
    setEquipos(eqs ?? []);
    setUsuarios(usrs ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateEstado = async (id: string, estado: string, solicitud: Solicitud) => {
    await supabase.from("gps_registros").update({ estado }).eq("id", id);
    // If approving, ensure user has miembro role
    if (estado === "aprobada") {
      await supabase.from("usuarios").update({ rol: "miembro" }).eq("id", solicitud.usuario_id).eq("rol", null as unknown as string);
    }
    load();
  };

  const loadMiembros = async (equipoId: string) => {
    if (miembros[equipoId]) return;
    const { data } = await supabase
      .from("gps_registros")
      .select("usuario:usuarios(id, nombre, foto_url, email)")
      .eq("equipo_id", equipoId)
      .eq("estado", "aprobada");
    const list = (data ?? []).map((r: any) => r.usuario).filter(Boolean);
    setMiembros(prev => ({ ...prev, [equipoId]: list }));
  };

  const toggleEquipo = (id: string) => {
    if (expandedEquipo === id) {
      setExpandedEquipo(null);
    } else {
      setExpandedEquipo(id);
      loadMiembros(id);
    }
  };

  const createEquipo = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    const liderUser = usuarios.find(u => u.id === form.lider_id);
    await supabase.from("equipos").insert({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      lider_id: form.lider_id || null,
      lider: liderUser?.nombre ?? "",
    });
    setForm({ nombre: "", descripcion: "", lider_id: "" });
    setShowForm(false);
    setSaving(false);
    load();
  };

  const deleteEquipo = async (id: string) => {
    if (!confirm("¿Eliminar este equipo?")) return;
    await supabase.from("gps_registros").update({ equipo_id: null }).eq("equipo_id", id);
    await supabase.from("equipos").delete().eq("id", id);
    load();
  };

  const pendientes = solicitudes.filter(s => s.estado === "pendiente");
  const lideresOpciones = usuarios.filter(u => ["lider", "admin"].includes(u.rol));

  const getEquipoNombre = (s: Solicitud) => {
    if (s.equipo_id) return equipos.find(e => e.id === s.equipo_id)?.nombre ?? s.equipo_nombre;
    return s.equipo_nombre;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">GPS Equipos</h1>
          <p className="text-white/40 text-sm mt-1">{pendientes.length} solicitudes pendientes</p>
        </div>
        {tab === "equipos" && (
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "rgba(191,30,46,0.15)", color: "#BF1E2E", border: "1px solid rgba(191,30,46,0.3)" }}>
            <Plus size={15} /> Nuevo equipo
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 p-1 rounded-xl border border-border w-fit" style={{ background: "#080E1E" }}>
        {(["solicitudes", "equipos"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-1.5 ${tab === t ? "bg-accent text-white" : "text-white/40 hover:text-white"}`}>
            {t === "solicitudes" ? "Solicitudes" : "Equipos"}
            {t === "solicitudes" && pendientes.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t ? "bg-white/20" : "bg-amber-500/20 text-amber-400"}`}>
                {pendientes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <p className="text-white/30 text-sm py-8">Cargando...</p> : tab === "solicitudes" ? (

        /* ── SOLICITUDES ── */
        <div className="space-y-3">
          {solicitudes.length === 0 && (
            <p className="text-white/30 text-sm text-center py-12">No hay solicitudes</p>
          )}
          {solicitudes.map(s => (
            <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border" style={{ background: "#0D1628" }}>
              {s.usuario?.foto_url
                ? <img src={s.usuario.foto_url} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
                : <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-white shrink-0">{s.usuario?.nombre?.[0] ?? "?"}</div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{s.usuario?.nombre ?? s.usuario_id}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  Solicita unirse a <span className="text-accent font-semibold">{getEquipoNombre(s)}</span>
                </p>
                <p className="text-white/20 text-xs mt-0.5">
                  {new Date(s.created_at).toLocaleDateString("es", { timeZone: "America/Costa_Rica", day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <span className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                s.estado === "aprobada"  ? "bg-green-500/15 text-green-400 border border-green-500/20" :
                s.estado === "rechazada" ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                "bg-amber-500/15 text-amber-400 border border-amber-500/20"
              }`}>{s.estado}</span>
              {s.estado === "pendiente" && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => updateEstado(s.id, "aprobada", s)}
                    className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors">
                    <Check size={15} />
                  </button>
                  <button onClick={() => updateEstado(s.id, "rechazada", s)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

      ) : (

        /* ── EQUIPOS ── */
        <div className="space-y-4">

          {/* Create form */}
          {showForm && (
            <div className="p-5 rounded-2xl border border-accent/20 space-y-4" style={{ background: "#0D1628" }}>
              <h3 className="text-white font-bold">Nuevo Equipo GPS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Nombre *</label>
                  <input className="input w-full" placeholder="Ej: Piedras Vivas"
                    value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Líder</label>
                  <select className="input w-full" value={form.lider_id}
                    onChange={e => setForm(f => ({ ...f, lider_id: e.target.value }))}>
                    <option value="">— Sin asignar —</option>
                    {lideresOpciones.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Descripción</label>
                <textarea className="input w-full resize-none" rows={2} placeholder="Descripción del equipo..."
                  value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button onClick={createEquipo} disabled={saving || !form.nombre.trim()}
                  className="btn-primary px-5 py-2 text-sm disabled:opacity-50">
                  {saving ? "Guardando..." : "Crear equipo"}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary px-5 py-2 text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {equipos.length === 0 && !showForm && (
            <p className="text-white/30 text-sm text-center py-12">No hay equipos. Crea el primero.</p>
          )}

          {equipos.map(e => {
            const equipoSols = solicitudes.filter(s =>
              (s.equipo_id === e.id) || (!s.equipo_id && s.equipo_nombre === e.nombre)
            );
            const pendientesEquipo = equipoSols.filter(s => s.estado === "pendiente");
            const miembrosEquipo = miembros[e.id];
            const isExpanded = expandedEquipo === e.id;
            const liderUser = usuarios.find(u => u.id === e.lider_id);

            return (
              <div key={e.id} className="rounded-2xl border border-border overflow-hidden" style={{ background: "#0D1628" }}>
                {/* Header */}
                <div className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(191,30,46,0.1)", border: "1px solid rgba(191,30,46,0.2)" }}>
                    <Users size={18} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold">{e.nombre}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      Líder: <span className="text-accent">{liderUser?.nombre ?? e.lider ?? "Sin asignar"}</span>
                    </p>
                  </div>
                  {pendientesEquipo.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">
                      {pendientesEquipo.length} pendiente{pendientesEquipo.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  <button onClick={() => toggleEquipo(e.id)}
                    className="p-2 text-white/30 hover:text-white transition-colors">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button onClick={() => deleteEquipo(e.id)}
                    className="p-2 text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Expanded: members + requests */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-4 space-y-4">
                    {e.descripcion && <p className="text-white/40 text-sm">{e.descripcion}</p>}

                    {/* Pending requests */}
                    {pendientesEquipo.length > 0 && (
                      <div>
                        <p className="text-white/30 text-[10px] uppercase tracking-wider font-bold mb-2">Solicitudes pendientes</p>
                        <div className="space-y-2">
                          {pendientesEquipo.map(s => (
                            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-amber-500/15"
                              style={{ background: "rgba(245,158,11,0.05)" }}>
                              {s.usuario?.foto_url
                                ? <img src={s.usuario.foto_url} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" />
                                : <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-white shrink-0">{s.usuario?.nombre?.[0] ?? "?"}</div>
                              }
                              <p className="text-white/70 text-sm flex-1">{s.usuario?.nombre ?? s.usuario_id}</p>
                              <div className="flex gap-1.5">
                                <button onClick={() => updateEstado(s.id, "aprobada", s)}
                                  className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors">
                                  <Check size={13} />
                                </button>
                                <button onClick={() => updateEstado(s.id, "rechazada", s)}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                                  <X size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Members */}
                    <div>
                      <p className="text-white/30 text-[10px] uppercase tracking-wider font-bold mb-2">
                        Miembros {miembrosEquipo ? `(${miembrosEquipo.length})` : ""}
                      </p>
                      {!miembrosEquipo ? (
                        <p className="text-white/20 text-sm">Cargando...</p>
                      ) : miembrosEquipo.length === 0 ? (
                        <p className="text-white/20 text-sm">Aún no hay miembros aprobados</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {miembrosEquipo.map((m: any) => (
                            <div key={m.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/5"
                              style={{ background: "#080E1E" }}>
                              {m.foto_url
                                ? <img src={m.foto_url} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" />
                                : <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-white shrink-0">{m.nombre?.[0] ?? "?"}</div>
                              }
                              <div className="min-w-0">
                                <p className="text-white/80 text-xs font-medium truncate">{m.nombre}</p>
                                <p className="text-white/30 text-[10px] truncate">{m.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
