"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

const supabase = createBrowserClient(
  "https://fvffsnenebscigtywgwn.supabase.co",
  "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN"
);

type Anuncio = { id: string; titulo: string; contenido: string; imagen_url: string };
const EMPTY: Omit<Anuncio, "id"> = { titulo: "", contenido: "", imagen_url: "" };

export default function AdminAnuncios() {
  const [items, setItems] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Omit<Anuncio, "id">>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("anuncios").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (a: Anuncio) => { const { id, ...rest } = a; setForm(rest); setEditing(id); setModal(true); };

  const save = async () => {
    setSaving(true);
    if (editing) { await supabase.from("anuncios").update(form).eq("id", editing); }
    else { await supabase.from("anuncios").insert(form); }
    setSaving(false); setModal(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    await supabase.from("anuncios").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-black text-white">Anuncios</h1><p className="text-white/40 text-sm mt-1">{items.length} anuncios</p></div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm py-2 px-4"><Plus size={14} /> Nuevo</button>
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-white/30 text-sm">Cargando...</p> : items.map(a => (
          <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border" style={{ background: "#0D1628" }}>
            {a.imagen_url && <img src={a.imagen_url} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold">{a.titulo}</p>
              <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{a.contenido}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white"><Pencil size={14} /></button>
              <button onClick={() => remove(a.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl border border-border p-6 space-y-4" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editing ? "Editar anuncio" : "Nuevo anuncio"}</h2>
              <button onClick={() => setModal(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            {(["titulo","contenido","imagen_url"] as const).map(f => (
              <div key={f}>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">{f.replace("_", " ")}</label>
                {f === "contenido"
                  ? <textarea className="input w-full h-24 resize-none" value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} />
                  : <input className="input w-full" value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} />
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
