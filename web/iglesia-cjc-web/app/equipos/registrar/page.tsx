"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";

type Form = {
  nombre_gps: string;
  lideres: string;
  telefono: string;
  tipo: "afinidad" | "curricular" | "";
  poblacion: "femenina" | "masculina" | "mixta" | "";
  rango_edad: "12-17" | "18-30" | "30-45" | "45+" | "";
  dia_semana: string;
  hora_inicio: string;
  duracion_min: number;
  modalidad: "presencial" | "virtual" | "";
  max_personas: number;
  explicacion: string;
  materiales: string;
  fecha_inicio: string;
  fecha_fin: string;
};

const EMPTY: Form = {
  nombre_gps: "",
  lideres: "",
  telefono: "",
  tipo: "",
  poblacion: "",
  rango_edad: "",
  dia_semana: "",
  hora_inicio: "",
  duracion_min: 60,
  modalidad: "",
  max_personas: 8,
  explicacion: "",
  materiales: "",
  fecha_inicio: "",
  fecha_fin: "",
};

function timeToMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

function validarHorario(dia: string, hora: string, duracion: number): string | null {
  if (!dia || !hora) return null;
  const start = timeToMinutes(hora);
  const end = start + duracion;
  if (dia === "domingo" && start < 720 && end > 480) {
    return "No se pueden hacer GPS los domingos entre 8:00 a.m. y 12:00 m.d.";
  }
  if (dia === "martes" && start < 1260 && end > 1080) {
    return "No se pueden hacer GPS los martes entre 6:00 p.m. y 9:00 p.m.";
  }
  return null;
}

type Apertura = Form & { id: string; estado: string; nota_admin: string | null; creado_en: string };

export default function RegistrarGPS() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userNombre, setUserNombre] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userTelefono, setUserTelefono] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [misAperturas, setMisAperturas] = useState<Apertura[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [initialForm, setInitialForm] = useState<Form>(EMPTY);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      setUserEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("usuarios")
        .select("nombre, telefono")
        .eq("id", user.id)
        .maybeSingle();
      const nombre = (profile?.nombre as string | undefined) ?? "";
      const telefono = (profile?.telefono as string | undefined) ?? "";
      setUserNombre(nombre);
      setUserTelefono(telefono);
      setForm((f) => ({ ...f, telefono }));

      const { data: aps } = await supabase
        .from("gps_aperturas")
        .select("*")
        .eq("usuario_id", user.id)
        .order("creado_en", { ascending: false });
      setMisAperturas((aps ?? []) as Apertura[]);

      setLoading(false);
    })();
  }, []);

  const setField = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validar = (): boolean => {
    const next: Partial<Record<keyof Form, string>> = {};
    if (!form.nombre_gps.trim()) next.nombre_gps = "Ingresá un nombre.";
    if (!form.lideres.trim()) next.lideres = "Indicá quién lidera.";
    if (!form.telefono.trim()) next.telefono = "Teléfono requerido para contacto.";
    if (!form.tipo) next.tipo = "Elegí el tipo de GPS.";
    if (!form.poblacion) next.poblacion = "Elegí la población.";
    if (!form.rango_edad) next.rango_edad = "Elegí el rango de edad.";
    if (!form.dia_semana) next.dia_semana = "Elegí el día.";
    if (!form.hora_inicio) next.hora_inicio = "Indicá la hora de inicio.";
    if (form.duracion_min < 15 || form.duracion_min > 90) next.duracion_min = "Entre 15 y 90 minutos.";
    if (!form.modalidad) next.modalidad = "Elegí la modalidad.";
    if (form.max_personas < 3 || form.max_personas > 15) next.max_personas = "Entre 3 y 15 personas.";
    if (!form.explicacion.trim()) next.explicacion = "Agregá una breve explicación.";
    if (!form.fecha_inicio) next.fecha_inicio = "Fecha de inicio requerida.";
    if (!form.fecha_fin) next.fecha_fin = "Fecha de finalización requerida.";
    if (form.fecha_inicio && form.fecha_fin && form.fecha_fin < form.fecha_inicio) {
      next.fecha_fin = "Debe ser igual o posterior a la fecha de inicio.";
    }
    const horarioErr = validarHorario(form.dia_semana, form.hora_inicio, form.duracion_min);
    if (horarioErr) next.hora_inicio = horarioErr;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!userId) return;
    if (!validar()) return;
    setSubmitting(true);

    if (form.telefono.trim() && form.telefono.trim() !== userTelefono) {
      await supabase.from("usuarios").update({ telefono: form.telefono.trim() }).eq("id", userId);
    }

    const payload = {
      usuario_id: userId,
      usuario_nombre: userNombre,
      usuario_email: userEmail,
      nombre_gps: form.nombre_gps.trim(),
      lideres: form.lideres.trim(),
      telefono: form.telefono.trim(),
      tipo: form.tipo,
      poblacion: form.poblacion,
      rango_edad: form.rango_edad,
      dia_semana: form.dia_semana,
      hora_inicio: form.hora_inicio,
      duracion_min: form.duracion_min,
      modalidad: form.modalidad,
      max_personas: form.max_personas,
      explicacion: form.explicacion.trim(),
      materiales: form.materiales.trim() || null,
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin,
    };

    const op = editingId
      ? supabase.from("gps_aperturas").update({ ...payload, estado: "pendiente", nota_admin: null, actualizado_en: new Date().toISOString() }).eq("id", editingId)
      : supabase.from("gps_aperturas").insert(payload);

    const { error } = await op;
    setSubmitting(false);
    if (error) {
      console.error("[gps-registrar]", error);
      setErrors({ nombre_gps: `No se pudo enviar: ${error.message}` });
      return;
    }
    setSuccess(true);
  };

  const editarApertura = (a: Apertura) => {
    const loaded: Form = {
      nombre_gps: a.nombre_gps,
      lideres: a.lideres,
      telefono: a.telefono,
      tipo: a.tipo as Form["tipo"],
      poblacion: a.poblacion as Form["poblacion"],
      rango_edad: a.rango_edad as Form["rango_edad"],
      dia_semana: a.dia_semana,
      hora_inicio: a.hora_inicio,
      duracion_min: a.duracion_min,
      modalidad: a.modalidad as Form["modalidad"],
      max_personas: a.max_personas,
      explicacion: a.explicacion,
      materiales: a.materiales ?? "",
      fecha_inicio: a.fecha_inicio,
      fecha_fin: a.fecha_fin,
    };
    setForm(loaded);
    setInitialForm(loaded);
    setEditingId(a.id);
    setLocked(true);
    setErrors({});
    const el = document.getElementById("form-gps");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const hasChanges = editingId ? JSON.stringify(form) !== JSON.stringify(initialForm) : true;

  if (loading) {
    return <div className="max-w-3xl mx-auto px-6 py-16 text-center text-muted text-sm">Cargando...</div>;
  }

  if (!userId) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-muted mb-4">Para solicitar la apertura de un GPS necesitás iniciar sesión.</p>
        <Link href="/login" className="btn-primary inline-block">Iniciar sesión</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
          <Check className="text-green-400" size={28} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{editingId ? "¡Solicitud actualizada!" : "¡Solicitud enviada!"}</h1>
        <p className="text-muted max-w-md mx-auto mb-8">
          El equipo GPS revisará tu propuesta y te contactará por los datos suministrados para coordinar los siguientes pasos.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/equipos" className="btn-secondary py-2 px-4 text-sm">Volver a GPS</Link>
          <button onClick={() => { setForm({ ...EMPTY, telefono: userTelefono }); setSuccess(false); setEditingId(null); }} className="btn-primary py-2 px-4 text-sm">
            Enviar otra solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-12 py-10">
      <button onClick={() => router.push("/equipos")} className="inline-flex items-center gap-2 text-muted hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft size={14} /> Volver a GPS
      </button>

      <div className="mb-3">
        <span className="section-label">Comunidad</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-3">{editingId ? "Editar solicitud GPS" : "Registrar GPS"}</h1>
      <p className="text-muted leading-relaxed mb-8">
        Los Grupos Pequeños Saludables (GPS) son una herramienta fundamental para vivir la iglesia en comunidad, fomentar relaciones auténticas y facilitar el crecimiento espiritual. Los GPS están diseñados para ser espacios abiertos, seguros y accesibles, promoviendo una experiencia positiva tanto para participantes nuevos como antiguos.
      </p>

      {misAperturas.length > 0 && !editingId && (
        <div className="mb-8 space-y-3">
          <p className="text-white/40 text-xs uppercase tracking-wider">Tus solicitudes</p>
          {misAperturas.map((a) => (
            <div key={a.id} className={`p-4 rounded-2xl border ${a.estado === "en_revision" ? "border-amber-500/40 bg-amber-500/5" : "border-border"}`} style={a.estado !== "en_revision" ? { background: "#0D1628" } : {}}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">{a.nombre_gps}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    Enviada el {new Date(a.creado_en).toLocaleDateString("es-CR", { timeZone: "America/Costa_Rica", day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                  a.estado === "aprobada"
                    ? "bg-green-500/15 text-green-400 border border-green-500/20"
                    : a.estado === "rechazada"
                      ? "bg-red-500/15 text-red-400 border border-red-500/20"
                      : a.estado === "en_revision"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                }`}>
                  {a.estado === "en_revision" ? "En revisión" : a.estado}
                </span>
              </div>

              {a.estado === "en_revision" && a.nota_admin && (
                <div className="mt-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300 text-sm whitespace-pre-wrap">
                  <p className="text-amber-400 text-[10px] uppercase tracking-wider font-bold mb-1">Comentarios del equipo GPS:</p>
                  {a.nota_admin}
                </div>
              )}

              {a.estado === "en_revision" && (
                <button
                  onClick={() => editarApertura(a)}
                  className="btn-primary mt-3 py-1.5 px-3 text-xs flex items-center gap-1.5"
                >
                  Editar formulario
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {editingId && (
        <div className="mb-4 p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm flex items-center justify-between gap-3 flex-wrap">
          <span>
            {locked
              ? "Revisá la solicitud. Hacé click en Editar formulario para modificar."
              : "Editando solicitud. Al guardar se reenvía al equipo GPS."}
          </span>
          <div className="flex items-center gap-3 shrink-0">
            {locked && (
              <button
                onClick={() => setLocked(false)}
                className="btn-primary py-1.5 px-3 text-xs inline-flex items-center gap-1.5"
              >
                Editar formulario
              </button>
            )}
            <button
              onClick={() => { setEditingId(null); setLocked(false); setForm({ ...EMPTY, telefono: userTelefono }); setInitialForm(EMPTY); }}
              className="text-xs underline hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div id="form-gps" className={`space-y-6 rounded-2xl border border-border p-5 sm:p-7 transition-opacity ${locked ? "opacity-60" : ""}`} style={{ background: "#0D1628" }}>
        <div>
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Información de quien envía</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-white/50 text-xs mb-1 block">Nombre</label>
              <input className="input w-full opacity-70 cursor-not-allowed" value={userNombre} disabled />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Email</label>
              <input className="input w-full opacity-70 cursor-not-allowed" value={userEmail} disabled />
            </div>
          </div>
        </div>

        <div>
          <label className="text-white/50 text-xs mb-1 block">Nombre del GPS *</label>
          <input
            className={`input w-full ${errors.nombre_gps ? "border-red-500/60" : ""}`}
            value={form.nombre_gps}
            onChange={(e) => setField("nombre_gps", e.target.value)}
            placeholder="Ej: Matrimonios que crecen"
            disabled={locked}
          />
          <p className="text-white/30 text-xs mt-1">Claro, atractivo y relacionado con el enfoque del grupo. El nombre será valorado por el equipo GPS para sugerencias o mejoras.</p>
          {errors.nombre_gps && <p className="text-red-400 text-xs mt-1">{errors.nombre_gps}</p>}
        </div>

        <div>
          <label className="text-white/50 text-xs mb-1 block">Personas a cargo *</label>
          <input
            className={`input w-full ${errors.lideres ? "border-red-500/60" : ""}`}
            value={form.lideres}
            onChange={(e) => setField("lideres", e.target.value)}
            placeholder="Nombres de quien lidera / invita"
            disabled={locked}
          />
          {errors.lideres && <p className="text-red-400 text-xs mt-1">{errors.lideres}</p>}
        </div>

        <div>
          <label className="text-white/50 text-xs mb-1 block">Teléfono (WhatsApp del líder) *</label>
          <fieldset disabled={locked} className={locked ? "pointer-events-none" : ""}>
            <PhoneInput value={form.telefono} onChange={(v) => setField("telefono", v)} />
          </fieldset>
          {!userTelefono && (
            <p className="text-amber-400/70 text-xs mt-1">No tenés teléfono en tu perfil. Al guardar la solicitud también se guarda en tu perfil.</p>
          )}
          {errors.telefono && <p className="text-red-400 text-xs mt-1">{errors.telefono}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-white/50 text-xs mb-1 block">Tipo de GPS *</label>
            <select className={`input w-full ${errors.tipo ? "border-red-500/60" : ""}`} value={form.tipo} onChange={(e) => setField("tipo", e.target.value as Form["tipo"])} disabled={locked}>
              <option value="">Seleccioná...</option>
              <option value="afinidad">Afinidad</option>
              <option value="curricular">Curricular</option>
            </select>
            {errors.tipo && <p className="text-red-400 text-xs mt-1">{errors.tipo}</p>}
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1 block">Población *</label>
            <select className={`input w-full ${errors.poblacion ? "border-red-500/60" : ""}`} value={form.poblacion} onChange={(e) => setField("poblacion", e.target.value as Form["poblacion"])} disabled={locked}>
              <option value="">Seleccioná...</option>
              <option value="femenina">Femenina</option>
              <option value="masculina">Masculina</option>
              <option value="mixta">Mixta</option>
            </select>
            {errors.poblacion && <p className="text-red-400 text-xs mt-1">{errors.poblacion}</p>}
          </div>
        </div>

        <div>
          <label className="text-white/50 text-xs mb-1 block">Rango de edad *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["12-17", "18-30", "30-45", "45+"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setField("rango_edad", r)}
                disabled={locked}
                className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  form.rango_edad === r
                    ? "border-accent bg-accent/15 text-white"
                    : "border-border text-white/60 hover:border-white/20"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {errors.rango_edad && <p className="text-red-400 text-xs mt-1">{errors.rango_edad}</p>}
        </div>

        <div>
          <p className="text-white/50 text-xs mb-2">Día y hora del GPS *</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-wider mb-1 block">Día</label>
              <select className={`input w-full ${errors.dia_semana ? "border-red-500/60" : ""}`} value={form.dia_semana} onChange={(e) => setField("dia_semana", e.target.value)} disabled={locked}>
                <option value="">Seleccioná...</option>
                <option value="lunes">Lunes</option>
                <option value="martes">Martes</option>
                <option value="miercoles">Miércoles</option>
                <option value="jueves">Jueves</option>
                <option value="viernes">Viernes</option>
                <option value="sabado">Sábado</option>
                <option value="domingo">Domingo</option>
              </select>
            </div>
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-wider mb-1 block">Hora inicio</label>
              <input type="time" className={`input w-full ${errors.hora_inicio ? "border-red-500/60" : ""}`} value={form.hora_inicio} onChange={(e) => setField("hora_inicio", e.target.value)} disabled={locked} />
            </div>
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-wider mb-1 block">Duración (min, máx 90)</label>
              <input
                type="number"
                min={15}
                max={90}
                step={15}
                className={`input w-full ${errors.duracion_min ? "border-red-500/60" : ""}`}
                value={form.duracion_min}
                onChange={(e) => setField("duracion_min", Number(e.target.value))} disabled={locked}
              />
            </div>
          </div>
          {errors.dia_semana && <p className="text-red-400 text-xs mt-1">{errors.dia_semana}</p>}
          {errors.hora_inicio && <p className="text-red-400 text-xs mt-1">{errors.hora_inicio}</p>}
          {errors.duracion_min && <p className="text-red-400 text-xs mt-1">{errors.duracion_min}</p>}
          <p className="text-white/30 text-xs mt-2">
            Duración máxima 1:30 horas. No disponible: domingos 8:00 a.m. – 12:00 m.d. · martes 6:00 p.m. – 9:00 p.m.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-white/50 text-xs mb-1 block">Modalidad *</label>
            <select className={`input w-full ${errors.modalidad ? "border-red-500/60" : ""}`} value={form.modalidad} onChange={(e) => setField("modalidad", e.target.value as Form["modalidad"])} disabled={locked}>
              <option value="">Seleccioná...</option>
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
            </select>
            {errors.modalidad && <p className="text-red-400 text-xs mt-1">{errors.modalidad}</p>}
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1 block">Número de personas (3–15) *</label>
            <input
              type="number"
              min={3}
              max={15}
              className={`input w-full ${errors.max_personas ? "border-red-500/60" : ""}`}
              value={form.max_personas}
              onChange={(e) => setField("max_personas", Number(e.target.value))} disabled={locked}
            />
            {errors.max_personas && <p className="text-red-400 text-xs mt-1">{errors.max_personas}</p>}
          </div>
        </div>

        <div>
          <label className="text-white/50 text-xs mb-1 block">Explicación *</label>
          <textarea
            className={`input w-full h-28 resize-none ${errors.explicacion ? "border-red-500/60" : ""}`}
            value={form.explicacion}
            onChange={(e) => setField("explicacion", e.target.value)} disabled={locked}
            placeholder="¿Qué se hará en el grupo y hacia dónde apunta? Ej: conectar personas, fortalecer relaciones, crecer en un tema específico, acompañamiento espiritual, etc."
          />
          {errors.explicacion && <p className="text-red-400 text-xs mt-1">{errors.explicacion}</p>}
        </div>

        <div>
          <label className="text-white/50 text-xs mb-1 block">Materiales o recursos a utilizar</label>
          <textarea
            className="input w-full h-20 resize-none"
            value={form.materiales}
            onChange={(e) => setField("materiales", e.target.value)} disabled={locked}
            placeholder="Libros, guías, refrigerio, etc. (opcional)"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-white/50 text-xs mb-1 block">Fecha de inicio *</label>
            <input
              type="date"
              className={`input w-full ${errors.fecha_inicio ? "border-red-500/60" : ""}`}
              value={form.fecha_inicio}
              onChange={(e) => setField("fecha_inicio", e.target.value)} disabled={locked}
            />
            {errors.fecha_inicio && <p className="text-red-400 text-xs mt-1">{errors.fecha_inicio}</p>}
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1 block">Fecha de finalización *</label>
            <input
              type="date"
              className={`input w-full ${errors.fecha_fin ? "border-red-500/60" : ""}`}
              value={form.fecha_fin}
              onChange={(e) => setField("fecha_fin", e.target.value)} disabled={locked}
            />
            {errors.fecha_fin && <p className="text-red-400 text-xs mt-1">{errors.fecha_fin}</p>}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2 border-t border-border">
          <Link href="/equipos" className="btn-secondary py-2 px-4 text-sm">Cancelar</Link>
          <button
            onClick={() => void submit()}
            disabled={submitting || locked || (editingId !== null && !hasChanges)}
            className="btn-primary py-2 px-5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={locked ? "Hacé click en Editar formulario primero" : (editingId && !hasChanges) ? "Hacé al menos un cambio para reenviar" : ""}
          >
            {submitting ? <Loader size={14} className="animate-spin" /> : <Check size={14} />}
            {submitting ? "Enviando..." : editingId ? "Reenviar solicitud" : "Enviar solicitud"}
          </button>
        </div>
      </div>
    </div>
  );
}
