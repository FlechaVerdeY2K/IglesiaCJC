"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";
import Image from "next/image";

import { Check, X, Users } from "lucide-react";

type UsuarioLite = { id?: string; nombre: string; foto_url: string | null; email: string };

type Solicitud = {
  id: string;
  usuario_id: string;
  equipo_id: string;
  estado: string;
  creado_en: string;
  usuario?: UsuarioLite | null;
};

type Miembro = { id: string; nombre: string; foto_url: string | null; email: string };

type Equipo = {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo: string | null;
  solicitudes: Solicitud[];
  miembros: Miembro[];
};

export default function LiderEquipoPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [noEquipo, setNoEquipo] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setLoading(false); return; }
    const user = session.user;

    const [liderIdRes, lideresRes] = await Promise.all([
      supabase.from("equipos").select("id, nombre, descripcion, tipo").eq("lider_id", user.id),
      supabase.from("equipos").select("id, nombre, descripcion, tipo").contains("lideres", [{ id: user.id }]),
    ]);

    const merged = new Map<string, { id: string; nombre: string; descripcion: string | null; tipo: string | null }>();
    for (const r of ((liderIdRes.data ?? []) as Array<{ id: string; nombre: string | null; descripcion: string | null; tipo: string | null }>)) {
      merged.set(r.id, { id: r.id, nombre: r.nombre ?? "", descripcion: r.descripcion, tipo: r.tipo });
    }
    for (const r of ((lideresRes.data ?? []) as Array<{ id: string; nombre: string | null; descripcion: string | null; tipo: string | null }>)) {
      if (!merged.has(r.id)) merged.set(r.id, { id: r.id, nombre: r.nombre ?? "", descripcion: r.descripcion, tipo: r.tipo });
    }

    const ids = Array.from(merged.keys());
    if (ids.length === 0) { setNoEquipo(true); setEquipos([]); setLoading(false); return; }

    const { data: sols } = await supabase
      .from("equipo_solicitudes")
      .select("id, usuario_id, equipo_id, estado, creado_en, usuario:usuarios(id, nombre, foto_url, email)")
      .in("equipo_id", ids)
      .order("creado_en", { ascending: false });

    const solsByEquipo = new Map<string, Solicitud[]>();
    for (const s of ((sols ?? []) as unknown as Solicitud[])) {
      const arr = solsByEquipo.get(s.equipo_id) ?? [];
      arr.push(s);
      solsByEquipo.set(s.equipo_id, arr);
    }

    const built: Equipo[] = ids.map((id) => {
      const eq = merged.get(id)!;
      const all = solsByEquipo.get(id) ?? [];
      const miembros: Miembro[] = all
        .filter((s) => s.estado === "aprobado" && s.usuario)
        .map((s) => ({
          id: s.usuario?.id ?? s.usuario_id,
          nombre: s.usuario?.nombre ?? "",
          foto_url: s.usuario?.foto_url ?? null,
          email: s.usuario?.email ?? "",
        }));
      return { ...eq, solicitudes: all, miembros };
    });

    setEquipos(built);
    setNoEquipo(false);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const updateEstado = async (solicitudId: string, estado: string) => {
    await supabase.from("equipo_solicitudes").update({ estado }).eq("id", solicitudId);
    void load();
  };

  if (loading) return <div className="text-white/30 text-sm py-8">Cargando...</div>;

  if (noEquipo) return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-black text-white mb-2">Mi Equipo</h1>
      <div className="p-6 rounded-2xl border border-border text-center" style={{ background: "#0D1628" }}>
        <Users size={32} className="text-white/20 mx-auto mb-3" />
        <p className="text-white/50 text-sm">No tienes un equipo asignado todavía.</p>
        <p className="text-white/30 text-xs mt-1">Pide a un administrador que te asigne como líder de un equipo.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-8">
      {equipos.map((equipo) => {
        const pendientes = equipo.solicitudes.filter((s) => s.estado === "pendiente");
        return (
          <section key={equipo.id} className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{equipo.nombre}</h2>
                {equipo.tipo && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                    equipo.tipo === "gps"
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      : "bg-blue-500/10 text-blue-300 border-blue-500/30"
                  }`}>
                    {equipo.tipo}
                  </span>
                )}
              </div>
              {equipo.descripcion && <p className="text-white/40 text-sm mt-1">{equipo.descripcion}</p>}
            </div>

            {pendientes.length > 0 && (
              <div className="rounded-2xl border border-amber-500/20 overflow-hidden" style={{ background: "#0D1628" }}>
                <div className="px-5 py-3.5 border-b border-amber-500/10" style={{ background: "rgba(245,158,11,0.05)" }}>
                  <p className="text-amber-400 font-bold text-sm">
                    {pendientes.length} solicitud{pendientes.length !== 1 ? "es" : ""} pendiente{pendientes.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="divide-y divide-white/5">
                  {pendientes.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                      {s.usuario?.foto_url
                        ? <Image src={s.usuario.foto_url} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" width={36} height={36} />
                        : <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-white shrink-0">{s.usuario?.nombre?.[0] ?? "?"}</div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">{s.usuario?.nombre ?? s.usuario_id}</p>
                        <p className="text-white/30 text-xs truncate">{s.usuario?.email}</p>
                      </div>
                      <p className="text-white/25 text-xs shrink-0">
                        {new Date(s.creado_en).toLocaleDateString("es", { timeZone: "America/Costa_Rica", day: "numeric", month: "short" })}
                      </p>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => void updateEstado(s.id, "aprobado")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold transition-colors">
                          <Check size={13} /> Aceptar
                        </button>
                        <button onClick={() => void updateEstado(s.id, "rechazado")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors">
                          <X size={13} /> Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "#0D1628" }}>
              <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
                <p className="text-white font-bold text-sm flex items-center gap-2">
                  <Users size={15} className="text-blue-400" /> Miembros
                </p>
                <span className="text-white/30 text-xs">{equipo.miembros.length} personas</span>
              </div>
              {equipo.miembros.length === 0 ? (
                <p className="text-white/25 text-sm text-center py-10">Aún no hay miembros aprobados</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {equipo.miembros.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                      {m.foto_url
                        ? <Image src={m.foto_url} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" width={32} height={32} />
                        : <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-white shrink-0">{m.nombre?.[0] ?? "?"}</div>
                      }
                      <div className="min-w-0">
                        <p className="text-white/80 text-sm font-medium truncate">{m.nombre}</p>
                        <p className="text-white/30 text-xs truncate">{m.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
