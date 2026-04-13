"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";
import Image from "next/image";

import { Radio, ToggleLeft, ToggleRight, Archive, Trash2, Plus, Check, X } from "lucide-react";


type ConfigLive = { activo: boolean; video_id: string | null; titulo: string | null; descripcion: string | null; manual_override: boolean };
type LiveHistory = { id: string; video_id: string; titulo: string | null; fecha: string };
type AutoLive = { isLive: boolean; videoId: string | null; title: string | null };

export default function AdminLive() {
  const [config, setConfig] = useState<ConfigLive>({ activo: false, video_id: "", titulo: "", descripcion: "", manual_override: false });
  const [autoLive, setAutoLive] = useState<AutoLive>({ isLive: false, videoId: null, title: null });
  const [history, setHistory] = useState<LiveHistory[]>([]);
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [newLive, setNewLive] = useState({ video_id: "", titulo: "", descripcion: "", fecha: new Date().toISOString().split("T")[0] });

  const load = async () => {
    const [configRes, histRes, ytRes] = await Promise.all([
      supabase.from("config_live").select("*").eq("id", 1).single(),
      supabase.from("lives").select("*").order("fecha", { ascending: false }),
      fetch("/api/live-status").then(r => r.json()).catch(() => ({ isLive: false, videoId: null })),
    ]);
    if (configRes.data) setConfig(configRes.data);
    setHistory(histRes.data ?? []);
    setAutoLive(ytRes);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    await supabase.from("config_live").upsert({ id: 1, ...config });
    setSaving(false);
  };

  const archiveCurrent = async () => {
    const videoId = config.manual_override ? config.video_id : autoLive.videoId;
    const title = config.manual_override ? config.titulo : autoLive.title;
    if (!videoId) return;
    setArchiving(true);
    await supabase.from("lives").insert({ video_id: videoId, titulo: title, fecha: new Date().toISOString() });
    setArchiving(false);
    load();
  };

  const archiveManual = async () => {
    await supabase.from("lives").insert({
      video_id: newLive.video_id,
      titulo: newLive.titulo,
      descripcion: newLive.descripcion,
      fecha: new Date(newLive.fecha).toISOString(),
    });
    setAddModal(false);
    setNewLive({ video_id: "", titulo: "", descripcion: "", fecha: new Date().toISOString().split("T")[0] });
    load();
  };

  const removeHistory = async (id: string) => {
    if (!confirm("¿Eliminar del historial?")) return;
    await supabase.from("lives").delete().eq("id", id);
    load();
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">En Vivo</h1>
        <p className="text-white/40 text-sm mt-1">Gestiona la transmisión en vivo del canal</p>
      </div>

      {/* Auto detection status */}
      <div className="p-5 rounded-2xl border mb-4" style={{ background: "#0D1628", borderColor: autoLive.isLive ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${autoLive.isLive ? "bg-green-400 animate-pulse" : "bg-white/20"}`} />
          <div>
            <p className="text-white font-semibold text-sm">Detección automática (YouTube)</p>
            {autoLive.isLive
              ? <p className="text-green-400 text-xs mt-0.5">Canal en vivo: {autoLive.title}</p>
              : <p className="text-white/30 text-xs mt-0.5">No se detecta transmisión activa en el canal</p>
            }
          </div>
          <button onClick={load} className="ml-auto text-xs text-white/30 hover:text-white transition-colors">Actualizar</button>
        </div>
      </div>

      {/* Manual override */}
      <div className="p-5 rounded-2xl border mb-6" style={{ background: "#0D1628", borderColor: config.activo ? "rgba(191,30,46,0.4)" : "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3 mb-4">
          <Radio size={16} className={config.activo ? "text-accent" : "text-white/30"} />
          <div>
            <p className="text-white font-semibold">Live manual</p>
            <p className="text-white/30 text-xs">Activa para mostrar un video específico</p>
          </div>
          <button onClick={async () => {
            const updated = { ...config, activo: !config.activo };
            setConfig(updated);
            await supabase.from("config_live").upsert({ id: 1, ...updated });
          }} className="ml-auto">
            {config.activo
              ? <ToggleRight size={32} className="text-accent" />
              : <ToggleLeft size={32} className="text-white/30" />
            }
          </button>
        </div>
        {config.activo && (
          <p className="text-xs text-accent/80 mb-4 bg-accent/10 px-3 py-2 rounded-lg border border-accent/20">
            Live activo — se mostrará el video configurado en la página pública
          </p>
        )}
        <div className="space-y-3">
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Video ID de YouTube</label>
            <input className="input w-full" placeholder="Ej: dQw4w9WgXcQ"
              value={config.video_id ?? ""} onChange={e => setConfig(p => ({ ...p, video_id: e.target.value }))} />
            <p className="text-white/20 text-xs mt-1">La parte final de la URL: youtube.com/watch?v=<strong className="text-white/30">ESTE_ID</strong></p>
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Título</label>
            <input className="input w-full" placeholder="Nombre del servicio..."
              value={config.titulo ?? ""} onChange={e => setConfig(p => ({ ...p, titulo: e.target.value }))} />
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Descripción</label>
            <textarea className="input w-full h-20 resize-none" placeholder="Descripción opcional..."
              value={config.descripcion ?? ""} onChange={e => setConfig(p => ({ ...p, descripcion: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <button onClick={saveConfig} disabled={saving}
              className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
              <Check size={14} /> {saving ? "Guardando..." : "Guardar"}
            </button>
            {(config.video_id || autoLive.videoId) && (
              <button onClick={archiveCurrent} disabled={archiving}
                className="btn-secondary flex items-center gap-1.5 py-2 px-4 text-sm">
                <Archive size={14} /> {archiving ? "Archivando..." : "Archivar en historial"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold">Historial de lives</h2>
        <button onClick={() => setAddModal(true)} className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 px-3">
          <Plus size={13} /> Agregar manual
        </button>
      </div>
      <div className="space-y-2">
        {history.length === 0 && <p className="text-white/30 text-sm">Sin historial aún.</p>}
        {history.map(l => (
          <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl border border-border" style={{ background: "#0D1628" }}>
            <Image src={`https://img.youtube.com/vi/${l.video_id}/default.jpg`} className="w-16 h-10 rounded-lg object-cover" alt="" width={64} height={40} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{l.titulo ?? "Sin título"}</p>
              <p className="text-white/30 text-xs">{new Date(l.fecha).toLocaleDateString("es-CR", { timeZone: "America/Costa_Rica" })}</p>
            </div>
            <button onClick={() => removeHistory(l.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md rounded-2xl border border-border p-6 space-y-4" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Agregar al historial</h2>
              <button onClick={() => setAddModal(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Video ID</label>
              <input className="input w-full" value={newLive.video_id} onChange={e => setNewLive(p => ({ ...p, video_id: e.target.value }))} />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Título</label>
              <input className="input w-full" value={newLive.titulo} onChange={e => setNewLive(p => ({ ...p, titulo: e.target.value }))} />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Fecha</label>
              <input type="date" className="input w-full" value={newLive.fecha} onChange={e => setNewLive(p => ({ ...p, fecha: e.target.value }))} />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setAddModal(false)} className="btn-secondary py-2 px-4 text-sm">Cancelar</button>
              <button onClick={archiveManual} disabled={!newLive.video_id} className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
                <Check size={14} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
