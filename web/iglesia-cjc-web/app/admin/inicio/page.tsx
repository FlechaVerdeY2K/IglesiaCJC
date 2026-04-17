"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader, Upload, Trash2, Save, ImageIcon } from "lucide-react";
import { CLOUDINARY_PRESET, cloudinaryUploadUrl } from "@/lib/cloudinary";

type ConfigHome = {
  bienvenida_titulo: string;
  bienvenida_texto: string;
  servicios_texto: string;
  hero_image_url: string | null;
  servicios_image_url: string | null;
};

const EMPTY: ConfigHome = {
  bienvenida_titulo: "",
  bienvenida_texto: "",
  servicios_texto: "",
  hero_image_url: null,
  servicios_image_url: null,
};

function ImageUploadField({
  label, hint, value, onChange,
}: {
  label: string; hint: string; value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    const res = await fetch(cloudinaryUploadUrl(), { method: "POST", body: fd });
    const data = await res.json();
    if (data.secure_url) onChange(data.secure_url);
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div>
      <label className="text-white/40 text-xs block mb-1">{label}</label>
      <p className="text-white/20 text-xs mb-2">{hint}</p>
      <div className="flex gap-3 items-start">
        <div
          className="w-40 h-24 rounded-xl border-2 border-dashed border-white/15 overflow-hidden flex items-center justify-center cursor-pointer hover:border-accent/50 transition-colors shrink-0 relative"
          style={{ background: "#080E1E" }}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader size={18} className="text-accent/50 animate-spin" />
          ) : value ? (
            <Image src={value} alt={label} fill sizes="160px" className="object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-white/20">
              <ImageIcon size={20} />
              <span className="text-[10px]">Subir imagen</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {value && (
          <button
            onClick={() => onChange(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 text-xs transition-colors"
          >
            <Trash2 size={12} /> Quitar
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminInicio() {
  const [fields, setFields] = useState<ConfigHome>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("config_home").select("*").eq("id", 1).single();
      if (data) setFields({
        bienvenida_titulo:  data.bienvenida_titulo ?? "",
        bienvenida_texto:   data.bienvenida_texto ?? "",
        servicios_texto:    data.servicios_texto ?? "",
        hero_image_url:     data.hero_image_url ?? null,
        servicios_image_url: data.servicios_image_url ?? null,
      });
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("config_home").update(fields).eq("id", 1);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (k: keyof ConfigHome) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields(prev => ({ ...prev, [k]: e.target.value }));

  const setImg = (k: "hero_image_url" | "servicios_image_url") => (url: string | null) =>
    setFields(prev => ({ ...prev, [k]: url }));

  if (loading) return <p className="text-white/30 text-sm">Cargando...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Página de Inicio</h1>
        <p className="text-white/40 text-sm mt-1">Imágenes y textos de la página principal.</p>
      </div>

      {/* Imágenes */}
      <div className="rounded-2xl border border-border p-6 space-y-5" style={{ background: "#0D1628" }}>
        <h2 className="text-white font-bold text-sm">Imágenes</h2>

        <ImageUploadField
          label="Hero (portada)"
          hint="Imagen de fondo de la sección principal — recomendado 1920×1080"
          value={fields.hero_image_url}
          onChange={setImg("hero_image_url")}
        />

        <ImageUploadField
          label="Banner de Servicios"
          hint="Imagen de fondo de la sección 'Nuestros Servicios'"
          value={fields.servicios_image_url}
          onChange={setImg("servicios_image_url")}
        />
      </div>

      {/* Textos */}
      <div className="rounded-2xl border border-border p-6 space-y-4" style={{ background: "#0D1628" }}>
        <h2 className="text-white font-bold text-sm">Textos</h2>

        <div>
          <label className="text-white/40 text-xs block mb-1">Título de bienvenida</label>
          <input className="input w-full" value={fields.bienvenida_titulo} onChange={set("bienvenida_titulo")} placeholder="Bienvenidos a Casa CJC" />
        </div>

        <div>
          <label className="text-white/40 text-xs block mb-1">Texto de quiénes somos</label>
          <textarea className="input w-full h-32 resize-none" value={fields.bienvenida_texto} onChange={set("bienvenida_texto")} placeholder="Somos una iglesia que..." />
        </div>

        <div>
          <label className="text-white/40 text-xs block mb-1">Texto de servicios</label>
          <input className="input w-full" value={fields.servicios_texto} onChange={set("servicios_texto")} placeholder="Te esperamos cada semana..." />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-40">
        {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
        {saved ? "¡Guardado!" : "Guardar cambios"}
      </button>
    </div>
  );
}
