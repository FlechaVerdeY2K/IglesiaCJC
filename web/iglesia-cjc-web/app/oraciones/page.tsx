"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";
import type { Oracion } from "@/lib/supabase";
import { Heart } from "lucide-react";

export default function OracionesPage() {
  const [oraciones, setOraciones] = useState<Oracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [peticion, setPeticion] = useState("");
  const [anonima, setAnonima] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => {
      if (data.user) setUserId(data.user.id);
    });
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
    setEnviando(true);
    const { error } = await supabase.from("oraciones").insert({
      nombre: anonima ? "Anónimo" : nombre,
      peticion,
      anonima,
      estado: "pendiente",
      ...(userId ? { autor_uid: userId } : {}),
    });
    setEnviando(false);
    if (!error) {
      setMensaje("¡Tu petición fue enviada! Será revisada pronto.");
      setNombre(""); setPeticion(""); setAnonima(false);
    } else {
      setMensaje("Ocurrió un error. Intenta de nuevo.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Comunidad</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">Peticiones de Oración</h1>
      <p className="text-muted mb-12">Oramos juntos. Comparte tu petición o intercede por otros.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Formulario */}
        <div className="card">
          <h2 className="font-bold text-white text-xl mb-6">Enviar una petición</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!anonima && (
              <input
                className="input"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required={!anonima}
              />
            )}
            <textarea
              className="input min-h-[120px] resize-none"
              placeholder="¿Por qué quieres que oremos?"
              value={peticion}
              onChange={(e) => setPeticion(e.target.value)}
              required
            />
            <label className="flex items-center gap-3 text-muted text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={anonima}
                onChange={(e) => setAnonima(e.target.checked)}
                className="accent-accent"
              />
              Enviar anónimamente
            </label>
            <button type="submit" disabled={enviando} className="btn-primary w-full">
              {enviando ? "Enviando..." : "Enviar petición"}
            </button>
            {mensaje && <p className="text-accent text-sm text-center">{mensaje}</p>}
          </form>
        </div>

        {/* Lista */}
        <div className="space-y-4">
          <h2 className="font-bold text-white text-xl mb-6">Peticiones aprobadas</h2>
          {loading ? (
            <p className="text-muted">Cargando...</p>
          ) : oraciones.length === 0 ? (
            <p className="text-muted">No hay peticiones aún.</p>
          ) : (
            oraciones.map((o) => (
              <div key={o.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-accent font-semibold text-sm mb-1">
                      {o.anonima ? "Anónimo" : o.nombre}
                    </p>
                    <p className="text-white text-sm leading-relaxed">{o.peticion}</p>
                    <p className="text-muted text-xs mt-2">
                      {new Date(o.fecha).toLocaleDateString("es", { timeZone: "America/Costa_Rica", day: "numeric", month: "long" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-muted text-xs shrink-0">
                    <Heart size={14} className="text-accent" />
                    <span>{o.orantes}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
