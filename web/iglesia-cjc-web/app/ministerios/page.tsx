"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";

type LiderInfo = { id: string; nombre: string; foto_url?: string | null };

type Equipo = {
  id: string;
  nombre: string;
  descripcion: string;
  lider: string;
  lider_id: string | null;
  icon_name?: string | null;
  lideres?: LiderInfo[] | null;
};

type Miembro = { id: string; nombre: string; foto_url: string | null; email: string | null };

function isImageUrl(value?: string | null) {
  return !!value && /^https?:\/\//i.test(value);
}

export default function MinisteriosPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [selected, setSelected] = useState<Equipo | null>(null);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("equipos").select("id, nombre, descripcion, icon_name").order("nombre");
      if (error) { console.error("[ministerios] fetch:", error.message); return; }
      setEquipos((data ?? []) as Equipo[]);
    })();
  }, []);

  const openModal = async (equipo: Equipo) => {
    setSelected(equipo);
    setMiembros([]);
    setLoadingModal(true);

    const [fullRes, modernRes, legacyRes] = await Promise.all([
      supabase.from("equipos").select("lideres, lider").eq("id", equipo.id).single(),
      supabase.from("equipo_solicitudes").select("usuario_id").eq("equipo_id", equipo.id).eq("estado", "aprobado"),
      supabase.from("gps_registros").select("usuario_id").eq("equipo_id", equipo.id).eq("estado", "aprobada"),
    ]);

    if (fullRes.data) {
      setSelected((prev) => prev ? { ...prev, lideres: fullRes.data.lideres, lider: fullRes.data.lider } : prev);
    }

    const ids = Array.from(
      new Set([...(modernRes.data ?? []), ...(legacyRes.data ?? [])].map((r: { usuario_id: string }) => r.usuario_id).filter(Boolean))
    );

    if (ids.length > 0) {
      const { data: usrData } = await supabase.from("usuarios").select("id, nombre, foto_url, email").in("id", ids);
      setMiembros((usrData ?? []) as Miembro[]);
    }

    setLoadingModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Comunidad</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">Ministerios</h1>
      <p className="text-muted mb-10 max-w-2xl">Encuentra un ministerio para servir, crecer y caminar en comunidad.</p>

      <div className="card border-blue-800/40 bg-blue-950/20 mb-12 max-w-2xl">
        <Users className="text-blue-400 mb-3" size={32} />
        <h3 className="font-bold text-white text-xl mb-1">¿Querés unirte a un ministerio?</h3>
        <p className="text-muted text-sm mb-4">Habla con tu pastor de confianza para guiarte al ministerio correcto.</p>
        <Link href="/contacto" className="btn-secondary text-sm inline-block">Hablar con un pastor</Link>
      </div>

      {equipos.length === 0 ? (
        <p className="text-muted text-center py-16">No hay ministerios registrados aún.</p>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-white mb-6">Ministerios disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {equipos.map((e) => (
              <div key={e.id} className="card hover:border-accent/40 transition-all flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  {isImageUrl(e.icon_name) ? (
                    <Image src={e.icon_name!} alt={e.nombre} width={44} height={44} className="w-11 h-11 rounded-xl object-cover shrink-0 border border-white/10" />
                  ) : (
                    <div className="bg-accent/10 rounded-xl w-11 h-11 flex items-center justify-center shrink-0">
                      <Users className="text-accent" size={20} />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{e.nombre}</h3>
                  {e.descripcion && <p className="text-muted text-sm mt-2 leading-relaxed line-clamp-3">{e.descripcion}</p>}
                </div>

                <div className="pt-1 space-y-2">
                  <button onClick={() => void openModal(e)} className="btn-secondary text-sm w-full">Ver ministerio</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-[80] p-4 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div className="w-full max-w-3xl rounded-2xl border border-border overflow-hidden" style={{ background: "#0D1628" }}>
            <div
              className="relative h-[42vh] min-h-[260px] max-h-[520px] border-b border-white/10"
              style={{ background: isImageUrl(selected.icon_name) ? "#120f24" : "linear-gradient(135deg,#1A0A0D 0%, #0D1628 100%)" }}
            >
              {isImageUrl(selected.icon_name) && (
                <Image src={selected.icon_name!} alt={selected.nombre} fill className="object-contain p-3 sm:p-5" />
              )}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 text-white/70 hover:text-white text-sm px-2 py-1 rounded-md border border-white/20"
              >
                Cerrar
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-2xl font-black text-white">{selected.nombre}</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                {selected.descripcion || "Este ministerio está activo. Próximamente más detalles."}
              </p>

              <div className="rounded-xl border border-white/10 p-4" style={{ background: "#08111f" }}>
                {loadingModal ? (
                  <p className="text-white/30 text-sm">Cargando...</p>
                ) : (() => {
                  const liderIds = new Set((selected.lideres ?? []).map((l) => l.id));
                  const soloMiembros = miembros.filter((m) => !liderIds.has(m.id));
                  const lideres = selected.lideres ?? [];
                  return (
                    <>
                      {lideres.length > 0 && (
                        <div className="mb-4">
                          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Líderes</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {lideres.map((l) => (
                              <div key={l.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-amber-500/15" style={{ background: "rgba(245,158,11,0.05)" }}>
                                {l.foto_url && /^https?:\/\//i.test(l.foto_url) ? (
                                  <Image src={l.foto_url} className="w-7 h-7 rounded-full object-cover shrink-0" alt={l.nombre} width={28} height={28} />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">{l.nombre[0]}</div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-white/85 text-xs font-medium truncate">{l.nombre}</p>
                                  <p className="text-amber-400/50 text-[10px]">Líder</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Integrantes {soloMiembros.length > 0 ? `(${soloMiembros.length})` : ""}</p>
                      {soloMiembros.length === 0 ? (
                        <p className="text-white/30 text-sm">Sin integrantes visibles todavía.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {soloMiembros.map((m) => (
                            <div key={m.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/5" style={{ background: "#0D1628" }}>
                              {m.foto_url ? (
                                <Image src={m.foto_url} className="w-7 h-7 rounded-full object-cover shrink-0" alt={m.nombre} width={28} height={28} />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-white shrink-0">{m.nombre?.[0] ?? "?"}</div>
                              )}
                              <div className="min-w-0">
                                <p className="text-white/85 text-xs font-medium truncate">{m.nombre}</p>
                                <p className="text-white/30 text-[10px] truncate">{m.email ?? ""}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
