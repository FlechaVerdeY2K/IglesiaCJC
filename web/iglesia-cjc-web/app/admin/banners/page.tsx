"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader, ImageIcon, ToggleLeft, ToggleRight } from "lucide-react";
import { CLOUDINARY_PRESET, cloudinaryUploadUrl } from "@/lib/cloudinary";

type Banner = { id: string; url: string; label: string; activo: boolean; orden: number };

export default function AdminBanners() {
  const [banners, setBanners]   = useState<Banner[]>([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [label, setLabel]       = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("config_banners").select("*").order("orden");
    setBanners(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const uploadCloudinary = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    const res = await fetch(cloudinaryUploadUrl(), { method: "POST", body: fd });
    const data = await res.json();
    return data.secure_url ?? null;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadCloudinary(file);
    if (url) setPreviewUrl(url);
    setUploading(false);
    e.target.value = "";
  };

  const handleAdd = async () => {
    if (!previewUrl) return;
    await supabase.from("config_banners").insert({
      url: previewUrl,
      label: label.trim() || "Banner",
      activo: true,
      orden: banners.length,
    });
    setPreviewUrl("");
    setLabel("");
    load();
  };

  const toggleActivo = async (b: Banner) => {
    await supabase.from("config_banners").update({ activo: !b.activo }).eq("id", b.id);
    setBanners(prev => prev.map(x => x.id === b.id ? { ...x, activo: !x.activo } : x));
  };

  const handleDelete = async (id: string) => {
    await supabase.from("config_banners").delete().eq("id", id);
    setBanners(prev => prev.filter(x => x.id !== id));
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Banners de Perfil</h1>
        <p className="text-white/40 text-sm mt-1">Imágenes que los usuarios pueden usar como fondo en su perfil</p>
      </div>

      {/* Upload form */}
      <div className="rounded-2xl border border-border p-6 mb-6 space-y-4" style={{ background: "#0D1628" }}>
        <h2 className="text-white font-bold text-sm">Agregar nuevo banner</h2>

        <div className="flex gap-3">
          <div
            className="w-48 h-28 rounded-xl border-2 border-dashed border-white/15 overflow-hidden flex items-center justify-center cursor-pointer hover:border-accent/50 transition-colors shrink-0 relative"
            style={{ background: "#080E1E" }}
            onClick={() => fileRef.current?.click()}>
            {uploading ? (
              <Loader size={20} className="text-accent/50 animate-spin" />
            ) : previewUrl ? (
              <Image src={previewUrl} className="absolute inset-0 w-full h-full object-cover" alt="preview" fill sizes="192px" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/20">
                <ImageIcon size={24} />
                <span className="text-xs">Subir imagen</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          <div className="flex-1 space-y-3">
            <div>
              <label className="text-white/40 text-xs block mb-1">Nombre del banner</label>
              <input className="input w-full" placeholder="Ej: Atardecer, Cruz, Naturaleza..." value={label} onChange={e => setLabel(e.target.value)} />
            </div>
            <button onClick={handleAdd} disabled={!previewUrl || uploading}
              className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              <Plus size={15} /> Agregar banner
            </button>
          </div>
        </div>
      </div>

      {/* Banner list */}
      {loading ? (
        <p className="text-white/30 text-sm">Cargando...</p>
      ) : banners.length === 0 ? (
        <div className="rounded-2xl border border-border p-10 text-center" style={{ background: "#0D1628" }}>
          <ImageIcon size={32} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/30 text-sm">No hay banners aún. Sube el primero.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {banners.map(b => (
            <div key={b.id} className={`rounded-xl border overflow-hidden transition-all ${b.activo ? "border-white/10" : "border-white/5 opacity-50"}`}
              style={{ background: "#0D1628" }}>
              <div className="h-28 relative overflow-hidden">
                <Image src={b.url} className="w-full h-full object-cover" alt={b.label} fill sizes="(max-width: 768px) 50vw, 33vw" />
                {!b.activo && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Oculto</span>
                  </div>
                )}
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <p className="text-white/70 text-xs font-medium truncate">{b.label}</p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => toggleActivo(b)} className="text-white/40 hover:text-white transition-colors" title={b.activo ? "Ocultar" : "Mostrar"}>
                    {b.activo ? <ToggleRight size={16} className="text-accent" /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="text-white/30 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
