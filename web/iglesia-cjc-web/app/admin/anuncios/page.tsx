"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

import { Plus, Pencil, Trash2, X, Check, Upload } from "lucide-react";


const CLOUDINARY_CLOUD = "djfnlzs0g";
const CLOUDINARY_PRESET = "cjc_uploads";

type Anuncio = {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_url: string | null;
  fecha: string | null;
  activo: boolean;
};

const EMPTY: Omit<Anuncio, "id"> = {
  titulo: "", descripcion: "", imagen_url: null, fecha: null, activo: true,
};

export default function AdminAnuncios() {
  const [items, setItems] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Omit<Anuncio, "id">>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("anuncios").select("*").order("fecha", { ascending: false });
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
  const openEdit = (a: Anuncio) => {
    const { id, ...rest } = a;
    setForm({
      titulo: rest.titulo ?? "",
      descripcion: rest.descripcion ?? "",
      imagen_url: rest.imagen_url ?? null,
      fecha: rest.fecha ?? null,
      activo: rest.activo ?? true,
    });
    setEditing(id);
    setModal(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    fd.append("folder", "anuncios");
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
      method: "POST", body: fd,
    });
    const data = await res.json();
    if (data.secure_url) setForm(p => ({ ...p, imagen_url: data.secure_url }));
    setUploading(false);
  };

  const save = async () => {
    if (!form.titulo) return;
    setSaving(true);
    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      imagen_url: form.imagen_url || null,
      fecha: form.fecha || null,
      activo: form.activo,
    };
    if (editing) { await supabase.from("anuncios").update(payload).eq("id", editing); }
    else { await supabase.from("anuncios").insert(payload); }
    setSaving(false); setModal(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Â¿Eliminar?")) return;
    await supabase.from("anuncios").delete().eq("id", id);
    load();
  };

  const toggleActivo = async (a: Anuncio) => {
    await supabase.from("anuncios").update({ activo: !a.activo }).eq("id", a.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Anuncios</h1>
          <p className="text-white/40 text-sm mt-1">{items.length} anuncios</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={14} /> Nuevo
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-white/30 text-sm">Cargando...</p>
        ) : items.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-10">No hay anuncios.</p>
        ) : items.map(a => (
          <div key={a.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${a.activo ? "border-border" : "border-white/5 opacity-50"}`} style={{ background: "#0D1628" }}>
            {a.imagen_url ? (
              <Image src={a.imagen_url} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" width={64} height={64} />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-accent/10 shrink-0 flex items-center justify-center">
                <span className="text-accent/50 text-xs font-bold">CJC</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{a.titulo}</p>
              <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{a.descripcion}</p>
              {a.fecha && <p className="text-white/25 text-xs mt-0.5">{a.fecha}</p>}
            </div>
            <div className="flex gap-2 items-center shrink-0">
              <button
                onClick={() => toggleActivo(a)}
                title={a.activo ? "Ocultar" : "Activar"}
                className={`p-2 rounded-lg text-xs transition-colors ${a.activo ? "text-green-400 hover:bg-green-500/10" : "text-white/25 hover:bg-white/5 hover:text-white/60"}`}
              >
                {a.activo ? "â—" : "â—‹"}
              </button>
              <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white"><Pencil size={14} /></button>
              <button onClick={() => remove(a.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl border border-border p-6 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editing ? "Editar anuncio" : "Nuevo anuncio"}</h2>
              <button onClick={() => setModal(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            {/* Imagen */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Imagen</label>
              <div className="flex gap-3 items-start">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-border flex items-center justify-center" style={{ background: "#080E1E" }}>
                  {form.imagen_url ? (
                    <Image src={form.imagen_url} className="w-full h-full object-cover" alt="" width={80} height={80} />
                  ) : (
                    <span className="text-white/20 text-xs font-bold text-center px-2">Logo CJC por defecto</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-white/60 hover:text-white hover:border-accent/40 transition-all w-full"
                  >
                    <Upload size={14} />
                    {uploading ? "Subiendo..." : form.imagen_url ? "Cambiar imagen" : "Subir imagen"}
                  </button>
                  {form.imagen_url && (
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, imagen_url: null }))}
                      className="text-xs text-white/30 hover:text-red-400 transition-colors"
                    >
                      Quitar imagen (usar logo CJC)
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
                </div>
              </div>
            </div>

            {/* TÃ­tulo */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">TÃ­tulo *</label>
              <input className="input w-full" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} />
            </div>

            {/* DescripciÃ³n */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">DescripciÃ³n</label>
              <textarea className="input w-full h-24 resize-none" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
            </div>

            {/* Fecha (opcional) */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Fecha <span className="normal-case text-white/20">(opcional)</span></label>
              <input type="date" className="input w-full" value={form.fecha ?? ""} onChange={e => setForm(p => ({ ...p, fecha: e.target.value || null }))} />
            </div>

            {/* Activo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, activo: !p.activo }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.activo ? "bg-accent" : "bg-white/10"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.activo ? "left-5" : "left-0.5"}`} />
              </button>
              <span className="text-white/60 text-sm">{form.activo ? "Visible en el sitio" : "Oculto"}</span>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setModal(false)} className="btn-secondary py-2 px-4 text-sm">Cancelar</button>
              <button onClick={save} disabled={saving || !form.titulo} className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm disabled:opacity-50">
                <Check size={14} /> {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

