"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Users, Check, Loader, X, ArrowLeft } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";

type Equipo = {
  id: string;
  nombre: string;
  descripcion: string;
  lider: string;
  lider_id: string | null;
  icon_name?: string | null;
  temporada?: number | null;
  tipo_gps?: string | null;
};

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
  const [misEquipos, setMisEquipos] = useState<Record<string, string>>({});
  const [joining, setJoining] = useState<string | null>(null);

  const [openFormFor, setOpenFormFor] = useState<Equipo | null>(null);
  const [motivo, setMotivo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [formErrors, setFormErrors] = useState<{ telefono?: string; motivo?: string }>({});

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

      const profileRes = await supabase.from("usuarios").select("nombre").eq("id", user.id).maybeSingle();
      setUserNombre((profileRes.data?.nombre as string | undefined) ?? "");

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

  const enviarSolicitud = async () => {
    if (!openFormFor || !userId) return;

    const next: { telefono?: string; motivo?: string } = {};
    if (!telefono.trim()) next.telefono = "Necesitamos un teléfono para contactarte.";
    if (!motivo.trim()) next.motivo = "Contanos brevemente por qué querés unirte.";
    if (Object.keys(next).length) { setFormErrors(next); return; }
    setFormErrors({});

    setJoining(openFormFor.id);

    const payload = {
      usuario_id: userId,
      equipo_id: openFormFor.id,
      equipo_nombre: openFormFor.nombre,
      usuario_nombre: userNombre,
      usuario_email: userEmail,
      estado: "pendiente",
      motivo: `Telefono: ${telefono || "N/A"} | Motivo: ${motivo || "N/A"}`,
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
            return (
              <div key={e.id} className="rounded-2xl overflow-hidden border border-border hover:border-accent/40 transition-all flex flex-col" style={{ background: "#0D1628" }}>
                <div className="relative w-full aspect-[16/9]" style={{ background: "#080E1E" }}>
                  {e.icon_name && /^https?:\/\//i.test(e.icon_name) ? (
                    <Image
                      src={e.icon_name}
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
                  {e.tipo_gps && (
                    <span className={`absolute top-3 left-3 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide backdrop-blur ${
                      e.tipo_gps === "afinidad"
                        ? "bg-purple-500/80 text-white"
                        : "bg-emerald-500/80 text-white"
                    }`}>
                      {e.tipo_gps}
                    </span>
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
                    <h3 className="font-bold text-white text-lg">{e.nombre}</h3>
                    {e.lider && <p className="text-accent text-xs font-semibold mt-0.5">Líder: {e.lider}</p>}
                  </div>
                  {e.descripcion && <p className="text-muted text-sm leading-relaxed line-clamp-2">{e.descripcion}</p>}

                  <div className="mt-auto pt-2">
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
              </div>
            );
          })}
        </div>
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
                <PhoneInput value={telefono} onChange={(v) => { setTelefono(v); if (formErrors.telefono) setFormErrors((p) => ({ ...p, telefono: undefined })); }} />
                {formErrors.telefono && <p className="text-red-400 text-xs mt-1">{formErrors.telefono}</p>}
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
