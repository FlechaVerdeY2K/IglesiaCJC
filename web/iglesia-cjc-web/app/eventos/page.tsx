import { supabase, type Evento } from "@/lib/supabase";
import { Calendar, MapPin } from "lucide-react";

export default async function EventosPage() {
  const { data } = await supabase
    .from("eventos")
    .select("*")
    .eq("activo", true)
    .order("fecha", { ascending: true });

  const eventos = (data ?? []) as Evento[];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Agenda</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">Eventos</h1>
      <p className="text-muted mb-12">Mantente al tanto de todo lo que está pasando en CJC.</p>

      {eventos.length === 0 ? (
        <p className="text-muted text-center py-20">No hay eventos próximos.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventos.map((e) => {
            const fecha = new Date(e.fecha);
            return (
              <div key={e.id} className="card hover:border-accent transition-colors flex gap-5">
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center min-w-[72px] flex flex-col items-center justify-center">
                  <p className="text-accent font-extrabold text-2xl leading-none">{fecha.getDate()}</p>
                  <p className="text-accent text-xs uppercase font-semibold mt-1">
                    {fecha.toLocaleString("es", { month: "short" })}
                  </p>
                  <p className="text-muted text-xs">{fecha.getFullYear()}</p>
                </div>
                <div className="flex-1">
                  {e.image_url && (
                    <img src={e.image_url} alt={e.titulo} className="w-full h-32 object-cover rounded-lg mb-3" />
                  )}
                  <h3 className="font-bold text-white text-lg mb-2">{e.titulo}</h3>
                  {e.lugar && (
                    <p className="text-muted text-sm flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-accent" /> {e.lugar}
                    </p>
                  )}
                  <p className="text-muted text-sm flex items-center gap-2 mb-3">
                    <Calendar size={14} className="text-accent" />
                    {fecha.toLocaleDateString("es", { weekday: "long", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-muted text-sm leading-relaxed">{e.descripcion}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
