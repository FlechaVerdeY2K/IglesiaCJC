"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, BookOpen, Loader, Search, ChevronDown } from "lucide-react";
import { LIBROS, VERSIONES, DEFAULT_VERSION, getLibro, bibleApiUrl } from "@/lib/bible-books";

type Verse = { verse: number; text: string };

type Props = {
  initialLibro?: string;
  initialCapitulo?: number;
  highlightVersiculo?: number;
  inModal?: boolean;
};

export default function BibleReader({ initialLibro = "juan", initialCapitulo = 1, highlightVersiculo, inModal = false }: Props) {
  const router = useRouter();
  const [libro, setLibro] = useState(initialLibro);
  const [capitulo, setCapitulo] = useState(initialCapitulo);
  const [version, setVersion] = useState(DEFAULT_VERSION);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showBooks, setShowBooks] = useState(false);
  const [search, setSearch] = useState("");
  const highlightRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const libroData = getLibro(libro);
  const AT = LIBROS.filter(l => l.t === "AT");
  const NT = LIBROS.filter(l => l.t === "NT");
  const filteredAT = AT.filter(l => l.nombre.toLowerCase().includes(search.toLowerCase()));
  const filteredNT = NT.filter(l => l.nombre.toLowerCase().includes(search.toLowerCase()));
  const versionData = VERSIONES.find(v => v.id === version);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowBooks(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchChapter = async (l: string, c: number, v: string) => {
    setLoading(true);
    setError(false);
    setVerses([]);
    try {
      const res = await fetch(bibleApiUrl(l, c, v));
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setVerses(data.map((d: { verse: number; text: string }) => ({ verse: d.verse, text: d.text.replace(/<[^>]*>/g, "").trim() })));
      } else {
        throw new Error();
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChapter(libro, capitulo, version);
    if (!inModal) router.replace(`/biblia?libro=${libro}&capitulo=${capitulo}`, { scroll: false });
  }, [libro, capitulo, version]);

  useEffect(() => {
    if (highlightVersiculo && highlightRef.current) {
      setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
    }
  }, [verses, highlightVersiculo]);

  const selectLibro = (id: string) => {
    setLibro(id);
    setCapitulo(1);
    setShowBooks(false);
    setSearch("");
  };

  const prev = () => { if (capitulo > 1) setCapitulo(c => c - 1); };
  const next = () => { if (capitulo < libroData.caps) setCapitulo(c => c + 1); };

  return (
    <div className="flex flex-col gap-5">

      {/* ── Row 1: Libro + Versión ───────────────────────────── */}
      <div className="flex gap-3">
        {/* Book selector */}
        <div className="relative flex-1" ref={dropdownRef}>
          <button
            onClick={() => setShowBooks(v => !v)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-accent/40 transition-all text-left"
            style={{ background: "#0D1628" }}
          >
            <BookOpen size={15} className="text-accent shrink-0" />
            <span className="text-white font-semibold flex-1 truncate">{libroData.nombre}</span>
            <span className="text-white/25 text-[10px] uppercase tracking-wider shrink-0 hidden sm:block">
              {libroData.t === "AT" ? "A.T." : "N.T."}
            </span>
            <ChevronDown size={14} className={`text-white/30 shrink-0 transition-transform ${showBooks ? "rotate-180" : ""}`} />
          </button>

          {showBooks && (
            <div className="absolute top-full left-0 right-0 sm:right-auto sm:min-w-[420px] mt-1 rounded-xl border border-border z-50 shadow-2xl"
              style={{ background: "#0A1220" }}>
              {/* Search */}
              <div className="p-3 border-b border-white/5 sticky top-0" style={{ background: "#0A1220" }}>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    className="input w-full pl-8 text-sm py-2"
                    placeholder="Buscar libro..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {filteredAT.length > 0 && (
                  <div className="p-2">
                    <p className="text-white/25 text-[10px] font-black tracking-[3px] uppercase px-2 py-1.5">Antiguo Testamento</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5">
                      {filteredAT.map(l => (
                        <button key={l.id} onClick={() => selectLibro(l.id)}
                          className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${libro === l.id ? "bg-accent/20 text-accent font-semibold" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
                          {l.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {filteredNT.length > 0 && (
                  <div className="p-2 border-t border-white/5">
                    <p className="text-white/25 text-[10px] font-black tracking-[3px] uppercase px-2 py-1.5">Nuevo Testamento</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5">
                      {filteredNT.map(l => (
                        <button key={l.id} onClick={() => selectLibro(l.id)}
                          className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${libro === l.id ? "bg-accent/20 text-accent font-semibold" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
                          {l.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Version selector */}
        <div className="relative shrink-0">
          <select
            value={version}
            onChange={e => setVersion(e.target.value)}
            className="input h-full pl-3 pr-8 text-sm appearance-none cursor-pointer"
            style={{ background: "#0D1628", minWidth: "90px" }}
          >
            {VERSIONES.map(v => (
              <option key={v.id} value={v.id}>{v.id}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>
      </div>

      {/* ── Row 2: Capítulo ──────────────────────────────────── */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border" style={{ background: "#0D1628" }}>
        <button onClick={prev} disabled={capitulo <= 1}
          className="p-2 rounded-lg border border-white/10 hover:border-accent/40 text-white/50 hover:text-white disabled:opacity-25 transition-all shrink-0">
          <ChevronLeft size={16} />
        </button>

        <div className="flex-1 flex flex-wrap gap-1.5 justify-center">
          {Array.from({ length: Math.min(libroData.caps, 60) }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setCapitulo(n)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${capitulo === n ? "bg-accent text-white shadow-sm" : "text-white/40 hover:text-white hover:bg-white/8"}`}>
              {n}
            </button>
          ))}
          {libroData.caps > 60 && (
            <div className="flex items-center gap-1.5 ml-1">
              <span className="text-white/20 text-xs">ir a:</span>
              <input type="number" min={1} max={libroData.caps} value={capitulo}
                onChange={e => { const v = parseInt(e.target.value); if (v >= 1 && v <= libroData.caps) setCapitulo(v); }}
                className="input w-16 text-center text-sm py-1 px-2" />
            </div>
          )}
        </div>

        <button onClick={next} disabled={capitulo >= libroData.caps}
          className="p-2 rounded-lg border border-white/10 hover:border-accent/40 text-white/50 hover:text-white disabled:opacity-25 transition-all shrink-0">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Verses ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border relative overflow-hidden" style={{ background: "#0D1628" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
          <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(191,30,46,0.35))" }} />
          <div className="text-center">
            <p className="text-accent text-xs font-black tracking-widest uppercase">
              {libroData.nombre} {capitulo}
            </p>
            <p className="text-white/25 text-[10px] mt-0.5">{versionData?.nombre ?? version}</p>
          </div>
          <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(191,30,46,0.35))" }} />
        </div>

        <div className="px-4 sm:px-8 py-6 space-y-0.5">
          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader size={28} className="animate-spin text-accent/40" />
            </div>
          )}

          {error && (
            <div className="text-center py-24">
              <p className="text-white/30 text-sm">No se pudo cargar el capítulo.</p>
              <button onClick={() => fetchChapter(libro, capitulo, version)}
                className="mt-3 text-accent/60 hover:text-accent text-sm underline">
                Intentar de nuevo
              </button>
            </div>
          )}

          {!loading && !error && verses.map(v => {
            const isHighlight = v.verse === highlightVersiculo;
            return (
              <div key={v.verse} ref={isHighlight ? highlightRef : undefined}
                className={`flex gap-4 py-2.5 px-3 rounded-xl transition-colors group cursor-default ${isHighlight ? "bg-accent/10 border border-accent/20" : "hover:bg-white/[0.03]"}`}>
                <span className={`shrink-0 text-[11px] font-black mt-1.5 w-5 text-right select-none ${isHighlight ? "text-accent" : "text-white/15 group-hover:text-white/35"}`}>
                  {v.verse}
                </span>
                <p className={`leading-loose text-[15px] ${isHighlight ? "text-white" : "text-white/70"}`}
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  {v.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom navigation */}
        {!loading && verses.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-white/5">
            <button onClick={prev} disabled={capitulo <= 1}
              className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white disabled:opacity-20 transition-colors">
              <ChevronLeft size={15} />
              <span className="hidden sm:inline">{libroData.abr} {capitulo - 1}</span>
              <span className="sm:hidden">Anterior</span>
            </button>
            <span className="text-white/20 text-xs">{libroData.nombre} {capitulo} / {libroData.caps}</span>
            <button onClick={next} disabled={capitulo >= libroData.caps}
              className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white disabled:opacity-20 transition-colors">
              <span className="hidden sm:inline">{libroData.abr} {capitulo + 1}</span>
              <span className="sm:hidden">Siguiente</span>
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
