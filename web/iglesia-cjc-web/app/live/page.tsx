"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";

import { Radio, Clock, ChevronRight } from "lucide-react";


type LiveStatus = { isLive: boolean; videoId: string | null; title: string | null };
type ConfigLive = { activo: boolean; video_id: string | null; titulo: string | null; descripcion: string | null; manual_override: boolean };
type LiveHistory = { id: string; video_id: string; titulo: string | null; descripcion: string | null; fecha: string };

export default function LivePage() {
  const [autoLive, setAutoLive] = useState<LiveStatus>({ isLive: false, videoId: null, title: null });
  const [config, setConfig] = useState<ConfigLive | null>(null);
  const [history, setHistory] = useState<LiveHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Fetch config (manual override) and history in parallel
      const [configRes, historyRes, youtubeRes] = await Promise.all([
        supabase.from("config_live").select("*").eq("id", 1).single(),
        supabase.from("lives").select("*").order("fecha", { ascending: false }).limit(12),
        fetch("/api/live-status").then(r => r.json()).catch(() => ({ isLive: false, videoId: null })),
      ]);
      setConfig(configRes.data);
      setHistory(historyRes.data ?? []);
      setAutoLive(youtubeRes);
      setLoading(false);
    };
    load();
    // Poll every 2 minutes
    const interval = setInterval(() => {
      fetch("/api/live-status").then(r => r.json()).then(setAutoLive).catch(() => {});
    }, 120_000);
    return () => clearInterval(interval);
  }, []);

  // Determine what to show: activo/manual_override takes priority over auto
  const showManual = (config?.activo || config?.manual_override) && config?.video_id;
  const showAuto = !showManual && autoLive.isLive && autoLive.videoId;
  const activeVideoId = showManual ? config!.video_id : showAuto ? autoLive.videoId : null;
  const activeTitle = showManual ? config?.titulo : autoLive.title;
  const activeDesc = showManual ? config?.descripcion : null;
  const isLiveNow = showManual || showAuto;

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Transmisión</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">En Vivo</h1>
      <p className="text-muted mb-10">Sigue nuestros servicios en tiempo real.</p>

      {isLiveNow && activeVideoId ? (
        <div className="mb-16">
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border mb-5">
            <iframe
              src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
              title={activeTitle ?? "En Vivo"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen className="w-full h-full"
            />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
              <Radio size={10} /> EN VIVO
            </span>
            {showManual && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full border border-white/10 text-white/40 uppercase tracking-wider">
                Manual
              </span>
            )}
            <h2 className="font-bold text-white text-xl">{activeTitle}</h2>
          </div>
          {activeDesc && <p className="text-muted">{activeDesc}</p>}
        </div>
      ) : (
        <div className="card text-center py-20 mb-16">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(191,30,46,0.1)" }}>
            <Radio className="text-accent" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No hay transmisión activa</h2>
          <p className="text-muted max-w-md mx-auto text-sm">
            Cuando haya un servicio en vivo, aparecerá aquí automáticamente.
          </p>
        </div>
      )}

      {/* Past lives */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-5 rounded-full bg-accent" />
            <h2 className="text-xl font-bold text-white">Lives anteriores</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map(live => (
              <a key={live.id} href={`https://youtube.com/watch?v=${live.video_id}`}
                target="_blank" rel="noopener noreferrer"
                className="group rounded-2xl overflow-hidden border border-border hover:border-accent/30 transition-all"
                style={{ background: "#0D1628" }}>
                <div className="relative aspect-video bg-black">
                  <img
                    src={`https://img.youtube.com/vi/${live.video_id}/hqdefault.jpg`}
                    alt={live.titulo ?? ""}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center">
                      <ChevronRight size={20} className="text-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-white font-semibold text-sm line-clamp-2">{live.titulo ?? "Sin título"}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-white/30 text-xs">
                    <Clock size={10} />
                    {new Date(live.fecha).toLocaleDateString("es-CR", { timeZone: "America/Costa_Rica", day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
