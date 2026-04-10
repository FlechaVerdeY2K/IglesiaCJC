"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Pencil, Trash2, X, Check, Play } from "lucide-react";

const supabase = createBrowserClient(
  "https://fvffsnenebscigtywgwn.supabase.co",
  "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN"
);

type Sermon = { id: string; titulo: string; descripcion: string; video_id: string; fecha: string; predicador: string };
const EMPTY: Omit<Sermon, "id"> = { titulo: "", descripcion: "", video_id: "", fecha: "", predicador: "" };

export default function AdminSermones() {
  const [items, setItems] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Omit<Sermon, "id">>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("sermones").select("*").order("fecha", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (s: Sermon) => { const { id, ...rest } = s; setForm(rest); setEditing(id); setModal(true); };

  const save = async () => {
    setSaving(true);
    if (editing) { await supabase.from("sermones").update(form).eq("id", editing); }
    else { await supabase.from("sermones").insert(form); }
    setSaving(false); setModal(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    await supabase.from("sermones").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-black text-white">Prédicas</h1><p className="text-white/40 text-sm mt-1">{items.length} prédicas</p></div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm py-2 px-4"><Plus size={14} /> Nueva</button>
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-white/30 text-sm">Cargando...</p> : items.map(s => (
          <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border" style={{ background: "#0D1628" }}>
            {s.video_id && (
              <img src={`https://img.youtube.com/vi/${s.video_id}/mqdefault.jpg`} className="w-20 h-14 rounded-xl object-cover shrink-0" alt="" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{s.titulo}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.predicador && `${s.predicador} · `}{s.fecha}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white"><Pencil size={14} /></button>
              <button onClick={() => remove(s.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl border border-border p-6 space-y-4" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editing ? "Editar prédica" : "Nueva prédica"}</h2>
              <button onClick={() => setModal(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            {(["titulo","predicador","fecha","video_id","descripcion"] as const).map(f => (
              <div key={f}>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">{f === "video_id" ? "YouTube Video ID" : f.replace("_", " ")}</label>
                {f === "descripcion"
                  ? <textarea className="input w-full h-20 resize-none" value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} />
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
