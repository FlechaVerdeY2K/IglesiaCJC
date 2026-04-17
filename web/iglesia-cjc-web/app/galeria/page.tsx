import { supabase, type GaleriaAlbum, type GaleriaItem } from "@/lib/supabase";
import GaleriaGrid from "@/components/GaleriaGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galería",
  description: "Momentos capturados de nuestra comunidad en Iglesia CJC.",
  alternates: {
    canonical: "/galeria",
  },
};

export default async function GaleriaPage() {
  const [{ data: albumsData }, { data: fotosData }] = await Promise.all([
    supabase.from("galeria_albums").select("*").order("fecha", { ascending: false }),
    supabase.from("galeria").select("*").order("fecha", { ascending: true }),
  ]);

  const albums = (albumsData ?? []) as GaleriaAlbum[];
  const fotos  = (fotosData ?? []) as GaleriaItem[];

  const albumsWithFotos = albums.map(a => ({
    ...a,
    fotos: fotos.filter(f => f.album_id === a.id),
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Momentos</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">Galería</h1>
      <p className="text-muted mb-12">Momentos capturados de nuestra comunidad.</p>
      <GaleriaGrid albums={albumsWithFotos} />
    </div>
  );
}
