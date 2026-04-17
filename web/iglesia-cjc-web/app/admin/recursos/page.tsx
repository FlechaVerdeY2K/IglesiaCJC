"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";
import Image from "next/image";

import { Check, Link2, Pencil, Plus, Trash2, X, FileText, Film, Globe } from "lucide-react";
import { getResourceThumbnail } from "@/lib/resource-preview";
import { broadcastNotification, getMinisterioMemberIds } from "@/lib/notifications";

type Recurso = {
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
  tipo: string;
  audiencia: string;
};

const EMPTY: Omit<Recurso, "id"> = { titulo: "", descripcion: "", url: "", tipo: "link", audiencia: "general" };

export default function AdminRecursos() {
  const [items, setItems] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Omit<Recurso, "id">>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("recursos").select("*").order("titulo");
    setItems((data ?? []) as Recurso[]);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const openNew = () => {
    setForm(EMPTY);
    setEditing(null);
    setModal(true);
  };

  const openEdit = (r: Recurso) => {
    const { id, ...rest } = r;
    setForm(rest);
    setEditing(id);
    setModal(true);
  };

  const save = async () => {
    setSaving(true);
    if (editing) {
      await supabase.from("recursos").update(form).eq("id", editing);
    } else {
      await supabase.from("recursos").insert(form);
      const isMinisterio = form.audiencia && form.audiencia !== "general" && form.audiencia !== "equipos";
      const userIds = isMinisterio ? await getMinisterioMemberIds(form.audiencia) : undefined;
      void broadcastNotification("recurso_nuevo", `Nuevo recurso: ${form.titulo}`, form.descripcion || null, { tipo: form.tipo, audiencia: form.audiencia }, userIds);
    }
    setSaving(false);
    setModal(false);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    await supabase.from("recursos").delete().eq("id", id);
    void load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Recursos</h1>
          <p className="text-white/40 text-sm mt-1">{items.length} recursos</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={14} /> Nuevo
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-white/30 text-sm">Cargando...</p>
        ) : (
          items.map((r) => {
            const preview = getResourceThumbnail(r.url, r.tipo);
            return (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border" style={{ background: "#0D1628" }}>
                <div className="w-20 h-14 rounded-lg border border-white/10 overflow-hidden shrink-0" style={{ background: "#08111f" }}>
                  {preview ? (
                    <Image src={preview} alt={r.titulo} width={160} height={112} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      {r.tipo === "pdf" ? <FileText size={20} className="text-red-400/60" /> : r.tipo === "video" ? <Film size={20} className="text-purple-400/60" /> : <Globe size={20} className="text-blue-400/60" />}
                      <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: r.tipo === "pdf" ? "#f87171" : r.tipo === "video" ? "#c084fc" : "#60a5fa", opacity: 0.6 }}>{r.tipo}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white font-semibold truncate">{r.titulo}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold uppercase">{r.tipo}</span>
                    {r.audiencia !== "general" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">{r.audiencia}</span>}
                  </div>
                  <p className="text-white/40 text-xs truncate">{r.url}</p>
                </div>

                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white">
                    <Pencil size={14} />
                  </button>
                  <a href={r.url} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white">
                    <Link2 size={14} />
                  </a>
                  <button onClick={() => void remove(r.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl border border-border p-6 space-y-4" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editing ? "Editar recurso" : "Nuevo recurso"}</h2>
              <button onClick={() => setModal(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            {(["titulo", "descripcion", "url"] as const).map((f) => (
              <div key={f}>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">{f}</label>
                {f === "descripcion" ? (
                  <textarea className="input w-full h-20 resize-none" value={form[f]} onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))} />
                ) : (
                  <input className="input w-full" value={form[f]} onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))} />
                )}
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Tipo</label>
                <select className="input w-full" value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}>
                  <option value="link">Link</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="foto">Foto</option>
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Audiencia</label>
                <select className="input w-full" value={form.audiencia} onChange={(e) => setForm((p) => ({ ...p, audiencia: e.target.value }))}>
                  <option value="general">General</option>
                  <option value="equipos">Equipos</option>
                  <option value="lideres">Lideres</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal(false)} className="btn-secondary py-2 px-4 text-sm">Cancelar</button>
              <button onClick={() => void save()} disabled={saving} className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
                <Check size={14} /> {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
