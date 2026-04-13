"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState, useRef } from "react";

import { Plus, Pencil, Trash2, X, Check, Upload, MapPin, Tag, Settings, ChevronLeft } from "lucide-react";
import { todayCR } from "@/lib/date";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });


const FALLBACK_LAT = 9.95239;
const FALLBACK_LNG = -84.05036;
const CLOUDINARY_CLOUD = "djfnlzs0g";
const CLOUDINARY_PRESET = "cjc_uploads";

function extractCoordsFromWaze(wazeUrl: string | null): { lat: number; lng: number; lugar: string } | null {
  if (!wazeUrl) return null;
  const m = wazeUrl.match(/ll=([\d.\-]+),([\d.\-]+)/);
  if (!m) return null;
  return { lat: parseFloat(m[1]), lng: parseFloat(m[2]), lugar: "Iglesia CJC" };
}

type Evento = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string | null;
  lugar: string | null;
  image_url: string | null;
  lat: number | null;
  lng: number | null;
  activo: boolean;
  tipo: string | null;
};

type TipoEvento = { id: string; nombre: string; orden: number };

const EMPTY: Omit<Evento, "id"> = {
  titulo: "", descripcion: "", fecha: "", hora: "",
  lugar: "Calle El Jocote, INVU Coronado, San José",
  image_url: "", lat: FALLBACK_LAT, lng: FALLBACK_LNG,
  activo: true, tipo: null,
};

type Tab = "proximos" | "anteriores";

export default function AdminEventos() {
  const [tab, setTab] = useState<Tab>("proximos");
  const [items, setItems] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [tiposModal, setTiposModal] = useState(false);
  const [form, setForm] = useState<Omit<Evento, "id">>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tipos, setTipos] = useState<TipoEvento[]>([]);
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [savingTipo, setSavingTipo] = useState(false);
  const [churchDefault, setChurchDefault] = useState<{ lat: number; lng: number; lugar: string }>({
    lat: FALLBACK_LAT, lng: FALLBACK_LNG, lugar: "Iglesia CJC",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const today = todayCR();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("eventos").select("*").order("fecha", { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  };

  const loadTipos = async () => {
    const { data } = await supabase.from("tipo_eventos").select("*").order("orden");
    setTipos(data ?? []);
  };

  const loadChurch = async () => {
    const { data } = await supabase.from("config_home").select("waze_url, google_maps_url").eq("id", 1).single();
    const coords = extractCoordsFromWaze(data?.waze_url ?? null);
    if (coords) setChurchDefault(coords);
  };

  useEffect(() => { load(); loadTipos(); loadChurch(); }, []);

  const proximos = items.filter(e => e.activo && e.fecha >= today);
  const anteriores = items.filter(e => !e.activo || e.fecha < today);

  const openNew = () => {
    setForm({ ...EMPTY, lat: churchDefault.lat, lng: churchDefault.lng, lugar: churchDefault.lugar });
    setEditing(null);
    setModal(true);
  };;
  const openEdit = (e: Evento) => {
    const { id, ...rest } = e;
    setForm({
      titulo: rest.titulo ?? "",
      descripcion: rest.descripcion ?? "",
      fecha: rest.fecha ?? "",
      hora: rest.hora ?? "",
      lugar: rest.lugar ?? "Calle El Jocote, INVU Coronado, San José",
      image_url: rest.image_url ?? "",
      lat: rest.lat ?? FALLBACK_LAT,
      lng: rest.lng ?? FALLBACK_LNG,
      activo: rest.activo ?? true,
      tipo: rest.tipo ?? null,
    });
    setEditing(id);
    setModal(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    fd.append("folder", "eventos");
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
      method: "POST", body: fd,
    });
    const data = await res.json();
    if (data.secure_url) setForm(p => ({ ...p, image_url: data.secure_url }));
    setUploading(false);
  };

  const save = async () => {
    if (!form.titulo || !form.fecha) return;
    setSaving(true);
    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      fecha: form.fecha,
      hora: form.hora || null,
      lugar: form.lugar || null,
      image_url: form.image_url || null,
      lat: form.lat,
      lng: form.lng,
      activo: form.activo,
      tipo: form.tipo || null,
    };
    if (editing) {
      await supabase.from("eventos").update(payload).eq("id", editing);
    } else {
      await supabase.from("eventos").insert(payload);
    }
    setSaving(false); setModal(false); load();
  };

  const remove = async (ev: Evento) => {
    if (!confirm("¿Eliminar este evento?")) return;
    await supabase.from("eventos").delete().eq("id", ev.id);
    load();
  };

  const toggleActivo = async (ev: Evento) => {
    await supabase.from("eventos").update({ activo: !ev.activo }).eq("id", ev.id);
    load();
  };

  const addTipo = async () => {
    if (!nuevoTipo.trim()) return;
    setSavingTipo(true);
    await supabase.from("tipo_eventos").insert({ nombre: nuevoTipo.trim(), orden: tipos.length });
    setNuevoTipo("");
    await loadTipos();
    setSavingTipo(false);
  };

  const removeTipo = async (id: string) => {
    await supabase.from("tipo_eventos").delete().eq("id", id);
    loadTipos();
  };

  const current = tab === "proximos" ? proximos : anteriores;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Eventos</h1>
          <p className="text-white/40 text-sm mt-1">{proximos.length} próximos · {anteriores.length} anteriores</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTiposModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-white/50 hover:text-white hover:border-white/20 transition-all"
          >
            <Tag size={14} /> Tipos
          </button>
          <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
            <Plus size={14} /> Nuevo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl border border-border w-fit" style={{ background: "#0A1020" }}>
        {(["proximos", "anteriores"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? "bg-accent text-white" : "text-white/40 hover:text-white"
            }`}
          >
            {t === "proximos" ? "Próximos" : "Anteriores"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-white/30 text-sm">Cargando...</p>
        ) : current.length === 0 ? (
          <p className="text-white/30 text-sm py-10 text-center">No hay eventos en esta sección.</p>
        ) : current.map(ev => {
          const isPast = ev.fecha < today;
          return (
            <div key={ev.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              isPast ? "border-white/5 opacity-60" : "border-border"
            }`} style={{ background: "#0D1628" }}>
              {ev.image_url
                ? <img src={ev.image_url} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
                : <div className="w-16 h-16 rounded-xl bg-white/5 shrink-0 flex items-center justify-center">
                    <MapPin size={18} className="text-white/20" />
                  </div>
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-semibold truncate">{ev.titulo}</p>
                  {ev.tipo && (
                    <span className="text-xs px-2 py-0.5 rounded-full border border-accent/30 text-accent/80 shrink-0">
                      {ev.tipo}
                    </span>
                  )}
                  {isPast && (
                    <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/30 shrink-0">
                      Vencido
                    </span>
                  )}
                </div>
                <p className="text-white/40 text-xs mt-0.5">
                  {ev.fecha}{ev.hora ? ` · ${ev.hora}` : ""}{ev.lugar ? ` · ${ev.lugar}` : ""}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 items-center">
                <button
                  onClick={() => toggleActivo(ev)}
                  title={ev.activo ? "Ocultar" : "Activar"}
                  className={`p-2 rounded-lg text-xs transition-colors ${
                    ev.activo ? "text-green-400 hover:bg-green-500/10" : "text-white/25 hover:bg-white/5 hover:text-white/60"
                  }`}
                >
                  {ev.activo ? "●" : "○"}
                </button>
                <button onClick={() => openEdit(ev)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(ev)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-2xl rounded-2xl border border-border p-6 space-y-4 overflow-y-auto max-h-[90vh]" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editing ? "Editar evento" : "Nuevo evento"}</h2>
              <button onClick={() => setModal(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            {/* Tipo */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Tipo de evento</label>
              <div className="flex flex-wrap gap-2">
                {tipos.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, tipo: p.tipo === t.nombre ? null : t.nombre }))}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      form.tipo === t.nombre
                        ? "bg-accent border-accent text-white"
                        : "border-border text-white/50 hover:text-white hover:border-white/30"
                    }`}
                  >
                    {t.nombre}
                  </button>
                ))}
                {tipos.length === 0 && (
                  <p className="text-white/30 text-xs">Sin tipos — crea uno con el botón "Tipos"</p>
                )}
              </div>
            </div>

            {/* Titulo */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Título *</label>
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
                <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Fecha *</label>
                <input type="date" className="input w-full" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
              </div>
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Hora</label>
                <input type="time" className="input w-full" value={form.hora ?? ""} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))} />
              </div>
            </div>

            {/* Imagen */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Imagen del evento</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }} />
              <div className="flex gap-3 items-start">
                {form.image_url && (
                  <div className="relative">
                    <img src={form.image_url} className="w-20 h-20 rounded-xl object-cover border border-border" alt="" />
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, image_url: "" }))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-white/60 hover:text-white hover:border-white/30 text-sm transition-all w-full">
                    <Upload size={14} />
                    {uploading ? "Subiendo..." : form.image_url ? "Cambiar imagen" : "Subir imagen"}
                  </button>
                  <input className="input w-full text-xs" placeholder="O pega una URL"
                    value={form.image_url ?? ""}
                    onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">
                Ubicación
              </label>
              <MapPicker
                key={editing ?? "new"}
                lat={form.lat ?? churchDefault.lat}
                lng={form.lng ?? churchDefault.lng}
                onChange={(lat, lng, address) => setForm(p => ({ ...p, lat, lng, lugar: address }))}
              />
              {form.lugar && (
                <p className="text-white/40 text-xs mt-2 flex items-center gap-1.5">
                  <MapPin size={10} className="shrink-0" /> {form.lugar}
                </p>
              )}
            </div>

            {/* Activo toggle */}
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
              <button onClick={save} disabled={saving || !form.titulo || !form.fecha}
                className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm disabled:opacity-50">
                <Check size={14} /> {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tipos de evento modal */}
      {tiposModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md rounded-2xl border border-border p-6 space-y-4" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Tipos de evento</h2>
              <button onClick={() => setTiposModal(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-2">
              {tipos.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                  <span className="text-white text-sm">{t.nombre}</span>
                  <button onClick={() => removeTipo(t.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {tipos.length === 0 && <p className="text-white/30 text-sm text-center py-4">Sin tipos aún.</p>}
            </div>

            <div className="flex gap-2">
              <input
                className="input flex-1 text-sm"
                placeholder="Nuevo tipo (ej: Bautizo)"
                value={nuevoTipo}
                onChange={e => setNuevoTipo(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addTipo(); }}
              />
              <button onClick={addTipo} disabled={savingTipo || !nuevoTipo.trim()}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-50 flex items-center gap-1.5">
                <Plus size={14} /> {savingTipo ? "..." : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
