import { supabase, type Equipo } from "@/lib/supabase";
import { Users } from "lucide-react";
import Link from "next/link";

export default async function EquiposPage() {
  const { data } = await supabase
    .from("equipos")
    .select("*")
    .order("orden", { ascending: true });

  const equipos = (data ?? []) as Equipo[];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Comunidad</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">Grupos de Proceso Semanal</h1>
      <p className="text-muted mb-6 max-w-2xl">
        Los GPS son pequeños grupos donde la fe se vive en comunidad real. Reúnete con otros, ora, estudia la Palabra y crece juntos.
      </p>

      {/* CTA Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
        <div className="card border-green-800/40 bg-green-950/20">
          <Users className="text-green-400 mb-3" size={36} />
          <h3 className="font-bold text-white text-xl mb-2">Unirme a un GPS</h3>
          <p className="text-muted text-sm mb-5">Sé parte de un grupo ya existente cerca de ti.</p>
          <Link href="/contacto" className="btn-primary text-sm inline-block">Solicitar información</Link>
        </div>
        <div className="card border-blue-800/40 bg-blue-950/20">
          <Users className="text-blue-400 mb-3" size={36} />
          <h3 className="font-bold text-white text-xl mb-2">Iniciar un GPS</h3>
          <p className="text-muted text-sm mb-5">Abrí tu propio grupo en tu casa o zona.</p>
          <Link href="/contacto" className="btn-secondary text-sm inline-block">Hablar con un pastor</Link>
        </div>
      </div>

      {/* Equipos de ministerio */}
      {equipos.length > 0 && (
        <>
          <span className="section-label">Ministerios</span>
          <h2 className="text-3xl font-bold mt-2 mb-8">Nuestros Equipos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipos.map((e) => (
              <div key={e.id} className="card hover:border-accent transition-colors">
                <div className="bg-accent/10 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="text-accent" size={24} />
                </div>
                <h3 className="font-bold text-white text-lg mb-1">{e.nombre}</h3>
                <p className="text-accent text-xs font-semibold mb-3">Líder: {e.lider}</p>
                <p className="text-muted text-sm leading-relaxed">{e.descripcion}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
