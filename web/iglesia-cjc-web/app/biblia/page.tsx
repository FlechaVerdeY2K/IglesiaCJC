import BibleReader from "@/components/BibleReader";
import { BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biblia",
  description: "Lee la Santa Biblia Reina-Valera 1960 en Iglesia CJC.",
  alternates: {
    canonical: "/biblia",
  },
};

export default async function BibliaPage({
  searchParams,
}: {
  searchParams: Promise<{ libro?: string; capitulo?: string; versiculo?: string }>;
}) {
  const params = await searchParams;
  const libro = params.libro ?? "juan";
  const capitulo = parseInt(params.capitulo ?? "1");
  const versiculo = params.versiculo ? parseInt(params.versiculo) : undefined;

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/5 mb-4">
          <BookOpen size={11} className="text-accent" />
          <span className="text-accent text-[10px] font-bold tracking-[3px] uppercase">Palabra de Dios</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-2">Santa Biblia</h1>
        <p className="text-white/40">Reina-Valera 1960 · Seleccioná un libro y capítulo para leer</p>
      </div>

      <BibleReader
        initialLibro={libro}
        initialCapitulo={isNaN(capitulo) ? 1 : capitulo}
        highlightVersiculo={versiculo}
      />
    </div>
  );
}
