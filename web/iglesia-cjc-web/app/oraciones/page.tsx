"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";
import type { Oracion } from "@/lib/supabase";
import { Heart } from "lucide-react";
import { sendNotification } from "@/lib/notifications";

export default function OracionesPage() {
  const [oraciones, setOraciones] = useState<Oracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [miNombre, setMiNombre] = useState("");
  const [usarMiNombre, setUsarMiNombre] = useState(true);
  const [peticion, setPeticion] = useState("");
  const [anonima, setAnonima] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [prayed, setPrayed] = useState<Set<string>>(new Set());
  const [praying, setPraying] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ nombre?: string; peticion?: string }>({});

  useEffect(() => {
    void (async () => { const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const uid = session.user.id;
        setUserId(uid);

        const { data: profile } = await supabase
          .from("usuarios")
          .select("nombre")
          .eq("id", uid)
          .maybeSingle();
        setMiNombre((profile?.nombre as string | null) ?? "");

        supabase
          .from("oracion_orantes")
          .select("oracion_id")
          .eq("user_id", uid)
          .then(({ data: rows }: { data: { oracion_id: string }[] | null }) => {
            setPrayed(new Set((rows ?? []).map((r) => r.oracion_id)));
          });
      }
    })();

    supabase
      .from("oraciones")
      .select("*")
      .eq("estado", "aprobada")
      .order("fecha", { ascending: false })
      .then(({ data }: { data: Oracion[] | null }) => {
        setOraciones(data ?? []);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: { nombre?: string; peticion?: string } = {};
    const nombreActual = usarMiNombre && miNombre ? miNombre : nombre;
    if (!anonima && !nombreActual.trim()) nextErrors.nombre = "Escribí tu nombre o marca la opción anónima.";
    if (!peticion.trim()) nextErrors.peticion = "Contanos brevemente tu petición.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setEnviando(true);

    const nombreFinal = anonima ? "Anónimo" : nombreActual;

    const { error } = await supabase.from("oraciones").insert({
      nombre: nombreFinal,
      peticion,
      anonima,
      estado: "pendiente",
      ...(userId ? { autor_uid: userId } : {}),
    });

    setEnviando(false);
    if (!error) {
      setMensaje("¡Tu petición fue enviada! Será revisada pronto.");
      setNombre("");
      setPeticion("");
      setAnonima(false);
    } else {
      setMensaje("Ocurrió un error. Intenta de nuevo.");
    }
  };

  const handlePray = async (oracion: Oracion) => {
    if (!userId || praying || prayed.has(oracion.id)) return;
    setPraying(oracion.id);

    const { error } = await supabase.from("oracion_orantes").insert({ oracion_id: oracion.id, user_id: userId });

    if (!error) {
      setPrayed((prev) => new Set(prev).add(oracion.id));
      setOraciones((prev) => prev.map((o) => (o.id === oracion.id ? { ...o, orantes: o.orantes + 1 } : o)));
      if (oracion.autor_uid && oracion.autor_uid !== userId) {
        void sendNotification(oracion.autor_uid, "oracion_orada", "Alguien oró por ti", `Tu petición recibió una oración más`, { oracion_id: oracion.id });
      }
    }
    setPraying(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Comunidad</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">Peticiones de Oración</h1>
      <p className="text-muted mb-12">Oramos juntos. Comparte tu petición o intercede por otros.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="card">
          <h2 className="font-bold text-white text-xl mb-6">Enviar una petición</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!anonima && (
              <>
                {userId && miNombre && (
                  <label className="flex items-center gap-3 text-muted text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usarMiNombre}
                      onChange={(e) => setUsarMiNombre(e.target.checked)}
                      className="accent-accent"
                    />
                    Usar mi nombre: <span className="text-white/70">{miNombre}</span>
                  </label>
                )}

                <input
                  className={`input ${errors.nombre ? "border-red-500/60" : ""}`}
                  placeholder="Tu nombre"
                  value={usarMiNombre && miNombre ? miNombre : nombre}
                  onChange={(e) => { setNombre(e.target.value); if (errors.nombre) setErrors((p) => ({ ...p, nombre: undefined })); }}
                  disabled={usarMiNombre && !!miNombre}
                />
                {errors.nombre && <p className="text-red-400 text-xs">{errors.nombre}</p>}
              </>
            )}

            <textarea
              className={`input min-h-[120px] resize-none ${errors.peticion ? "border-red-500/60" : ""}`}
              placeholder="¿Por qué quieres que oremos?"
              value={peticion}
              onChange={(e) => { setPeticion(e.target.value); if (errors.peticion) setErrors((p) => ({ ...p, peticion: undefined })); }}
            />
            {errors.peticion && <p className="text-red-400 text-xs">{errors.peticion}</p>}

            <label className="flex items-center gap-3 text-muted text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={anonima}
                onChange={(e) => setAnonima(e.target.checked)}
                className="accent-accent"
              />
              Enviar anónimamente
            </label>

            <button type="submit" disabled={enviando} className="btn-primary px-5 py-2 text-sm w-full sm:w-auto">
              {enviando ? "Enviando..." : "Enviar petición"}
            </button>

            {mensaje && <p className="text-accent text-sm text-center">{mensaje}</p>}
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-white text-xl mb-6">Peticiones aprobadas</h2>
          {loading ? (
            <p className="text-muted">Cargando...</p>
          ) : oraciones.length === 0 ? (
            <p className="text-muted">No hay peticiones aún.</p>
          ) : (
            oraciones.map((o) => {
              const alreadyPrayed = prayed.has(o.id);
              const isPraying = praying === o.id;
              return (
                <div key={o.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-accent font-semibold text-sm mb-1">{o.anonima ? "Anónimo" : o.nombre}</p>
                      <p className="text-white text-sm leading-relaxed">{o.peticion}</p>
                      <p className="text-muted text-xs mt-2">
                        {new Date(o.fecha).toLocaleDateString("es", { timeZone: "America/Costa_Rica", day: "numeric", month: "long" })}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      {userId ? (
                        <button
                          onClick={() => handlePray(o)}
                          disabled={alreadyPrayed || isPraying}
                          title={alreadyPrayed ? "Ya oraste por esta petición" : "Orar por esta petición"}
                          className={`flex flex-col items-center gap-0.5 transition-all ${
                            alreadyPrayed ? "text-accent cursor-default" : "text-white/30 hover:text-accent cursor-pointer"
                          }`}
                        >
                          <Heart size={18} className={alreadyPrayed ? "fill-accent text-accent" : ""} />
                          <span className="text-[10px] font-semibold">{o.orantes}</span>
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5 text-muted">
                          <Heart size={14} className="text-accent" />
                          <span className="text-xs">{o.orantes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
