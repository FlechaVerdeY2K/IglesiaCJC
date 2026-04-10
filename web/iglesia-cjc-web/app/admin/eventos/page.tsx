"use client";
import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Pencil, Trash2, X, Check, Upload, MapPin } from "lucide-react";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

const supabase = createBrowserClient(
  "https://fvffsnenebscigtywgwn.supabase.co",
  "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN"
);

const CHURCH_LAT = 9.9478;
const CHURCH_LNG = -83.9986;

type Evento = {
  id: string; titulo: string; descripcion: string; fecha: string;
  hora: string; lugar: string; imagen_url: string; lat: number; lng: number;
};
const EMPTY: Omit<Evento, "id"> = {
  titulo: "", descripcion: "", fecha: "", hora: "",
  lugar: "Calle El Jocote, INVU Coronado, San José",
  imagen_url: "", lat: CHURCH_LAT, lng: CHURCH_LNG,
};

export default function AdminEventos() {
  const [items, setItems] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Omit<Evento, "id">>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("eventos").select("*").order("fecha", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (e: Evento) => {
    const { id, ...rest } = e;
    setForm({ ...rest, lat: rest.lat ?? CHURCH_LAT, lng: rest.lng ?? CHURCH_LNG });
    setEditing(id);
    setModal(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `eventos/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("imagenes").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("imagenes").getPublicUrl(path);
      setForm(p => ({ ...p, imagen_url: data.publicUrl }));
    }
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    if (editing) {
      await supabase.from("eventos").update(form).eq("id", editing);
    } else {
      await supabase.from("eventos").insert(form);
    }
    setSaving(false); setModal(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este evento?")) return;
    await supabase.from("eventos").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Eventos</h1>
          <p className="text-white/40 text-sm mt-1">{items.length} eventos</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={14} /> Nuevo
        </button>
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-white/30 text-sm">Cargando...</p> : items.map(ev => (
          <div key={ev.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border" style={{ background: "#0D1628" }}>
            {ev.imagen_url
              ? <img src={ev.imagen_url} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
              : <div className="w-16 h-16 rounded-xl bg-white/5 shrink-0 flex items-center justify-center"><MapPin size={18} className="text-white/20" /></div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{ev.titulo}</p>
              <p className="text-white/40 text-xs mt-0.5">{ev.fecha} {ev.hora && `· ${ev.hora}`} {ev.lugar && `· ${ev.lugar}`}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openEdit(ev)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"><Pencil size={14} /></button>
              <button onClick={() => remove(ev.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-2xl rounded-2xl border border-border p-6 space-y-4 overflow-y-auto max-h-[90vh]" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editing ? "Editar evento" : "Nuevo evento"}</h2>
              <button onClick={() => setModal(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            {/* Titulo */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Título</label>
              <input className="input w-full" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} />
            </div>

            {/* Descripcion */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Descripción</label>
              <textarea className="input w-full h-24 resize-none" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Fecha</label>
                <input type="date" className="input w-full" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
              </div>
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Hora</label>
                <input type="time" className="input w-full" value={form.hora} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))} />
              </div>
            </div>

            {/* Imagen upload */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Imagen del evento</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }} />
              <div className="flex gap-3 items-start">
                {form.imagen_url && (
                  <img src={form.imagen_url} className="w-20 h-20 rounded-xl object-cover border border-border" alt="" />
                )}
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-white/60 hover:text-white hover:border-white/30 text-sm transition-all">
                  <Upload size={14} />
                  {uploading ? "Subiendo..." : form.imagen_url ? "Cambiar imagen" : "Subir imagen"}
                </button>
              </div>
            </div>

            {/* Mapa */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block flex items-center gap-2">
                <MapPin size={12} /> Ubicación
              </label>
              <MapPicker
                lat={form.lat}
                lng={form.lng}
                onChange={(lat, lng, address) => setForm(p => ({ ...p, lat, lng, lugar: address }))}
              />
              {form.lugar && (
                <p className="text-white/40 text-xs mt-2 flex items-center gap-1.5">
                  <MapPin size={10} className="shrink-0" /> {form.lugar}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
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
