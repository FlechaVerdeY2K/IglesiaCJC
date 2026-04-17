"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Check, Loader, X } from "lucide-react";

type Equipo = {
  id: string;
  nombre: string;
  descripcion: string;
  lider: string;
  lider_id: string | null;
  icon_name?: string | null;
};

function normalizeEstado(estado: string) {
  const e = (estado ?? "").toLowerCase();
  if (e === "aprobado" || e === "aprobada") return "aprobado";
  if (e === "rechazado" || e === "rechazada") return "rechazado";
  return "pendiente";
}

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userNombre, setUserNombre] = useState<string>("");
  const [misEquipos, setMisEquipos] = useState<Record<string, string>>({});
  const [joining, setJoining] = useState<string | null>(null);

  const [openFormFor, setOpenFormFor] = useState<Equipo | null>(null);
  const [motivo, setMotivo] = useState("");
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data: eqs }, authRes] = await Promise.all([
        supabase.from("equipos").select("*").order("nombre"),
        supabase.auth.getSession(),
      ]);

      setEquipos((eqs ?? []) as Equipo[]);
      const user = authRes.data.session?.user ?? null;
      setUserId(user?.id ?? null);
      setUserEmail(user?.email ?? "");

      if (!user?.id) return;

      const profileRes = await supabase.from("usuarios").select("nombre").eq("id", user.id).maybeSingle();
      setUserNombre((profileRes.data?.nombre as string | undefined) ?? "");

      const [modernRes, legacyRes] = await Promise.all([
        supabase.from("equipo_solicitudes").select("equipo_id, estado").eq("usuario_id", user.id),
        supabase.from("gps_registros").select("equipo_id, estado").eq("usuario_id", user.id),
      ]);

      const map: Record<string, string> = {};
      for (const r of (modernRes.data ?? []) as Array<{ equipo_id: string | null; estado: string }>) {
        if (r.equipo_id) map[r.equipo_id] = normalizeEstado(r.estado);
      }
      for (const r of (legacyRes.data ?? []) as Array<{ equipo_id: string | null; estado: string }>) {
        if (r.equipo_id && !map[r.equipo_id]) map[r.equipo_id] = normalizeEstado(r.estado);
      }
      setMisEquipos(map);
    })();
  }, []);

  const enviarSolicitud = async () => {
    if (!openFormFor || !userId) return;

    setJoining(openFormFor.id);

    const basePayload: Record<string, string> = {
      usuario_id: userId,
      equipo_id: openFormFor.id,
      equipo_nombre: openFormFor.nombre,
      usuario_nombre: userNombre,
      usuario_email: userEmail,
      estado: "pendiente",
    };

    const payloadWithForm = {
      ...basePayload,
      motivo: `Telefono: ${telefono || "N/A"} | Motivo: ${motivo || "N/A"}`,
    };

    const { error } = await supabase.from("equipo_solicitudes").insert(payloadWithForm);

    if (error) {
      const retry = await supabase.from("equipo_solicitudes").insert(basePayload);
      if (retry.error) {
        await supabase.from("gps_registros").insert({
          usuario_id: userId,
          equipo_id: openFormFor.id,
          equipo_nombre: openFormFor.nombre,
          estado: "pendiente",
        });
      }
    }

    setMisEquipos((prev) => ({ ...prev, [openFormFor.id]: "pendiente" }));
    setJoining(null);
    setOpenFormFor(null);
    setMotivo("");
    setTelefono("");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Comunidad</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">GPS - Grupos Pequeños Saludables</h1>
      <p className="text-muted mb-10 max-w-2xl">Solicita tu ingreso por formulario y el líder del GPS aprobará tu solicitud.</p>

      {equipos.length === 0 ? (
        <p className="text-muted text-center py-16">No hay GPS registrados aún.</p>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-white mb-6">GPS disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {equipos.map((e) => {
              const estado = misEquipos[e.id];
              return (
                <div key={e.id} className="card hover:border-accent/40 transition-all flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="bg-accent/10 rounded-xl w-11 h-11 flex items-center justify-center shrink-0">
                      <Users className="text-accent" size={20} />
                    </div>
                    {estado && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                        estado === "aprobado"
                          ? "bg-green-500/15 text-green-400 border border-green-500/20"
                          : estado === "rechazado"
                            ? "bg-red-500/15 text-red-400 border border-red-500/20"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                      }`}>
                        {estado === "aprobado" ? "Miembro" : estado === "rechazado" ? "Rechazada" : "Pendiente"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{e.nombre}</h3>
                    {e.lider && <p className="text-accent text-xs font-semibold mt-0.5">Líder: {e.lider}</p>}
                    {e.descripcion && <p className="text-muted text-sm mt-2 leading-relaxed">{e.descripcion}</p>}
                  </div>

                  <div className="pt-1">
                    {!userId ? (
                      <Link href="/login" className="btn-secondary text-sm w-full text-center block">Inicia sesión para solicitar</Link>
                    ) : estado === "aprobado" ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm font-semibold"><Check size={16} /> Ya eres miembro</div>
                    ) : estado === "pendiente" ? (
                      <p className="text-amber-400/70 text-sm">Solicitud enviada · esperando aprobación</p>
                    ) : (
                      <button
                        onClick={() => setOpenFormFor(e)}
                        disabled={joining === e.id}
                        className="btn-primary text-sm w-full flex items-center justify-center gap-2"
                      >
                        {joining === e.id ? <Loader size={13} className="animate-spin" /> : null}
                        Solicitar unirme
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {openFormFor && (
        <div className="fixed inset-0 z-[90] p-4 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="w-full max-w-lg rounded-2xl border border-border p-5" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-bold">Solicitud para {openFormFor.nombre}</h3>
              <button onClick={() => setOpenFormFor(null)} className="text-white/50 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-white/45 text-xs mb-1 block">Teléfono</label>
                <input className="input w-full" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej: +506 8888-8888" />
              </div>
              <div>
                <label className="text-white/45 text-xs mb-1 block">¿Por qué querés unirte?</label>
                <textarea className="input w-full h-24 resize-none" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Cuéntanos brevemente..." />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-5">
              <button className="btn-secondary py-2 px-4 text-sm" onClick={() => setOpenFormFor(null)}>Cancelar</button>
              <button className="btn-primary py-2 px-4 text-sm" onClick={() => void enviarSolicitud()} disabled={joining === openFormFor.id}>
                {joining === openFormFor.id ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
