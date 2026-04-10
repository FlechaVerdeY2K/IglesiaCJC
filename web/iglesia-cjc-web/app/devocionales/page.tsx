import { supabase, type Devocional } from "@/lib/supabase";
import { BookOpen } from "lucide-react";

export default async function DevoccionalesPage() {
  const { data } = await supabase
    .from("devocionales")
    .select("*")
    .order("fecha", { ascending: false });

  const devocionales = (data ?? []) as Devocional[];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Cada día</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">Devocionales</h1>
      <p className="text-muted mb-12">Reflexiones diarias para alimentar tu fe.</p>

      {devocionales.length === 0 ? (
        <p className="text-muted text-center py-20">No hay devocionales disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {devocionales.map((d, i) => (
            <div key={d.id} className={`card ${i === 0 ? "lg:col-span-2 border-accent/40" : ""}`}>
              <div className="flex items-start gap-4">
                <div className="bg-accent/10 rounded-xl p-3 shrink-0">
                  <BookOpen className="text-accent" size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-muted text-xs mb-2">
                    {new Date(d.fecha).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  <h2 className="font-bold text-white text-xl mb-3">{d.titulo}</h2>
                  <div className="bg-border rounded-lg px-4 py-3 mb-4 border-l-4 border-accent">
                    <p className="text-white italic leading-relaxed">&ldquo;{d.versiculo}&rdquo;</p>
                    <p className="text-accent text-sm font-semibold mt-2">— {d.referencia}</p>
                  </div>
                  <p className="text-muted leading-relaxed text-sm">{d.reflexion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
