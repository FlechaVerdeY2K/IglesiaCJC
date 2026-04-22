import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ExternalLink, FileText, Headphones, Image as ImageIcon, Link2, Video } from "lucide-react";
import type { Metadata } from "next";
import { getSupabaseConfig } from "@/lib/supabase-config";
import { normalizeRoles } from "@/lib/access-control";
import { getResourceThumbnail } from "@/lib/resource-preview";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Recursos",
  description: "Recursos cristianos de Iglesia CJC: PDFs, audios y videos para tu formación.",
  alternates: { canonical: "/recursos" },
};

type Recurso = {
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
  tipo: string;
  fecha?: string;
  audiencia?: string | null;
  equipo_id?: string | null;
};

const iconoTipo = { pdf: FileText, audio: Headphones, video: Video, foto: ImageIcon, link: Link2 } as const;
const colorTipo = {
  pdf: "text-red-400",
  audio: "text-purple-400",
  video: "text-blue-400",
  foto: "text-emerald-400",
  link: "text-white/60",
} as const;

export default async function RecursosPage() {
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

  let roles: string[] = [];
  let hasAnyEquipo = false;
  const userEquipoIds = new Set<string>();

  if (userId) {
    const [profileRes, aprobadosRes, liderIdRes, lideresRes] = await Promise.all([
      supabase.from("usuarios").select("rol, roles").eq("id", userId).maybeSingle(),
      supabase.from("equipo_solicitudes").select("equipo_id").eq("usuario_id", userId).eq("estado", "aprobado"),
      supabase.from("equipos").select("id").eq("lider_id", userId),
      supabase.from("equipos").select("id").contains("lideres", [{ id: userId }]),
    ]);

    roles = normalizeRoles(profileRes.data ?? null);
    for (const r of ((aprobadosRes.data ?? []) as Array<{ equipo_id: string | null }>)) {
      if (r.equipo_id) userEquipoIds.add(r.equipo_id);
    }
    for (const r of ((liderIdRes.data ?? []) as Array<{ id: string }>)) userEquipoIds.add(r.id);
    for (const r of ((lideresRes.data ?? []) as Array<{ id: string }>)) userEquipoIds.add(r.id);
    hasAnyEquipo = userEquipoIds.size > 0;
  }

  const isAdmin = roles.includes("admin");

  const { data } = await supabase.from("recursos").select("*").order("fecha", { ascending: false });
  const recursos = ((data ?? []) as Recurso[]).filter((r) => {
    if (r.equipo_id) return userEquipoIds.has(r.equipo_id);
    const audiencia = (r.audiencia ?? "general").toLowerCase();
    if (audiencia === "general") return true;
    if (audiencia === "equipo" || audiencia === "equipos") return hasAnyEquipo;
    if (audiencia === "lideres") return roles.includes("lider") || isAdmin;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Material</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">Recursos</h1>
      <p className="text-muted mb-12">PDFs, audios, links, fotos y videos para tu crecimiento espiritual.</p>

      {recursos.length === 0 ? (
        <p className="text-muted text-center py-20">No hay recursos disponibles para tu perfil.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recursos.map((r) => {
            const tipo = (r.tipo || "link") as keyof typeof iconoTipo;
            const Icono = iconoTipo[tipo] ?? Link2;
            const color = colorTipo[tipo] ?? "text-muted";
            const preview = getResourceThumbnail(r.url, r.tipo);
            return (
              <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="card group hover:border-accent transition-colors flex flex-col">
                <div className="w-full h-36 rounded-xl border border-white/10 overflow-hidden mb-3" style={{ background: "#08111f" }}>
                  {preview ? (
                    <Image src={preview} alt={r.titulo} width={720} height={360} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      {r.tipo === "pdf" ? <FileText size={28} className="text-red-400/50" /> : r.tipo === "video" ? <Video size={28} className="text-purple-400/50" /> : <Link2 size={28} className="text-blue-400/50" />}
                      <span className="text-[10px] uppercase font-bold tracking-wider text-white/25">{r.tipo}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <Icono className={color} size={20} />
                  <span className={`text-xs font-semibold uppercase ${color}`}>{r.tipo}</span>
                </div>

                <h3 className="font-semibold text-white group-hover:text-accent transition-colors mb-2 flex-1">{r.titulo}</h3>
                <p className="text-muted text-sm mb-4 line-clamp-2">{r.descripcion}</p>
                <div className="flex items-center gap-2 text-accent text-sm font-medium">
                  <ExternalLink size={14} /> Abrir recurso
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
