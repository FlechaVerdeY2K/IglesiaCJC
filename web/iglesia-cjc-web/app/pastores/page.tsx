import { supabase, type Pastor } from "@/lib/supabase";
import PastorCard from "@/components/PastorCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pastores",
  description: "Conoce al equipo pastoral de Iglesia CJC y su servicio en la comunidad.",
  alternates: {
    canonical: "/pastores",
  },
};

export const dynamic = "force-dynamic";

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
            <PastorCard key={p.id} pastor={p} />
          ))}
        </div>
      )}
    </div>
  );
}
