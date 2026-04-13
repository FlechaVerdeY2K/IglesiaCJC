"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";

import { Plus, Pencil, Trash2, X, Check, Play, ExternalLink } from "lucide-react";


type Sermon = { id: string; titulo: string; descripcion: string; video_id: string; fecha: string; predicador: string };
const EMPTY: Omit<Sermon, "id"> = { titulo: "", descripcion: "", video_id: "", fecha: "", predicador: "" };

function extractVideoId(input: string): string {
  // Already a bare ID (no slashes or dots)
  if (/^[\w-]{11}$/.test(input.trim())) return input.trim();
  // youtu.be/ID or youtube.com/watch?v=ID or /embed/ID
  const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&\s]{11})/);
  return match ? match[1] : input.trim();
}

export default function AdminSermones() {
  const [items, setItems] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Omit<Sermon, "id">>(EMPTY);
  const [videoInput, setVideoInput] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("sermones").select("*").order("fecha", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setVideoInput(""); setEditing(null); setModal(true); };
  const openEdit = (s: Sermon) => {
    const { id, ...rest } = s;
    setForm(rest);
    setVideoInput(rest.video_id ? `https://youtu.be/${rest.video_id}` : "");
    setEditing(id);
    setModal(true);
  };

  const handleVideoInput = (raw: string) => {
    setVideoInput(raw);
    const id = extractVideoId(raw);
    setForm(p => ({ ...p, video_id: id }));
  };

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

  const preview = form.video_id?.length >= 11 ? form.video_id : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Prédicas</h1>
          <p className="text-white/40 text-sm mt-1">{items.length} prédicas</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/sermones" target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-white/50 hover:text-white hover:border-white/20 transition-all">
            <ExternalLink size={14} /> Ver página
          </a>
          <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
            <Plus size={14} /> Nueva
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-white/30 text-sm">Cargando...</p> : items.map(s => (
          <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border" style={{ background: "#0D1628" }}>
            {s.video_id ? (
              <div className="relative shrink-0 group/thumb">
                <img src={`https://img.youtube.com/vi/${s.video_id}/mqdefault.jpg`} className="w-24 h-14 rounded-xl object-cover" alt="" />
                <a href={`https://www.youtube.com/watch?v=${s.video_id}`} target="_blank" rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                  <Play size={18} className="text-white" />
                </a>
              </div>
            ) : (
              <div className="w-24 h-14 rounded-xl bg-white/5 shrink-0 flex items-center justify-center">
                <Play size={16} className="text-white/20" />
              </div>
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
          <div className="w-full max-w-lg rounded-2xl border border-border p-6 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editing ? "Editar prédica" : "Nueva prédica"}</h2>
              <button onClick={() => setModal(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            {/* Video de YouTube */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Video de YouTube</label>
              <input
                className="input w-full"
                placeholder="Pega el link del video (youtube.com/watch?v=...)"
                value={videoInput}
                onChange={e => handleVideoInput(e.target.value)}
              />
              {/* Preview */}
              {preview && (
                <div className="mt-3 relative rounded-xl overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${preview}/hqdefault.jpg`}
                    className="w-full h-40 object-cover"
                    alt="Preview"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="rounded-full p-3 border border-white/20 backdrop-blur-sm" style={{ backgroundColor: "rgba(191,30,46,0.8)" }}>
                      <Play className="text-white" size={22} />
                    </div>
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${preview}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 text-xs text-white/60 hover:text-white flex items-center gap-1"
                  >
                    <ExternalLink size={11} /> Ver en YouTube
                  </a>
                </div>
              )}
            </div>

            {/* Título */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Título</label>
              <input className="input w-full" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} />
            </div>

            {/* Predicador y Fecha */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Predicador</label>
                <input className="input w-full" value={form.predicador} onChange={e => setForm(p => ({ ...p, predicador: e.target.value }))} />
              </div>
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Fecha</label>
                <input type="date" className="input w-full" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Descripción</label>
              <textarea className="input w-full h-20 resize-none" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
            </div>

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
