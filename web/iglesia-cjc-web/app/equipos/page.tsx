"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Layers, PlusCircle } from "lucide-react";

type Temporada = {
  numero: number;
  titulo: string;
  descripcion: string;
  foto_portada: string | null;
  estado: "futura" | "activa" | "concluida";
};

export default function EquiposLanding() {
  const [temporadas, setTemporadas] = useState<Temporada[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [tempRes, gpsRes] = await Promise.all([
        supabase.from("temporadas").select("*").order("numero"),
        supabase.from("equipos").select("temporada").eq("tipo", "gps"),
      ]);

      setTemporadas((tempRes.data ?? []) as Temporada[]);

      const byTemporada: Record<number, number> = {};
      for (const row of (gpsRes.data ?? []) as Array<{ temporada: number | null }>) {
        if (row.temporada) byTemporada[row.temporada] = (byTemporada[row.temporada] ?? 0) + 1;
      }
      setCounts(byTemporada);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Comunidad</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">GPS — Grupos Pequeños Saludables</h1>
      <p className="text-muted mb-6 max-w-2xl leading-relaxed">
        Nuestro deseo es que cada persona en CJC esté conectada a nuestra comunidad a través de Grupos Pequeños. Con tantas opciones de grupos para escoger, creemos que hay un grupo por tema, locación, día y hora en el directorio de Grupos Pequeños Saludables (GPS).
      </p>

      <Link
        href="/equipos/registrar"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-10 text-sm font-semibold text-accent border border-accent/30 bg-accent/10 hover:bg-accent/15 transition-all"
      >
        <PlusCircle size={15} /> Solicitud de Apertura GPS
      </Link>

      {loading ? (
        <p className="text-white/30 text-sm">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {temporadas.map((t) => {
            const count = counts[t.numero] ?? 0;
            return (
              <Link
                key={t.numero}
                href={`/equipos/${t.numero}`}
                className={`group relative rounded-2xl overflow-hidden border transition-all ${
                  t.estado === "activa"
                    ? "border-border hover:border-accent/50"
                    : "border-border/50 hover:border-white/20 opacity-70 hover:opacity-90"
                }`}
                style={{ background: "#0D1628" }}
              >
                <div className="relative w-full overflow-hidden" style={{ background: "#0a1020" }}>
                  {t.foto_portada ? (
                    <Image
                      src={t.foto_portada}
                      alt={t.titulo || `Temporada ${t.numero}`}
                      width={1200}
                      height={1200}
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="w-full h-auto block"
                    />
                  ) : (
                    <div className="aspect-[16/9] w-full flex items-center justify-center">
                      <Layers size={56} className="text-accent/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-accent/20 text-accent border border-accent/30">
                      Temporada {t.numero}
                    </span>
                    {t.estado === "activa" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Activa
                      </span>
                    )}
                    {t.estado === "concluida" && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/50 border border-white/10">
                        Concluida
                      </span>
                    )}
                    {t.estado === "futura" && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Próximamente
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-xl truncate">{t.titulo || `Temporada ${t.numero}`}</h3>
                    {(() => {
                      if (t.estado === "concluida") {
                        return <p className="text-white/40 text-sm mt-1">GPS concluido</p>;
                      }
                      if (t.estado === "futura") {
                        return <p className="text-white/40 text-sm mt-1">GPS no activo aún</p>;
                      }
                      return <p className="text-accent/90 text-sm mt-1 font-semibold">{count} GPS disponible{count === 1 ? "" : "s"}</p>;
                    })()}
                  </div>
                  <div className="shrink-0 text-white/30 group-hover:text-accent group-hover:translate-x-1 transition-all pt-1">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
