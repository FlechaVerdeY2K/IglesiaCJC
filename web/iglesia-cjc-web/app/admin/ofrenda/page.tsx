"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useRef, useState } from "react";
import { Loader, Upload, Trash2, Save } from "lucide-react";
import { CLOUDINARY_CLOUD, CLOUDINARY_PRESET } from "@/lib/cloudinary";

type ConfigOfrenda = {
  sinpe_numero: string;
  sinpe_nombre: string;
  bcr_nombre: string;
  bcr_cedula: string;
  bcr_iban_colones: string;
  bcr_iban_dolares: string;
};

const EMPTY: ConfigOfrenda = {
  sinpe_numero: "",
  sinpe_nombre: "",
  bcr_nombre: "",
  bcr_cedula: "",
  bcr_iban_colones: "",
  bcr_iban_dolares: "",
};

export default function AdminOfrenda() {
  const [videoUrl, setVideoUrl]   = useState<string | null>(null);
  const [fields, setFields]       = useState<ConfigOfrenda>(EMPTY);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const [homeRes, ofrendaRes] = await Promise.all([
      supabase.from("config_home").select("ofrenda_video_url").eq("id", 1).single(),
      supabase.from("config_ofrenda").select("*").eq("id", 1).single(),
    ]);
    setVideoUrl(homeRes.data?.ofrenda_video_url ?? null);
    if (ofrendaRes.data) {
      setFields({
        sinpe_numero:     ofrendaRes.data.sinpe_numero ?? "",
        sinpe_nombre:     ofrendaRes.data.sinpe_nombre ?? "",
        bcr_nombre:       ofrendaRes.data.bcr_nombre ?? "",
        bcr_cedula:       ofrendaRes.data.bcr_cedula ?? "",
        bcr_iban_colones: ofrendaRes.data.bcr_iban_colones ?? "",
        bcr_iban_dolares: ofrendaRes.data.bcr_iban_dolares ?? "",
      });
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = ev => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = async () => {
      const data = JSON.parse(xhr.responseText);
      const url = data.secure_url ?? null;
      if (url) {
        await supabase.from("config_home").update({ ofrenda_video_url: url }).eq("id", 1);
        setVideoUrl(url);
      }
      setUploading(false);
      e.target.value = "";
    };
    xhr.onerror = () => setUploading(false);
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/video/upload`);
    xhr.send(fd);
  };

  const handleRemoveVideo = async () => {
    if (!confirm("¿Quitar el video de la página principal?")) return;
    await supabase.from("config_home").update({ ofrenda_video_url: null }).eq("id", 1);
    setVideoUrl(null);
  };

  const handleSaveFields = async () => {
    setSaving(true);
    await supabase.from("config_ofrenda").upsert({ id: 1, ...fields });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (k: keyof ConfigOfrenda) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields(prev => ({ ...prev, [k]: e.target.value }));

  if (loading) return <p className="text-white/30 text-sm">Cargando...</p>;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Ofrenda</h1>
        <p className="text-white/40 text-sm mt-1">Video en bucle + datos de pago visibles en la página principal.</p>
      </div>

      {/* ── Video ── */}
      <div className="rounded-2xl border border-border p-6 space-y-4" style={{ background: "#0D1628" }}>
        <h2 className="text-white font-bold text-sm">Video en bucle</h2>
        {videoUrl ? (
          <>
            <video src={videoUrl} autoPlay loop muted playsInline className="w-full rounded-xl border border-border" />
            {uploading && (
              <div className="space-y-1">
                <p className="text-white/40 text-xs">Subiendo... {progress}%</p>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-accent transition-all rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-primary flex items-center gap-2 disabled:opacity-40">
                <Upload size={14} /> Cambiar video
              </button>
              <button onClick={handleRemoveVideo} className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 text-sm transition-colors">
                <Trash2 size={14} /> Quitar
              </button>
            </div>
          </>
        ) : (
          <div
            className="border-2 border-dashed border-white/10 rounded-xl p-12 flex flex-col items-center gap-3 cursor-pointer hover:border-accent/30 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader size={28} className="text-accent/50 animate-spin" />
                <p className="text-white/40 text-sm">Subiendo... {progress}%</p>
                <div className="w-full max-w-xs h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-accent transition-all rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </>
            ) : (
              <>
                <Upload size={28} className="text-white/20" />
                <p className="text-white/40 text-sm">Haz click para subir el video</p>
                <p className="text-white/20 text-xs">MP4, MOV, WebM — máx. 100 MB recomendado</p>
              </>
            )}
          </div>
        )}
        <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
      </div>

      {/* ── Datos de pago ── */}
      <div className="rounded-2xl border border-border p-6 space-y-5" style={{ background: "#0D1628" }}>
        <h2 className="text-white font-bold text-sm">Datos de pago</h2>
        <p className="text-white/30 text-xs -mt-2">Se muestran como tarjetas debajo del video.</p>

        {/* SINPE */}
        <div className="space-y-3 pb-5 border-b border-white/5">
          <p className="text-accent text-xs font-bold uppercase tracking-wider">SINPE Móvil</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs block mb-1">Número</label>
              <input className="input w-full" placeholder="7093-9483" value={fields.sinpe_numero} onChange={set("sinpe_numero")} />
            </div>
            <div>
              <label className="text-white/40 text-xs block mb-1">Nombre</label>
              <input className="input w-full" placeholder="Asociación Iglesia..." value={fields.sinpe_nombre} onChange={set("sinpe_nombre")} />
            </div>
          </div>
        </div>

        {/* BCR */}
        <div className="space-y-3">
          <p className="text-accent text-xs font-bold uppercase tracking-wider">Transferencia BCR</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs block mb-1">Nombre</label>
              <input className="input w-full" placeholder="Asociación Iglesia..." value={fields.bcr_nombre} onChange={set("bcr_nombre")} />
            </div>
            <div>
              <label className="text-white/40 text-xs block mb-1">Cédula jurídica</label>
              <input className="input w-full" placeholder="3-002-183121" value={fields.bcr_cedula} onChange={set("bcr_cedula")} />
            </div>
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">IBAN Colones</label>
            <input className="input w-full font-mono text-sm" placeholder="CR58015201001019570665" value={fields.bcr_iban_colones} onChange={set("bcr_iban_colones")} />
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">IBAN Dólares</label>
            <input className="input w-full font-mono text-sm" placeholder="CR22015202001355876956" value={fields.bcr_iban_dolares} onChange={set("bcr_iban_dolares")} />
          </div>
        </div>

        <button onClick={handleSaveFields} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-40">
          {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
          {saved ? "¡Guardado!" : "Guardar datos"}
        </button>
      </div>
    </div>
  );
}
