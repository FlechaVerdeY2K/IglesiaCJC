import { supabase, type Recurso } from "@/lib/supabase";
import { FileText, Headphones, Video, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recursos",
  description: "Recursos cristianos de Iglesia CJC: PDFs, audios y videos para tu formación.",
  alternates: {
    canonical: "/recursos",
  },
};

const iconoTipo = { pdf: FileText, audio: Headphones, video: Video } as const;
const colorTipo = { pdf: "text-red-400", audio: "text-purple-400", video: "text-blue-400" } as const;

export default async function RecursosPage() {
  const { data } = await supabase
    .from("recursos")
    .select("*")
    .order("fecha", { ascending: false });

  const recursos = (data ?? []) as Recurso[];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Material</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">Recursos</h1>
      <p className="text-muted mb-12">PDFs, audios y videos para tu crecimiento espiritual.</p>

      {recursos.length === 0 ? (
        <p className="text-muted text-center py-20">No hay recursos disponibles aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recursos.map((r) => {
            const tipo = r.tipo as keyof typeof iconoTipo;
            const Icono = iconoTipo[tipo] ?? FileText;
            const color = colorTipo[tipo] ?? "text-muted";
            return (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card group hover:border-accent transition-colors flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icono className={color} size={24} />
                  <span className={`text-xs font-semibold uppercase ${color}`}>{r.tipo}</span>
                </div>
                <h3 className="font-semibold text-white group-hover:text-accent transition-colors mb-2 flex-1">
                  {r.titulo}
                </h3>
                <p className="text-muted text-sm mb-4 line-clamp-2">{r.descripcion}</p>
                <div className="flex items-center gap-2 text-accent text-sm font-medium">
                  <ExternalLink size={14} />
                  Abrir recurso
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
