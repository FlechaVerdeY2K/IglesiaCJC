"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, Check, Loader, X } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";

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

function normalizeEstado(estado: string) {
  const e = (estado ?? "").toLowerCase();
  if (e === "aprobado" || e === "aprobada") return "aprobado";
  if (e === "rechazado" || e === "rechazada") return "rechazado";
  return "pendiente";
}

export default function MinisteriosPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [selected, setSelected] = useState<Equipo | null>(null);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userNombre, setUserNombre] = useState<string>("");
  const [userTelefono, setUserTelefono] = useState<string>("");
  const [misMinisterios, setMisMinisterios] = useState<Record<string, string>>({});

  const [openFormFor, setOpenFormFor] = useState<Equipo | null>(null);
  const [formTelefono, setFormTelefono] = useState("");
  const [formMotivo, setFormMotivo] = useState("");
  const [joining, setJoining] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<{ telefono?: string; motivo?: string }>({});

  useEffect(() => {
    (async () => {
      const [{ data, error }, authRes] = await Promise.all([
        supabase.from("equipos").select("id, nombre, descripcion, icon_name").eq("tipo", "ministerio").order("nombre"),
        supabase.auth.getSession(),
      ]);
      if (error) { console.error("[ministerios] fetch:", error.message); return; }
      setEquipos((data ?? []) as Equipo[]);

      const user = authRes.data.session?.user ?? null;
      setUserId(user?.id ?? null);
      setUserEmail(user?.email ?? "");
      if (!user?.id) return;

      const profileRes = await supabase.from("usuarios").select("nombre, telefono").eq("id", user.id).maybeSingle();
      setUserNombre((profileRes.data?.nombre as string | undefined) ?? "");
      setUserTelefono((profileRes.data?.telefono as string | undefined) ?? "");

      const { data: solRows } = await supabase
        .from("equipo_solicitudes")
        .select("equipo_id, estado, creado_en")
        .eq("usuario_id", user.id)
        .order("creado_en", { ascending: false });
      const map: Record<string, string> = {};
      for (const r of (solRows ?? []) as Array<{ equipo_id: string | null; estado: string }>) {
        if (r.equipo_id && !map[r.equipo_id]) map[r.equipo_id] = normalizeEstado(r.estado);
      }
      setMisMinisterios(map);
    })();
  }, []);

  const openModal = async (equipo: Equipo) => {
    setSelected(equipo);
    setMiembros([]);
    setLoadingModal(true);

    const [fullRes, solRes] = await Promise.all([
      supabase.from("equipos").select("lideres, lider").eq("id", equipo.id).single(),
      supabase.from("equipo_solicitudes").select("usuario_id").eq("equipo_id", equipo.id).eq("estado", "aprobado"),
    ]);

    if (fullRes.data) {
      setSelected((prev) => prev ? { ...prev, lideres: fullRes.data.lideres, lider: fullRes.data.lider } : prev);
    }

    const ids = Array.from(
      new Set((solRes.data ?? []).map((r: { usuario_id: string }) => r.usuario_id).filter(Boolean))
    );

    if (ids.length > 0) {
      const { data: usrData } = await supabase.from("usuarios").select("id, nombre, foto_url, email").in("id", ids);
      setMiembros((usrData ?? []) as Miembro[]);
    }

    setLoadingModal(false);
  };

  const openSolicitud = (equipo: Equipo) => {
    setOpenFormFor(equipo);
    setFormTelefono(userTelefono);
    setFormMotivo("");
    setFormError(null);
    setFormFieldErrors({});
  };

  const enviarSolicitud = async () => {
    if (!openFormFor || !userId) return;

    const next: { telefono?: string; motivo?: string } = {};
    if (!formTelefono.trim()) next.telefono = "Necesitamos un teléfono para contactarte.";
    if (!formMotivo.trim()) next.motivo = "Contanos brevemente por qué querés unirte.";
    if (Object.keys(next).length) { setFormFieldErrors(next); return; }
    setFormFieldErrors({});

    setJoining(openFormFor.id);
    setFormError(null);

    if (formTelefono.trim() && formTelefono.trim() !== userTelefono) {
      await supabase.from("usuarios").update({ telefono: formTelefono.trim() }).eq("id", userId);
      setUserTelefono(formTelefono.trim());
    }

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
      motivo: `Telefono: ${formTelefono.trim() || "N/A"} | Motivo: ${formMotivo.trim() || "N/A"}`,
    };

    const first = await supabase.from("equipo_solicitudes").insert(payloadWithForm);
    let ok = !first.error;
    if (first.error) console.error("[ministerios] insert payloadWithForm error:", first.error);

    if (!ok) {
      const retry = await supabase.from("equipo_solicitudes").insert(basePayload);
      ok = !retry.error;
      if (retry.error) console.error("[ministerios] insert basePayload error:", retry.error);
    }

    if (!ok) {
      setFormError(
        `No se pudo enviar la solicitud. ${first.error?.message ?? ""}`.trim()
      );
      setJoining(null);
      return;
    }

    setMisMinisterios((prev) => ({ ...prev, [openFormFor.id]: "pendiente" }));
    setJoining(null);
    setOpenFormFor(null);
    setFormMotivo("");
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
            {equipos.map((e) => {
              const estado = misMinisterios[e.id];
              return (
                <div key={e.id} className="rounded-2xl overflow-hidden border border-border hover:border-accent/40 transition-all flex flex-col" style={{ background: "#0D1628" }}>
                  <div className="relative w-full aspect-[16/9]" style={{ background: "#080E1E" }}>
                    {isImageUrl(e.icon_name) ? (
                      <Image
                        src={e.icon_name!}
                        alt={e.nombre}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="text-accent/30" size={48} />
                      </div>
                    )}
                    {estado && (
                      <span className={`absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide backdrop-blur ${
                        estado === "aprobado"
                          ? "bg-green-500/80 text-white"
                          : estado === "rechazado"
                            ? "bg-red-500/80 text-white"
                            : "bg-amber-500/80 text-white"
                      }`}>
                        {estado === "aprobado" ? "Miembro" : estado === "rechazado" ? "Rechazada" : "Pendiente"}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <h3 className="font-bold text-white text-lg">{e.nombre}</h3>
                    {e.descripcion && <p className="text-muted text-sm leading-relaxed line-clamp-2">{e.descripcion}</p>}
                    <button onClick={() => void openModal(e)} className="btn-secondary text-sm w-full mt-auto">Ver ministerio</button>
                  </div>
                </div>
              );
            })}
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
          <div className="w-full max-w-3xl rounded-2xl border border-border overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: "#0D1628" }}>
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

              {(() => {
                const estado = misMinisterios[selected.id];
                if (!userId) {
                  return (
                    <Link href="/login" className="btn-secondary text-sm w-full text-center block">
                      Inicia sesión para solicitar unirte
                    </Link>
                  );
                }
                if (estado === "aprobado") {
                  return (
                    <div className="flex items-center gap-2 text-green-400 text-sm font-semibold p-3 rounded-xl border border-green-500/20 bg-green-500/10">
                      <Check size={16} /> Ya eres miembro de este ministerio
                    </div>
                  );
                }
                if (estado === "pendiente") {
                  return (
                    <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400/90 text-sm">
                      Solicitud enviada · esperando aprobación del líder
                    </div>
                  );
                }
                if (estado === "rechazado") {
                  return (
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400/90 text-sm">
                        Tu solicitud anterior fue rechazada.
                      </div>
                      <button onClick={() => openSolicitud(selected)} className="btn-primary text-sm w-full">
                        Volver a solicitar
                      </button>
                    </div>
                  );
                }
                return (
                  <button onClick={() => openSolicitud(selected)} className="btn-primary text-sm w-full flex items-center justify-center gap-2">
                    Solicitar unirme a este ministerio
                  </button>
                );
              })()}

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

      {openFormFor && (
        <div className="fixed inset-0 z-[90] p-4 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)" }}>
          <div className="w-full max-w-lg rounded-2xl border border-border p-5" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-bold">Solicitud para {openFormFor.nombre}</h3>
              <button onClick={() => setOpenFormFor(null)} className="text-white/50 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-white/45 text-xs mb-1 block">Teléfono</label>
                <PhoneInput
                  value={formTelefono}
                  onChange={(v) => { setFormTelefono(v); if (formFieldErrors.telefono) setFormFieldErrors((p) => ({ ...p, telefono: undefined })); }}
                />
                {formFieldErrors.telefono && <p className="text-red-400 text-xs mt-1">{formFieldErrors.telefono}</p>}
                {!formFieldErrors.telefono && !userTelefono && (
                  <p className="text-amber-400/70 text-xs mt-1">
                    No tenés teléfono en tu perfil. Agregalo aquí y se guardará automáticamente.
                  </p>
                )}
                {!formFieldErrors.telefono && userTelefono && formTelefono !== userTelefono && (
                  <p className="text-blue-400/70 text-xs mt-1">
                    Este cambio también actualizará tu perfil.
                  </p>
                )}
              </div>
              <div>
                <label className="text-white/45 text-xs mb-1 block">¿Por qué querés unirte?</label>
                <textarea
                  className={`input w-full h-24 resize-none ${formFieldErrors.motivo ? "border-red-500/60" : ""}`}
                  value={formMotivo}
                  onChange={(e) => { setFormMotivo(e.target.value); if (formFieldErrors.motivo) setFormFieldErrors((p) => ({ ...p, motivo: undefined })); }}
                  placeholder="Cuéntanos brevemente..."
                />
                {formFieldErrors.motivo && <p className="text-red-400 text-xs mt-1">{formFieldErrors.motivo}</p>}
              </div>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
                {formError}
              </div>
            )}

            <div className="flex gap-3 justify-end mt-5">
              <button className="btn-secondary py-2 px-4 text-sm" onClick={() => setOpenFormFor(null)}>Cancelar</button>
              <button
                className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                onClick={() => void enviarSolicitud()}
                disabled={joining === openFormFor.id}
              >
                {joining === openFormFor.id ? <Loader size={13} className="animate-spin" /> : null}
                {joining === openFormFor.id ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
