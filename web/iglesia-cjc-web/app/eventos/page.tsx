import { supabase, type Evento } from "@/lib/supabase";
import EventosTabs from "@/components/EventosTabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Próximos eventos de Iglesia CJC. Fechas, detalles y actividades de la comunidad.",
  alternates: {
    canonical: "/eventos",
  },
};

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
      <EventosTabs eventos={eventos} />
    </div>
  );
}
