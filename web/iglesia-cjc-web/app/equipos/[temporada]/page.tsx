"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Users, Check, Loader, X, ArrowLeft, UserPlus, Sparkles } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";

type LiderInfo = { id: string; nombre: string; foto_url?: string | null };

type Equipo = {
  id: string;
  nombre: string;
  descripcion: string;
  lider: string;
  lider_id: string | null;
  icon_name?: string | null;
  temporada?: number | null;
  tipo_gps?: string | null;
  lideres?: LiderInfo[] | null;
};

type Miembro = { id: string; nombre: string; foto_url: string | null; email: string | null };

function isImageUrl(value?: string | null) {
  return !!value && /^https?:\/\//i.test(value);
}

function tipoLabel(tipo?: string | null) {
  if (tipo === "afinidad") return "GPS de afinidad";
  if (tipo === "curricular") return "GPS curricular";
  return "GPS";
}

type Temporada = {
  numero: number;
  titulo: string;
  descripcion: string;
  foto_portada: string | null;
};

function normalizeEstado(estado: string) {
  const e = (estado ?? "").toLowerCase();
  if (e === "aprobado" || e === "aprobada") return "aprobado";
  if (e === "rechazado" || e === "rechazada") return "rechazado";
  return "pendiente";
}

export default function TemporadaPage() {
  const params = useParams<{ temporada: string }>();
  const router = useRouter();
  const temporadaNum = Number(params?.temporada);
  const validTemporada = temporadaNum >= 2 && temporadaNum <= 4 ? (temporadaNum as 2 | 3 | 4) : null;

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [temporadaInfo, setTemporadaInfo] = useState<Temporada | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userNombre, setUserNombre] = useState<string>("");
  const [userTelefono, setUserTelefono] = useState<string>("");
  const [misEquipos, setMisEquipos] = useState<Record<string, string>>({});
  const [joining, setJoining] = useState<string | null>(null);

  const [openFormFor, setOpenFormFor] = useState<Equipo | null>(null);
  const [motivo, setMotivo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [formErrors, setFormErrors] = useState<{ telefono?: string; motivo?: string }>({});

  const [selected, setSelected] = useState<Equipo | null>(null);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    if (!validTemporada) return;
    (async () => {
      const [eqsRes, tempRes, authRes] = await Promise.all([
        supabase.from("equipos").select("*").eq("tipo", "gps").eq("temporada", validTemporada).order("nombre"),
        supabase.from("temporadas").select("*").eq("numero", validTemporada).maybeSingle(),
        supabase.auth.getSession(),
      ]);

      setEquipos((eqsRes.data ?? []) as Equipo[]);
      setTemporadaInfo((tempRes.data as Temporada | null) ?? null);

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
      setMisEquipos(map);
    })();
  }, [validTemporada]);

  const openSolicitud = (equipo: Equipo) => {
    setOpenFormFor(equipo);
    setTelefono(userTelefono);
    setMotivo("");
    setFormErrors({});
  };

  const openDetail = async (equipo: Equipo) => {
    setSelected(equipo);
    setMiembros([]);
    setLoadingModal(true);

    const estado = misEquipos[equipo.id];
    const esMiembro = estado === "aprobado";

    const fullRes = await supabase.from("equipos").select("lideres, lider").eq("id", equipo.id).maybeSingle();
    if (fullRes.data) {
      setSelected((prev) => prev ? { ...prev, lideres: fullRes.data.lideres as LiderInfo[] | null, lider: fullRes.data.lider as string } : prev);
    }

    if (esMiembro) {
      const solRes = await supabase.from("equipo_solicitudes").select("usuario_id").eq("equipo_id", equipo.id).eq("estado", "aprobado");
      const ids = Array.from(new Set((solRes.data ?? []).map((r: { usuario_id: string }) => r.usuario_id).filter(Boolean)));
      if (ids.length > 0) {
        const { data: usrData } = await supabase.from("usuarios").select("id, nombre, foto_url, email").in("id", ids);
        setMiembros((usrData ?? []) as Miembro[]);
      }
    }

    setLoadingModal(false);
  };

  const enviarSolicitud = async () => {
    if (!openFormFor || !userId) return;

    const next: { telefono?: string; motivo?: string } = {};
    if (!telefono.trim()) next.telefono = "Necesitamos un teléfono para contactarte.";
    if (!motivo.trim()) next.motivo = "Contanos brevemente por qué querés unirte.";
    if (Object.keys(next).length) { setFormErrors(next); return; }
    setFormErrors({});

    setJoining(openFormFor.id);

    if (telefono.trim() && telefono.trim() !== userTelefono) {
      await supabase.from("usuarios").update({ telefono: telefono.trim() }).eq("id", userId);
      setUserTelefono(telefono.trim());
    }

    const payload = {
      usuario_id: userId,
      equipo_id: openFormFor.id,
      equipo_nombre: openFormFor.nombre,
      usuario_nombre: userNombre,
      usuario_email: userEmail,
      estado: "pendiente",
      motivo: `Telefono: ${telefono.trim() || "N/A"} | Motivo: ${motivo.trim() || "N/A"}`,
    };

    const { error } = await supabase.from("equipo_solicitudes").insert(payload);
    if (error) console.error("[equipos] insert:", error);

    setMisEquipos((prev) => ({ ...prev, [openFormFor.id]: "pendiente" }));
    setJoining(null);
    setOpenFormFor(null);
    setMotivo("");
    setTelefono("");
  };

  if (!validTemporada) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-muted mb-4">Temporada no válida.</p>
        <Link href="/equipos" className="btn-primary inline-block">Volver</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
      <button onClick={() => router.push("/equipos")} className="inline-flex items-center gap-2 text-muted hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> Volver a temporadas
      </button>

      {temporadaInfo?.foto_portada && (
        <div className="relative w-full rounded-2xl overflow-hidden border border-border mb-6" style={{ background: "#080E1E" }}>
          <Image
            src={temporadaInfo.foto_portada}
            alt={temporadaInfo.titulo || `Temporada ${validTemporada}`}
            width={1600}
            height={900}
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="w-full h-auto block"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 p-5">
            <span className="section-label text-white/60">Comunidad</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 drop-shadow-lg">{temporadaInfo.titulo || `Temporada ${validTemporada}`}</h1>
          </div>
        </div>
      )}

      {!temporadaInfo?.foto_portada && (
        <>
          <span className="section-label">Comunidad</span>
          <h1 className="text-4xl font-bold mt-2 mb-2">{temporadaInfo?.titulo || `Temporada ${validTemporada}`}</h1>
        </>
      )}

      {temporadaInfo?.descripcion && <p className="text-muted mb-10 max-w-2xl">{temporadaInfo.descripcion}</p>}

      {equipos.length === 0 ? (
        <p className="text-muted text-center py-16">No hay GPS en esta temporada aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {equipos.map((e) => {
            const estado = misEquipos[e.id];
            const tipoPillClass = e.tipo_gps === "afinidad"
              ? "bg-purple-500/15 text-purple-300 border-purple-400/30"
              : "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
            return (
              <div
                key={e.id}
                onClick={() => void openDetail(e)}
                className="group rounded-2xl overflow-hidden border border-border hover:border-accent/60 hover:shadow-lg hover:shadow-accent/5 transition-all flex flex-col cursor-pointer"
                style={{ background: "#0D1628" }}
              >
                <div className="relative w-full aspect-[16/9]" style={{ background: "#080E1E" }}>
                  {isImageUrl(e.icon_name) ? (
                    <Image
                      src={e.icon_name!}
                      alt={e.nombre}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
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
                  <div>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${tipoPillClass}`}>
                      <Sparkles size={10} />
                      {tipoLabel(e.tipo_gps)}
                    </span>
                    <h3 className="font-bold text-white text-lg mt-2">{e.nombre}</h3>
                    {e.lider && <p className="text-accent text-xs font-semibold mt-0.5">Líder: {e.lider}</p>}
                  </div>
                  {e.descripcion && <p className="text-muted text-sm leading-relaxed line-clamp-2">{e.descripcion}</p>}

                  <div className="mt-auto pt-2" onClick={(ev) => ev.stopPropagation()}>
                    {!userId ? (
                      <Link href="/login" className="btn-secondary text-sm w-full text-center block">Inicia sesión para solicitar</Link>
                    ) : estado === "aprobado" ? (
                      <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-semibold py-2 rounded-xl border border-green-500/20 bg-green-500/5">
                        <Check size={16} /> Ya eres miembro
                      </div>
                    ) : estado === "pendiente" ? (
                      <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-semibold py-2 rounded-xl border border-amber-500/20 bg-amber-500/5">
                        <Loader size={14} className="animate-spin" /> Solicitud enviada
                      </div>
                    ) : (
                      <button
                        onClick={(ev) => { ev.stopPropagation(); openSolicitud(e); }}
                        disabled={joining === e.id}
                        className="relative w-full py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-accent to-accent/80 hover:from-accent hover:to-accent shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {joining === e.id ? <Loader size={15} className="animate-spin" /> : <UserPlus size={15} />}
                        {joining === e.id ? "Enviando..." : "Solicitar unirme"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (() => {
        const estado = misEquipos[selected.id];
        const esMiembro = estado === "aprobado";
        const lideres = selected.lideres ?? [];
        const liderIds = new Set(lideres.map((l) => l.id));
        const soloMiembros = miembros.filter((m) => !liderIds.has(m.id));
        return (
          <div
            className="fixed inset-0 z-[80] p-4 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={(ev) => { if (ev.target === ev.currentTarget) setSelected(null); }}
          >
            <div className="w-full max-w-3xl rounded-2xl border border-border overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: "#0D1628" }}>
              <div
                className="relative h-[42vh] min-h-[260px] max-h-[520px] border-b border-white/10"
                style={{ background: isImageUrl(selected.icon_name) ? "#080E1E" : "linear-gradient(135deg,#1A0A0D 0%, #0D1628 100%)" }}
              >
                {isImageUrl(selected.icon_name) ? (
                  <Image src={selected.icon_name!} alt={selected.nombre} fill className="object-contain p-3 sm:p-5" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="text-accent/30" size={64} />
                  </div>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 text-white/80 hover:text-white p-1.5 rounded-full bg-black/40 backdrop-blur border border-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${
                    selected.tipo_gps === "afinidad"
                      ? "bg-purple-500/15 text-purple-300 border-purple-400/30"
                      : "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
                  }`}>
                    <Sparkles size={10} />
                    {tipoLabel(selected.tipo_gps)}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">{selected.nombre}</h3>
                </div>
                {selected.descripcion && (
                  <p className="text-white/75 text-sm leading-relaxed">{selected.descripcion}</p>
                )}

                {(() => {
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
                        <Check size={16} /> Ya eres miembro de este GPS
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
                        <button
                          onClick={() => { setSelected(null); openSolicitud(selected); }}
                          className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-accent to-accent/80 shadow-md shadow-accent/20 flex items-center justify-center gap-2"
                        >
                          <UserPlus size={15} /> Volver a solicitar
                        </button>
                      </div>
                    );
                  }
                  return (
                    <button
                      onClick={() => { setSelected(null); openSolicitud(selected); }}
                      className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-accent to-accent/80 shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus size={15} /> Solicitar unirme a este GPS
                    </button>
                  );
                })()}

                <div className="rounded-xl border border-white/10 p-4" style={{ background: "#08111f" }}>
                  {loadingModal ? (
                    <p className="text-white/30 text-sm">Cargando...</p>
                  ) : (
                    <>
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
                        {lideres.length > 1 ? "Líderes" : "Líder"}
                      </p>
                      {lideres.length === 0 ? (
                        <p className="text-white/30 text-sm mb-4">
                          {selected.lider || "Sin líder asignado"}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                          {lideres.map((l) => (
                            <div key={l.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-amber-500/15" style={{ background: "rgba(245,158,11,0.05)" }}>
                              {isImageUrl(l.foto_url) ? (
                                <Image src={l.foto_url!} className="w-7 h-7 rounded-full object-cover shrink-0" alt={l.nombre} width={28} height={28} />
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
                      )}

                      <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
                        Integrantes {esMiembro && soloMiembros.length > 0 ? `(${soloMiembros.length})` : ""}
                      </p>
                      {!esMiembro ? (
                        <div className="p-3 rounded-xl border border-white/10 bg-white/5 text-white/50 text-xs">
                          Unite al GPS para ver a sus integrantes.
                        </div>
                      ) : soloMiembros.length === 0 ? (
                        <p className="text-white/30 text-sm">Sin integrantes visibles todavía.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {soloMiembros.map((m) => (
                            <div key={m.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/5" style={{ background: "#0D1628" }}>
                              {isImageUrl(m.foto_url) ? (
                                <Image src={m.foto_url!} className="w-7 h-7 rounded-full object-cover shrink-0" alt={m.nombre} width={28} height={28} />
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
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
                <PhoneInput value={telefono} onChange={(v) => { setTelefono(v); if (formErrors.telefono) setFormErrors((p) => ({ ...p, telefono: undefined })); }} />
                {formErrors.telefono && <p className="text-red-400 text-xs mt-1">{formErrors.telefono}</p>}
                {!formErrors.telefono && !userTelefono && (
                  <p className="text-amber-400/70 text-xs mt-1">
                    No tenés teléfono en tu perfil. Agregalo aquí y se guardará automáticamente.
                  </p>
                )}
                {!formErrors.telefono && userTelefono && telefono !== userTelefono && (
                  <p className="text-blue-400/70 text-xs mt-1">
                    Este cambio también actualizará tu perfil.
                  </p>
                )}
              </div>
              <div>
                <label className="text-white/45 text-xs mb-1 block">¿Por qué querés unirte?</label>
                <textarea
                  className={`input w-full h-24 resize-none ${formErrors.motivo ? "border-red-500/60" : ""}`}
                  value={motivo}
                  onChange={(e) => { setMotivo(e.target.value); if (formErrors.motivo) setFormErrors((p) => ({ ...p, motivo: undefined })); }}
                  placeholder="Cuéntanos brevemente..."
                />
                {formErrors.motivo && <p className="text-red-400 text-xs mt-1">{formErrors.motivo}</p>}
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
