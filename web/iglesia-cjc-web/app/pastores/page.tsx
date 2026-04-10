import { supabase, type Pastor } from "@/lib/supabase";
import { User } from "lucide-react";

export default async function PastoresPage() {
  const { data } = await supabase
    .from("pastores")
    .select("*")
    .order("orden", { ascending: true });

  const pastores = (data ?? []) as Pastor[];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Liderazgo</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">Nuestros Pastores</h1>
      <p className="text-muted mb-12">Conoce a quienes guían nuestra comunidad.</p>

      {pastores.length === 0 ? (
        <p className="text-muted text-center py-20">No hay pastores registrados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pastores.map((p) => (
            <div key={p.id} className="card text-center">
              {p.foto_url ? (
                <img
                  src={p.foto_url}
                  alt={p.nombre}
                  className="w-28 h-28 rounded-full object-cover mx-auto mb-5 border-2 border-accent"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-border flex items-center justify-center mx-auto mb-5">
                  <User className="text-muted" size={40} />
                </div>
              )}
              <h2 className="font-bold text-white text-xl mb-1">{p.nombre}</h2>
              <p className="text-accent text-sm font-semibold mb-4">{p.cargo}</p>
              <p className="text-muted text-sm leading-relaxed">{p.bio}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
