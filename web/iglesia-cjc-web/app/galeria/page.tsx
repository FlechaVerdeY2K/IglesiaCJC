import { supabase, type GaleriaItem } from "@/lib/supabase";
import Image from "next/image";

export default async function GaleriaPage() {
  const { data } = await supabase
    .from("galeria")
    .select("*")
    .order("fecha", { ascending: false });

  const items = (data ?? []) as GaleriaItem[];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Momentos</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">Galería</h1>
      <p className="text-muted mb-12">Momentos capturados de nuestra comunidad.</p>

      {items.length === 0 ? (
        <p className="text-muted text-center py-20">No hay imágenes disponibles.</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="break-inside-avoid group relative overflow-hidden rounded-xl border border-border hover:border-accent transition-colors">
              <Image
                src={item.image_url}
                alt={item.titulo}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                width={900}
                height={1200}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <h3 className="text-white font-semibold text-sm">{item.titulo}</h3>
                {item.descripcion && <p className="text-muted text-xs mt-1">{item.descripcion}</p>}
                <span className="text-accent text-xs mt-1 capitalize">{item.categoria}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
