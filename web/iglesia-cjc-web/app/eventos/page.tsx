import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type Evento } from "@/lib/supabase";
import EventosTabs from "@/components/EventosTabs";
import type { Metadata } from "next";
import { getSupabaseConfig } from "@/lib/supabase-config";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Próximos eventos de Iglesia CJC. Fechas, detalles y actividades de la comunidad.",
  alternates: {
    canonical: "/eventos",
  },
};

export default async function EventosPage() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  });

  const { data: authData } = await supabase.auth.getSession();
  const userId = authData.session?.user?.id;

  const userEquipoIds = new Set<string>();

  if (userId) {
    const [aprobadosRes, liderIdRes, lideresRes] = await Promise.all([
      supabase.from("equipo_solicitudes").select("equipo_id").eq("usuario_id", userId).eq("estado", "aprobado"),
      supabase.from("equipos").select("id").eq("lider_id", userId),
      supabase.from("equipos").select("id").contains("lideres", [{ id: userId }]),
    ]);
    for (const r of ((aprobadosRes.data ?? []) as Array<{ equipo_id: string | null }>)) {
      if (r.equipo_id) userEquipoIds.add(r.equipo_id);
    }
    for (const r of ((liderIdRes.data ?? []) as Array<{ id: string }>)) userEquipoIds.add(r.id);
    for (const r of ((lideresRes.data ?? []) as Array<{ id: string }>)) userEquipoIds.add(r.id);
  }

  const { data } = await supabase.from("eventos").select("*").order("fecha", { ascending: true });
  const eventos = ((data ?? []) as Evento[]).filter((e) => {
    if (!e.equipo_id) return true;
    return userEquipoIds.has(e.equipo_id);
  });

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Agenda</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">Eventos</h1>
      <p className="text-muted mb-12">Mantente al tanto de todo lo que está pasando en CJC.</p>
      <EventosTabs eventos={eventos} />
    </div>
  );
}
