"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

import { Plus, Pencil, Trash2, X, Check, Upload, ExternalLink } from "lucide-react";
import { CLOUDINARY_CLOUD, CLOUDINARY_PRESET, cloudinaryUploadUrl } from "@/lib/cloudinary";


type Pastor = { id: string; nombre: string; cargo: string; bio: string; foto_url: string; versiculo: string };
const EMPTY: Omit<Pastor, "id"> = { nombre: "", cargo: "", bio: "", foto_url: "", versiculo: "" };

export default function AdminPastores() {
  const [items, setItems] = useState<Pastor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Omit<Pastor, "id">>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("pastores").select("*").order("orden");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const openNew = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (p: Pastor) => {
    const { id, ...rest } = p;
    setForm({
      nombre: rest.nombre ?? "",
      cargo: rest.cargo ?? "",
      bio: rest.bio ?? "",
      foto_url: rest.foto_url ?? "",
      versiculo: rest.versiculo ?? "",
    });
    setEditing(id);
    setModal(true);
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);
    formData.append("folder", "pastores");
    const res = await fetch(cloudinaryUploadUrl(), {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.secure_url) setForm(prev => ({ ...prev, foto_url: data.secure_url }));
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    if (editing) { await supabase.from("pastores").update(form).eq("id", editing); }
    else { await supabase.from("pastores").insert(form); }
    setSaving(false); setModal(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    await supabase.from("pastores").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Pastores</h1>
          <p className="text-white/40 text-sm mt-1">{items.length} pastores</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/pastores" target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-white/50 hover:text-white hover:border-white/20 transition-all">
            <ExternalLink size={14} /> Ver página
          </a>
          <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
            <Plus size={14} /> Nuevo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? <p className="text-white/30 text-sm">Cargando...</p> : items.map(p => (
          <div key={p.id} className="p-5 rounded-2xl border border-border" style={{ background: "#0D1628" }}>
            <div className="flex items-center gap-3 mb-3">
              {p.foto_url
                ? <Image src={p.foto_url} className="w-14 h-14 rounded-full object-cover border border-accent/30" alt="" width={56} height={56} />
                : <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white bg-accent/20">{p.nombre?.[0]}</div>
              }
              <div>
                <p className="text-white font-bold">{p.nombre}</p>
                <p className="text-accent text-xs">{p.cargo}</p>
              </div>
            </div>
            <p className="text-white/40 text-sm line-clamp-2">{p.bio}</p>
            {p.versiculo && <p className="text-white/25 text-xs italic mt-2 line-clamp-1">&quot;{p.versiculo}&quot;</p>}
            <div className="flex gap-2 mt-3 justify-end">
              <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white"><Pencil size={14} /></button>
              <button onClick={() => remove(p.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl border border-border p-6 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editing ? "Editar pastor" : "Nuevo pastor"}</h2>
              <button onClick={() => setModal(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            {/* Foto */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Foto</label>
              <div className="flex items-center gap-3">
                {form.foto_url
                  ? <Image src={form.foto_url} className="w-16 h-16 rounded-full object-cover border border-accent/30" alt="" width={64} height={64} />
                  : <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-white/20 text-2xl font-bold">{form.nombre?.[0] ?? "?"}</div>
                }
                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-white/60 hover:text-white hover:border-accent/40 transition-all w-full"
                  >
                    <Upload size={14} />
                    {uploading ? "Subiendo..." : "Subir imagen"}
                  </button>
                  <input className="input w-full text-xs" placeholder="O pega una URL" value={form.foto_url} onChange={e => setForm(p => ({ ...p, foto_url: e.target.value }))} />
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </div>
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Nombre</label>
              <input className="input w-full" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
            </div>

            {/* Cargo */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Cargo</label>
              <input className="input w-full" value={form.cargo} onChange={e => setForm(p => ({ ...p, cargo: e.target.value }))} />
            </div>

            {/* Bio */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Biografía</label>
              <textarea className="input w-full h-24 resize-none" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
            </div>

            {/* Versículo */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Versículo o frase</label>
              <input className="input w-full" placeholder='Ej: "Todo lo puedo en Cristo..." — Fil 4:13' value={form.versiculo} onChange={e => setForm(p => ({ ...p, versiculo: e.target.value }))} />
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
