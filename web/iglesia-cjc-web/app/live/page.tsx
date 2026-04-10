import { supabase, type ConfigLive } from "@/lib/supabase";
import { Radio } from "lucide-react";

export default async function LivePage() {
  const { data } = await supabase.from("config_live").select("*").eq("id", 1).single();
  const live = data as ConfigLive | null;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Transmisión</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">En Vivo</h1>
      <p className="text-muted mb-10">Sigue nuestros servicios en tiempo real.</p>

      {live?.activo && live.video_id ? (
        <div>
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-border mb-6">
            <iframe
              src={`https://www.youtube.com/embed/${live.video_id}?autoplay=1`}
              title={live.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Radio size={10} /> EN VIVO
            </span>
            <h2 className="font-bold text-white text-2xl">{live.titulo}</h2>
          </div>
          {live.descripcion && <p className="text-muted">{live.descripcion}</p>}
        </div>
      ) : (
        <div className="card text-center py-24">
          <Radio className="mx-auto text-muted mb-4" size={64} />
          <h2 className="text-2xl font-bold text-white mb-3">No hay transmisión activa</h2>
          <p className="text-muted max-w-md mx-auto">
            Cuando haya un servicio en vivo, aparecerá aquí automáticamente. ¡Vuelve pronto!
          </p>
          {live?.video_id && (
            <div className="mt-8">
              <p className="text-muted text-sm mb-4">Último servicio:</p>
              <div className="aspect-video max-w-2xl mx-auto rounded-xl overflow-hidden border border-border">
                <iframe
                  src={`https://www.youtube.com/embed/${live.video_id}`}
                  title="Último servicio"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
