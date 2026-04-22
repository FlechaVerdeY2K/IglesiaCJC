"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useMemo, useState } from "react";
import { Plus, X, Trash2, FileText, ExternalLink, Pencil } from "lucide-react";

type Equipo = { id: string; nombre: string; tipo: string | null };
type Recurso = {
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
  tipo: string;
  fecha: string | null;
  equipo_id: string | null;
};

const TIPOS = ["pdf", "video", "audio", "link", "doc"];

const emptyForm = { titulo: "", descripcion: "", url: "", tipo: "pdf", equipo_id: "" };

export default function LiderRecursosPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [noEquipo, setNoEquipo] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState<string>("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setLoading(false); return; }
    const userId = session.user.id;

    const [liderIdRes, lideresRes] = await Promise.all([
      supabase.from("equipos").select("id, nombre, tipo").eq("lider_id", userId),
      supabase.from("equipos").select("id, nombre, tipo").contains("lideres", [{ id: userId }]),
    ]);

    const merged = new Map<string, Equipo>();
    for (const r of ((liderIdRes.data ?? []) as Equipo[])) merged.set(r.id, r);
    for (const r of ((lideresRes.data ?? []) as Equipo[])) if (!merged.has(r.id)) merged.set(r.id, r);
    const eqList = Array.from(merged.values());

    if (eqList.length === 0) { setNoEquipo(true); setLoading(false); return; }
    setEquipos(eqList);

    const { data: rec } = await supabase
      .from("recursos")
      .select("id, titulo, descripcion, url, tipo, fecha, equipo_id")
      .in("equipo_id", eqList.map((e) => e.id))
      .order("fecha", { ascending: false });

    setRecursos((rec ?? []) as Recurso[]);
    setNoEquipo(false);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    if (selectedEquipo === "all") return recursos;
    return recursos.filter((r) => r.equipo_id === selectedEquipo);
  }, [recursos, selectedEquipo]);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm, equipo_id: selectedEquipo !== "all" ? selectedEquipo : (equipos[0]?.id ?? "") });
    setShowForm(true);
  };

  const openEdit = (r: Recurso) => {
    setEditingId(r.id);
    setForm({
      titulo: r.titulo,
      descripcion: r.descripcion ?? "",
      url: r.url,
      tipo: r.tipo || "pdf",
      equipo_id: r.equipo_id ?? equipos[0]?.id ?? "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.titulo.trim() || !form.url.trim() || !form.equipo_id) return;
    setSaving(true);
    const payload = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      url: form.url.trim(),
      tipo: form.tipo,
      equipo_id: form.equipo_id,
      audiencia: "equipo",
    };
    if (editingId) {
      await supabase.from("recursos").update(payload).eq("id", editingId);
    } else {
      await supabase.from("recursos").insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este recurso?")) return;
    await supabase.from("recursos").delete().eq("id", id);
    void load();
  };

  if (loading) return <div className="text-white/30 text-sm py-8">Cargando...</div>;

  if (noEquipo) return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-black text-white mb-2">Recursos</h1>
      <div className="p-6 rounded-2xl border border-border text-center" style={{ background: "#0D1628" }}>
        <FileText size={32} className="text-white/20 mx-auto mb-3" />
        <p className="text-white/50 text-sm">No tienes un equipo asignado.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Recursos</h1>
          <p className="text-white/40 text-sm mt-1">Material exclusivo para los miembros de tus {equipos.length > 1 ? "equipos" : "equipo"}.</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm inline-flex items-center gap-2">
          <Plus size={15} /> Nuevo recurso
        </button>
      </div>

      {equipos.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedEquipo("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedEquipo === "all" ? "bg-accent/20 text-accent border border-accent/40" : "text-white/50 border border-white/10 hover:text-white"}`}
          >
            Todos
          </button>
          {equipos.map((eq) => (
            <button
              key={eq.id}
              onClick={() => setSelectedEquipo(eq.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedEquipo === eq.id ? "bg-accent/20 text-accent border border-accent/40" : "text-white/50 border border-white/10 hover:text-white"}`}
            >
              {eq.nombre}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="p-10 rounded-2xl border border-border text-center" style={{ background: "#0D1628" }}>
          <FileText size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-sm">Aún no has compartido recursos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((r) => {
            const eq = equipos.find((e) => e.id === r.equipo_id);
            return (
              <div key={r.id} className="rounded-2xl border border-border p-4 flex flex-col gap-2" style={{ background: "#0D1628" }}>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-bold uppercase">{r.tipo}</span>
                  {eq && <span className="text-accent/60 text-[10px] font-semibold truncate">{eq.nombre}</span>}
                  <div className="ml-auto flex gap-1">
                    <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-white"><Pencil size={12} /></button>
                    <button onClick={() => void remove(r.id)} className="p-1.5 rounded hover:bg-red-500/10 text-red-400/70"><Trash2 size={12} /></button>
                  </div>
                </div>
                <p className="text-white font-bold text-sm line-clamp-2">{r.titulo}</p>
                {r.descripcion && <p className="text-white/50 text-xs line-clamp-3">{r.descripcion}</p>}
                <a href={r.url} target="_blank" rel="noreferrer" className="mt-auto inline-flex items-center gap-1 text-accent hover:text-accent/80 text-xs font-semibold">
                  <ExternalLink size={12} /> Abrir recurso
                </a>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[90] p-4 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="w-full max-w-lg rounded-2xl border border-border p-5 max-h-[90vh] overflow-y-auto" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-bold">{editingId ? "Editar recurso" : "Nuevo recurso"}</h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-white/50 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Equipo *</label>
                <select className="input w-full" value={form.equipo_id} onChange={(e) => setForm((f) => ({ ...f, equipo_id: e.target.value }))}>
                  {equipos.map((eq) => (<option key={eq.id} value={eq.id}>{eq.nombre}</option>))}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Título *</label>
                <input className="input w-full" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">URL *</label>
                <input className="input w-full" placeholder="https://..." value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Tipo</label>
                <select className="input w-full" value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}>
                  {TIPOS.map((t) => (<option key={t} value={t}>{t.toUpperCase()}</option>))}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Descripción</label>
                <textarea className="input w-full resize-none" rows={3} value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <button className="btn-secondary py-2 px-4 text-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</button>
              <button className="btn-primary py-2 px-4 text-sm" onClick={() => void save()} disabled={saving || !form.titulo.trim() || !form.url.trim() || !form.equipo_id}>
                {saving ? "Guardando..." : editingId ? "Guardar" : "Crear recurso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
