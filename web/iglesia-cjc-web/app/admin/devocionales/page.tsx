"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

const supabase = createBrowserClient(
  "https://fvffsnenebscigtywgwn.supabase.co",
  "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN"
);

type Devocional = { id: string; versiculo: string; referencia: string; reflexion: string; fecha: string };
const EMPTY: Omit<Devocional, "id"> = { versiculo: "", referencia: "", reflexion: "", fecha: "" };

export default function AdminDevocionales() {
  const [items, setItems] = useState<Devocional[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Omit<Devocional, "id">>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("devocionales").select("*").order("fecha", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (d: Devocional) => { const { id, ...rest } = d; setForm(rest); setEditing(id); setModal(true); };

  const save = async () => {
    setSaving(true);
    if (editing) { await supabase.from("devocionales").update(form).eq("id", editing); }
    else { await supabase.from("devocionales").insert(form); }
    setSaving(false); setModal(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    await supabase.from("devocionales").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-black text-white">Devocionales</h1><p className="text-white/40 text-sm mt-1">{items.length} devocionales</p></div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm py-2 px-4"><Plus size={14} /> Nuevo</button>
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-white/30 text-sm">Cargando...</p> : items.map(d => (
          <div key={d.id} className="p-4 rounded-2xl border border-border" style={{ background: "#0D1628" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-accent text-xs font-bold uppercase tracking-wider mb-1">{d.referencia} · {d.fecha}</p>
                <p className="text-white font-semibold line-clamp-2">{d.versiculo}</p>
                <p className="text-white/40 text-sm mt-1 line-clamp-2">{d.reflexion}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(d)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white"><Pencil size={14} /></button>
                <button onClick={() => remove(d.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl border border-border p-6 space-y-4" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editing ? "Editar devocional" : "Nuevo devocional"}</h2>
              <button onClick={() => setModal(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            {(["fecha","referencia","versiculo","reflexion"] as const).map(f => (
              <div key={f}>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">{f}</label>
                {f === "versiculo" || f === "reflexion"
                  ? <textarea className="input w-full h-24 resize-none" value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} />
                  : <input type={f === "fecha" ? "date" : "text"} className="input w-full" value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} />
                }
              </div>
            ))}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal(false)} className="btn-secondary py-2 px-4 text-sm">Cancelar</button>
              <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
                <Check size={14} /> {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
