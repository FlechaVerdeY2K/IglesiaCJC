import { supabase, type Sermon } from "@/lib/supabase";
import { Play } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sermones",
  description: "Sermones y prédicas de Iglesia CJC para fortalecer tu fe.",
  alternates: {
    canonical: "/sermones",
  },
};

export default async function SermonesPage() {
  const { data } = await supabase
    .from("sermones")
    .select("*")
    .eq("activo", true)
    .order("fecha", { ascending: false });

  const sermones = (data ?? []) as Sermon[];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Palabra de Dios</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">Sermones</h1>
      <p className="text-muted mb-12">Escucha y aprende de la Palabra de Dios.</p>

      {sermones.length === 0 ? (
        <p className="text-muted text-center py-20">No hay sermones disponibles aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sermones.map((s) => (
            <a
              key={s.id}
              href={`https://www.youtube.com/watch?v=${s.video_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="card group hover:border-accent transition-colors block"
            >
              <div className="aspect-video bg-border rounded-lg mb-4 overflow-hidden relative">
                <img
                  src={`https://img.youtube.com/vi/${s.video_id}/hqdefault.jpg`}
                  alt={s.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-accent rounded-full p-3">
                    <Play className="text-white" size={28} />
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-accent transition-colors">
                {s.titulo}
              </h3>
              <p className="text-muted text-sm mb-1">{s.predicador}</p>
              {s.descripcion && <p className="text-muted text-xs line-clamp-2 mt-2">{s.descripcion}</p>}
              <p className="text-muted text-xs mt-3">
                {new Date(s.fecha).toLocaleDateString("es", { timeZone: "America/Costa_Rica", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
