"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";

import { Check, ExternalLink, BookOpen, Loader, RefreshCw } from "lucide-react";
import { LIBROS, getLibro } from "@/lib/bible-books";

function getTodayCR(): string {
  const now = new Date(Date.now() - 6 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

function computeChapterPreview(libro: string, capitulo: number, fechaInicio: string, weeksAhead: number): number {
  const libroData = getLibro(libro);
  const effective = capitulo + weeksAhead;
  return ((effective - 1) % libroData.caps) + 1;
}


const AT = LIBROS.filter(l => l.t === "AT");
const NT = LIBROS.filter(l => l.t === "NT");

type Verse = { verse: number; text: string };

export default function AdminBiblia() {
  const [libro, setLibro] = useState("juan");
  const [capitulo, setCapitulo] = useState(3);
  const [versiculo, setVersiculo] = useState(16);
  const [titulo, setTitulo] = useState("");
  const [activo, setActivo] = useState(true);
  const [autoAvance, setAutoAvance] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(getTodayCR());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);

  const libroData = getLibro(libro);

  // Load saved config
  useEffect(() => {
    supabase.from("config_biblia").select("*").eq("id", 1).single().then(({ data }: { data: { libro?: string; capitulo?: number; versiculo?: number; titulo?: string; activo?: boolean; auto_avance?: boolean; fecha_inicio?: string | null } | null }) => {
      if (data) {
        setLibro(data.libro ?? "juan");
        setCapitulo(data.capitulo ?? 3);
        setVersiculo(data.versiculo ?? 16);
        setTitulo(data.titulo ?? "");
        setActivo(data.activo ?? true);
        setAutoAvance(data.auto_avance ?? false);
        setFechaInicio(data.fecha_inicio ?? getTodayCR());
      }
    });
  }, []);

  // Fetch verses when libro/capitulo changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingVerses(true);
      setVerses([]);
      const libroInfo = getLibro(libro);
      fetch(`/api/bible?t=RV1960&b=${libroInfo.num}&c=${capitulo}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setVerses(data.map((d: { verse: number; text: string }) => ({
              verse: d.verse,
              text: d.text.replace(/<[^>]*>/g, "").trim(),
            })));
          }
        })
        .catch(() => {})
        .finally(() => setLoadingVerses(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [libro, capitulo]);

  const save = async () => {
    setSaving(true);
    await supabase.from("config_biblia").upsert({
      id: 1, libro, capitulo, versiculo, titulo, activo,
      auto_avance: autoAvance,
      fecha_inicio: autoAvance ? fechaInicio : null,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const selectedVerse = verses.find(v => v.verse === versiculo);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Lectura del Domingo</h1>
          <p className="text-white/40 text-sm mt-1">Selecciona el versículo de la semana que aparece en el inicio</p>
        </div>
        <a href={`/biblia?libro=${libro}&capitulo=${capitulo}&versiculo=${versiculo}`} target="_blank"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-white/50 hover:text-white hover:border-white/20 transition-all">
          <ExternalLink size={14} /> Ver
        </a>
      </div>

      <div className="rounded-2xl border border-border p-6 space-y-6" style={{ background: "#0D1628" }}>

        {/* Libro */}
        <div>
          <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Libro</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/25 text-[10px] font-bold tracking-wider uppercase mb-1.5">Antiguo Testamento</p>
              <select
                className="input w-full"
                value={AT.some(l => l.id === libro) ? libro : ""}
                onChange={e => { if (e.target.value) { setLibro(e.target.value); setCapitulo(1); setVersiculo(1); } }}
              >
                <option value="">— Seleccionar —</option>
                {AT.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
            </div>
            <div>
              <p className="text-white/25 text-[10px] font-bold tracking-wider uppercase mb-1.5">Nuevo Testamento</p>
              <select
                className="input w-full"
                value={NT.some(l => l.id === libro) ? libro : ""}
                onChange={e => { if (e.target.value) { setLibro(e.target.value); setCapitulo(1); setVersiculo(1); } }}
              >
                <option value="">— Seleccionar —</option>
                {NT.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Capítulo */}
        <div>
          <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">
            Capítulo <span className="text-white/25 normal-case">(1 – {libroData.caps})</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: Math.min(libroData.caps, 50) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => { setCapitulo(n); setVersiculo(1); }}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${capitulo === n ? "bg-accent text-white" : "text-white/40 hover:text-white border border-white/10 hover:border-white/30"}`}
                style={capitulo !== n ? { background: "#080E1E" } : {}}>
                {n}
              </button>
            ))}
            {libroData.caps > 50 && (
              <input type="number" min={1} max={libroData.caps} value={capitulo}
                onChange={e => { setCapitulo(Math.min(libroData.caps, Math.max(1, parseInt(e.target.value) || 1))); setVersiculo(1); }}
                className="input w-20 text-center" />
            )}
          </div>
        </div>

        {/* Versículo */}
        <div>
          <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">
            Versículo
            {loadingVerses && <span className="ml-2 text-white/20 normal-case text-[10px]">cargando...</span>}
          </label>

          {loadingVerses ? (
            <div className="flex items-center gap-2 py-4">
              <Loader size={14} className="animate-spin text-accent/40" />
              <span className="text-white/30 text-sm">Cargando versículos...</span>
            </div>
          ) : verses.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {verses.map(v => (
                <button key={v.verse} onClick={() => setVersiculo(v.verse)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${versiculo === v.verse ? "bg-accent text-white" : "text-white/40 hover:text-white border border-white/10 hover:border-white/30"}`}
                  style={versiculo !== v.verse ? { background: "#080E1E" } : {}}>
                  {v.verse}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-white/20 text-sm">No se pudieron cargar los versículos</p>
          )}

          {/* Preview del versículo */}
          {selectedVerse && (
            <div className="mt-4 p-4 rounded-xl border border-white/8" style={{ background: "#080E1E" }}>
              <p className="text-white/25 text-[10px] uppercase tracking-wider mb-2">
                {libroData.nombre} {capitulo}:{versiculo}
              </p>
              <p className="text-white/70 text-sm leading-relaxed italic" style={{ fontFamily: "Georgia, serif" }}>
                &quot;{selectedVerse.text}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Título descriptivo */}
        <div>
          <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">
            Título <span className="text-white/25 normal-case">(opcional)</span>
          </label>
          <input className="input w-full" placeholder={`${libroData.nombre} ${capitulo}:${versiculo}`}
            value={titulo} onChange={e => setTitulo(e.target.value)} />
        </div>

        {/* Preview banner */}
        <div className="p-4 rounded-xl border border-accent/20 flex items-start gap-3"
          style={{ background: "rgba(191,30,46,0.05)" }}>
          <BookOpen size={20} className="text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Vista previa del banner</p>
            <p className="text-white font-bold">{titulo || `${libroData.nombre} ${capitulo}:${versiculo}`}</p>
            {selectedVerse && (
              <p className="text-white/50 text-xs mt-1.5 italic leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
                &quot;{selectedVerse.text.length > 120 ? selectedVerse.text.slice(0, 120) + "…" : selectedVerse.text}&quot;
              </p>
            )}
            <p className="text-accent text-xs mt-2">{libroData.nombre} · {capitulo}:{versiculo} · RV1960</p>
          </div>
        </div>

        {/* Auto-avance dominical */}
        <div className="space-y-3 rounded-xl border border-white/8 p-4" style={{ background: "#080E1E" }}>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setAutoAvance(v => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${autoAvance ? "bg-accent" : "bg-white/10"}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${autoAvance ? "left-5" : "left-0.5"}`} />
            </button>
            <div>
              <span className="text-white/80 text-sm font-semibold flex items-center gap-1.5">
                <RefreshCw size={13} className="text-accent" /> Auto-avance cada domingo
              </span>
              <p className="text-white/30 text-xs">El capítulo sube solo cada 7 días</p>
            </div>
          </div>

          {autoAvance && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">
                  Domingo de referencia <span className="normal-case text-white/25">(el cap. {capitulo} se lee este día)</span>
                </label>
                <input type="date" className="input" value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)} />
              </div>

              {/* Preview próximos domingos */}
              <div>
                <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Próximos 4 domingos</p>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map(w => {
                    const cap = computeChapterPreview(libro, capitulo, fechaInicio, w);
                    const [fy, fm, fd] = fechaInicio.split("-").map(Number);
                    const dateMs = Date.UTC(fy, fm - 1, fd) + w * 7 * 24 * 60 * 60 * 1000;
                    const label = new Date(dateMs).toLocaleDateString("es", { day: "numeric", month: "short" });
                    return (
                      <div key={w} className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/5" style={{ background: "#0D1628" }}>
                        <span className="text-white/30 text-xs">{label}</span>
                        <span className="text-white/80 text-xs font-bold">{getLibro(libro).abr} {cap}</span>
                      </div>
                    );
                  })}
                </div>
                {capitulo + 3 > getLibro(libro).caps && (
                  <p className="text-accent/70 text-xs mt-2">⚠ Cerca del último capítulo — volverá al capítulo 1 automáticamente.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Activo */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setActivo(v => !v)}
            className={`relative w-10 h-5 rounded-full transition-colors ${activo ? "bg-accent" : "bg-white/10"}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${activo ? "left-5" : "left-0.5"}`} />
          </button>
          <span className="text-white/60 text-sm">{activo ? "Visible en el inicio" : "Oculto"}</span>
        </div>

        <button onClick={save} disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          <Check size={15} />
          {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar lectura del Domingo"}
        </button>
      </div>
    </div>
  );
}
