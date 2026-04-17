"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { Check, X, Plus, Users, ChevronDown, ChevronUp, Trash2, Upload, Image as ImageIcon, UserPlus } from "lucide-react";
import { sendNotification } from "@/lib/notifications";
import { CLOUDINARY_PRESET, cloudinaryUploadUrl } from "@/lib/cloudinary";

type LiderInfo = { id: string; nombre: string; foto_url?: string | null };

type Equipo = {
  id: string;
  nombre: string;
  descripcion: string;
  lider: string;
  lider_id?: string | null;
  icon_name?: string | null;
  lideres?: LiderInfo[] | null;
};

type Solicitud = {
  id: string;
  source: "equipo_solicitudes" | "gps_registros";
  usuario_id: string;
  equipo_id: string | null;
  equipo_nombre: string;
  estado: string;
  created_at: string;
  usuario?: { nombre: string; foto_url: string | null; email?: string | null };
};

type Usuario = { id: string; nombre: string; email: string; foto_url: string | null; rol: string };

function normalizeEstado(estado: string) {
  const e = (estado ?? "").toLowerCase();
  if (e === "aprobado" || e === "aprobada") return "aprobado";
  if (e === "rechazado" || e === "rechazada") return "rechazado";
  return "pendiente";
}

function isImageUrl(value?: string | null) {
  return !!value && /^https?:\/\//i.test(value);
}

export default function AdminEquipos() {
  const [tab, setTab] = useState<"solicitudes" | "equipos">("solicitudes");
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEquipo, setExpandedEquipo] = useState<string | null>(null);
  const [miembros, setMiembros] = useState<Record<string, Usuario[]>>({});

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "", lider_id: "", icon_name: "" });
  const [saving, setSaving] = useState(false);
  const [uploadingEquipoId, setUploadingEquipoId] = useState<string | null>(null);
  const [uploadingNewImage, setUploadingNewImage] = useState(false);
  const [assigningFor, setAssigningFor] = useState<Record<string, string>>({});
  const [savingAssignFor, setSavingAssignFor] = useState<string | null>(null);
  const [assigningLiderFor, setAssigningLiderFor] = useState<Record<string, string>>({});
  const [savingLiderFor, setSavingLiderFor] = useState<string | null>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const targetEquipoIdRef = useRef<string | null>(null);
  const newImageFileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);

    const [eqRes, usrRes, solsModernRes, solsLegacyRes] = await Promise.all([
      supabase.from("equipos").select("*").order("nombre"),
      supabase.from("usuarios").select("id, nombre, email, foto_url, rol").order("nombre"),
      supabase
        .from("equipo_solicitudes")
        .select("id, usuario_id, equipo_id, equipo_nombre, estado, creado_en, usuario:usuarios(nombre, foto_url, email)")
        .order("creado_en", { ascending: false }),
      supabase
        .from("gps_registros")
        .select("id, usuario_id, equipo_id, equipo_nombre, estado, created_at, usuario:usuarios(nombre, foto_url, email)")
        .order("created_at", { ascending: false }),
    ]);

    setEquipos((eqRes.data ?? []) as Equipo[]);
    setUsuarios((usrRes.data ?? []) as Usuario[]);

    const modern = ((solsModernRes.data ?? []) as Array<Record<string, unknown>>).map((s) => ({
      id: String(s.id),
      source: "equipo_solicitudes" as const,
      usuario_id: String(s.usuario_id ?? ""),
      equipo_id: (s.equipo_id as string | null) ?? null,
      equipo_nombre: String(s.equipo_nombre ?? ""),
      estado: normalizeEstado(String(s.estado ?? "pendiente")),
      created_at: String(s.creado_en ?? new Date().toISOString()),
      usuario: (s.usuario as { nombre: string; foto_url: string | null; email?: string | null } | null) ?? undefined,
    }));

    const legacy = ((solsLegacyRes.data ?? []) as Array<Record<string, unknown>>).map((s) => ({
      id: String(s.id),
      source: "gps_registros" as const,
      usuario_id: String(s.usuario_id ?? ""),
      equipo_id: (s.equipo_id as string | null) ?? null,
      equipo_nombre: String(s.equipo_nombre ?? ""),
      estado: normalizeEstado(String(s.estado ?? "pendiente")),
      created_at: String(s.created_at ?? new Date().toISOString()),
      usuario: (s.usuario as { nombre: string; foto_url: string | null; email?: string | null } | null) ?? undefined,
    }));

    setSolicitudes(modern.length > 0 ? modern : legacy);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const updateEstado = async (solicitud: Solicitud, estado: "aprobado" | "rechazado") => {
    if (solicitud.source === "equipo_solicitudes") {
      await supabase.from("equipo_solicitudes").update({ estado }).eq("id", solicitud.id);
    } else {
      await supabase
        .from("gps_registros")
        .update({ estado: estado === "aprobado" ? "aprobada" : "rechazada" })
        .eq("id", solicitud.id);
    }

    if (estado === "aprobado") {
      await supabase.from("usuarios").update({ rol: "miembro" }).eq("id", solicitud.usuario_id).is("rol", null);
    }
    void load();
    if (solicitud.equipo_id) void loadMiembros(solicitud.equipo_id, true);
  };

  const loadMiembros = async (equipoId: string, force = false) => {
    if (!force && miembros[equipoId]) return;

    const [modernRes, legacyRes] = await Promise.all([
      supabase.from("equipo_solicitudes").select("usuario_id").eq("equipo_id", equipoId).eq("estado", "aprobado"),
      supabase.from("gps_registros").select("usuario_id").eq("equipo_id", equipoId).eq("estado", "aprobada"),
    ]);

    const ids = Array.from(
      new Set([...(modernRes.data ?? []), ...(legacyRes.data ?? [])].map((r: { usuario_id: string }) => r.usuario_id).filter(Boolean))
    );

    if (ids.length === 0) {
      setMiembros((prev) => ({ ...prev, [equipoId]: [] }));
      return;
    }

    const { data: usrData } = await supabase.from("usuarios").select("id, nombre, email, foto_url").in("id", ids);
    setMiembros((prev) => ({ ...prev, [equipoId]: (usrData ?? []) as Usuario[] }));
  };

  const toggleEquipo = (id: string) => {
    if (expandedEquipo === id) {
      setExpandedEquipo(null);
    } else {
      setExpandedEquipo(id);
      void loadMiembros(id);
    }
  };

  const createEquipo = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    const liderUser = usuarios.find((u) => u.id === form.lider_id);
    await supabase.from("equipos").insert({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      lider_id: form.lider_id || null,
      lider: liderUser?.nombre ?? "",
      icon_name: form.icon_name || null,
    });
    setForm({ nombre: "", descripcion: "", lider_id: "", icon_name: "" });
    setShowForm(false);
    setSaving(false);
    void load();
  };

  const deleteEquipo = async (id: string) => {
    if (!confirm("¿Eliminar este ministerio?")) return;
    await supabase.from("equipo_solicitudes").update({ equipo_id: null }).eq("equipo_id", id);
    await supabase.from("gps_registros").update({ equipo_id: null }).eq("equipo_id", id);
    await supabase.from("equipos").delete().eq("id", id);
    void load();
  };

  const uploadEquipoImage = async (equipoId: string, file: File) => {
    setUploadingEquipoId(equipoId);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    fd.append("folder", "ministerios");

    const res = await fetch(cloudinaryUploadUrl(), {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (data.secure_url) {
      await supabase.from("equipos").update({ icon_name: data.secure_url }).eq("id", equipoId);
      void load();
    }
    setUploadingEquipoId(null);
  };

  const uploadImageOnly = async (file: File) => {
    setUploadingNewImage(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    fd.append("folder", "ministerios");
    const res = await fetch(cloudinaryUploadUrl(), {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (data.secure_url) {
      setForm((f) => ({ ...f, icon_name: data.secure_url as string }));
    }
    setUploadingNewImage(false);
  };

  const addMemberToMinisterio = async (equipo: Equipo) => {
    const userId = assigningFor[equipo.id];
    if (!userId) return;
    const user = usuarios.find((u) => u.id === userId);
    if (!user) return;

    setSavingAssignFor(equipo.id);
    const payload = {
      usuario_id: userId,
      equipo_id: equipo.id,
      equipo_nombre: equipo.nombre,
      estado: "aprobado",
    };
    const primary = await supabase.from("equipo_solicitudes").insert(payload);
    if (primary.error) {
      await supabase.from("equipo_solicitudes").insert({
        usuario_id: userId,
        equipo_id: equipo.id,
        estado: "aprobado",
      });
    }
    void sendNotification(userId, "ministerio_agregado", `Te agregaron al ministerio ${equipo.nombre}`, null, { equipo_id: equipo.id, equipo_nombre: equipo.nombre });
    setAssigningFor((prev) => ({ ...prev, [equipo.id]: "" }));
    setSavingAssignFor(null);
    void load();
    void loadMiembros(equipo.id, true);
  };

  const removeMemberFromMinisterio = async (equipoId: string, userId: string) => {
    const equipo = equipos.find((e) => e.id === equipoId);
    await supabase.from("equipo_solicitudes").delete().eq("equipo_id", equipoId).eq("usuario_id", userId);
    await supabase.from("gps_registros").delete().eq("equipo_id", equipoId).eq("usuario_id", userId);
    void sendNotification(userId, "ministerio_removido", `Te removieron del ministerio ${equipo?.nombre ?? ""}`, null, { equipo_id: equipoId });
    void loadMiembros(equipoId, true);
  };

  const assignLider = async (equipo: Equipo) => {
    const userId = assigningLiderFor[equipo.id];
    if (!userId) return;
    const user = usuarios.find((u) => u.id === userId);
    if (!user) return;
    const current: LiderInfo[] = equipo.lideres ?? [];
    if (current.some((l) => l.id === userId)) {
      setAssigningLiderFor((prev) => ({ ...prev, [equipo.id]: "" }));
      return;
    }
    setSavingLiderFor(equipo.id);
    const updated: LiderInfo[] = [...current, { id: user.id, nombre: user.nombre, foto_url: user.foto_url }];
    const firstName = updated[0];
    await supabase.from("equipos").update({ lideres: updated, lider_id: firstName.id, lider: firstName.nombre }).eq("id", equipo.id);
    const { data: userRow } = await supabase.from("usuarios").select("roles, rol").eq("id", userId).single();
    const currentRoles: string[] = userRow?.roles ?? (userRow?.rol ? [userRow.rol, "miembro"] : ["miembro"]);
    const isAdmin = currentRoles.includes("admin");
    const newRoles = isAdmin ? ["admin", "lider", "cocina", "miembro"] : ["lider", "miembro"];
    const newPrimary = isAdmin ? "admin" : "lider";
    await supabase.from("usuarios").update({ roles: newRoles, rol: newPrimary }).eq("id", userId);
    setAssigningLiderFor((prev) => ({ ...prev, [equipo.id]: "" }));
    setSavingLiderFor(null);
    void load();
  };

  const removeLider = async (equipo: Equipo, liderId: string) => {
    const updated = (equipo.lideres ?? []).filter((l) => l.id !== liderId);
    const first = updated[0] ?? null;
    await supabase.from("equipos").update({ lideres: updated, lider_id: first?.id ?? null, lider: first?.nombre ?? "" }).eq("id", equipo.id);
    void load();
  };

  const pendientes = solicitudes.filter((s) => s.estado === "pendiente");
  const lideresOpciones = usuarios.filter((u) => ["lider", "admin"].includes(u.rol));

  const getEquipoNombre = (s: Solicitud) => {
    if (s.equipo_id) return equipos.find((e) => e.id === s.equipo_id)?.nombre ?? s.equipo_nombre;
    return s.equipo_nombre;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Ministerios</h1>
          <p className="text-white/40 text-sm mt-1">{pendientes.length} solicitudes pendientes</p>
        </div>
        {tab === "equipos" && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "rgba(191,30,46,0.15)", color: "#BF1E2E", border: "1px solid rgba(191,30,46,0.3)" }}
          >
            <Plus size={15} /> Nuevo ministerio
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-5 p-1 rounded-xl border border-border w-fit" style={{ background: "#080E1E" }}>
        {(["solicitudes", "equipos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-1.5 ${tab === t ? "bg-accent text-white" : "text-white/40 hover:text-white"}`}
          >
            {t === "solicitudes" ? "Solicitudes" : "Ministerios"}
            {t === "solicitudes" && pendientes.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t ? "bg-white/20" : "bg-amber-500/20 text-amber-400"}`}>
                {pendientes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/30 text-sm py-8">Cargando...</p>
      ) : tab === "solicitudes" ? (
        <div className="space-y-3">
          {solicitudes.length === 0 && <p className="text-white/30 text-sm text-center py-12">No hay solicitudes</p>}

          {solicitudes.map((s) => (
            <div key={`${s.source}-${s.id}`} className="flex items-center gap-4 p-4 rounded-2xl border border-border" style={{ background: "#0D1628" }}>
              {s.usuario?.foto_url ? (
                <Image src={s.usuario.foto_url} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" width={36} height={36} />
              ) : (
                <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-white shrink-0">{s.usuario?.nombre?.[0] ?? "?"}</div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{s.usuario?.nombre ?? s.usuario_id}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  Solicita unirse a <span className="text-accent font-semibold">{getEquipoNombre(s)}</span>
                </p>
                <p className="text-white/20 text-xs mt-0.5">{new Date(s.created_at).toLocaleDateString("es", { timeZone: "America/Costa_Rica", day: "numeric", month: "short", year: "numeric" })}</p>
              </div>

              <span
                className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                  s.estado === "aprobado"
                    ? "bg-green-500/15 text-green-400 border border-green-500/20"
                    : s.estado === "rechazado"
                      ? "bg-red-500/15 text-red-400 border border-red-500/20"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                }`}
              >
                {s.estado}
              </span>

              {s.estado === "pendiente" && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => void updateEstado(s, "aprobado")} className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors">
                    <Check size={15} />
                  </button>
                  <button onClick={() => void updateEstado(s, "rechazado")} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {showForm && (
            <div className="p-5 rounded-2xl border border-accent/20 space-y-4" style={{ background: "#0D1628" }}>
              <h3 className="text-white font-bold">Nuevo Ministerio</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Nombre *</label>
                  <input className="input w-full" placeholder="Ej: Benjamines" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Líder</label>
                  <select className="input w-full" value={form.lider_id} onChange={(e) => setForm((f) => ({ ...f, lider_id: e.target.value }))}>
                    <option value="">— Sin asignar —</option>
                    {lideresOpciones.map((u) => (
                      <option key={u.id} value={u.id}>{u.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Descripción</label>
                <textarea className="input w-full resize-none" rows={2} placeholder="Descripción del ministerio..." value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
              </div>

              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Foto</label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (!file || !file.type.startsWith("image/")) return;
                    await uploadImageOnly(file);
                  }}
                  className="rounded-xl border border-dashed border-white/20 p-4 text-center"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  {form.icon_name && isImageUrl(form.icon_name) ? (
                    <div className="space-y-2">
                      <Image src={form.icon_name} alt="preview" width={240} height={120} className="w-full max-w-[260px] h-28 object-cover rounded-lg mx-auto border border-white/10" />
                      <p className="text-white/35 text-xs">Imagen cargada</p>
                    </div>
                  ) : (
                    <p className="text-white/40 text-sm">Arrastra una imagen aquí o selecciónala desde tu dispositivo</p>
                  )}
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => newImageFileRef.current?.click()}
                      className="btn-secondary text-sm px-3 py-1.5 inline-flex items-center gap-2"
                      disabled={uploadingNewImage}
                    >
                      <Upload size={14} />
                      {uploadingNewImage ? "Subiendo..." : "Seleccionar foto"}
                    </button>
                    {form.icon_name && (
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, icon_name: "" }))}
                        className="text-xs text-white/40 hover:text-red-400"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => void createEquipo()} disabled={saving || !form.nombre.trim()} className="btn-primary px-5 py-2 text-sm disabled:opacity-50">
                  {saving ? "Guardando..." : "Crear ministerio"}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary px-5 py-2 text-sm">Cancelar</button>
              </div>
            </div>
          )}

          {equipos.length === 0 && !showForm && <p className="text-white/30 text-sm text-center py-12">No hay ministerios. Crea el primero.</p>}

          {equipos.map((e) => {
            const equipoSols = solicitudes.filter((s) => (s.equipo_id === e.id) || (!s.equipo_id && s.equipo_nombre === e.nombre));
            const pendientesEquipo = equipoSols.filter((s) => s.estado === "pendiente");
            const miembrosEquipo = miembros[e.id];
            const isExpanded = expandedEquipo === e.id;
            const liderUser = usuarios.find((u) => u.id === e.lider_id);

            return (
              <div key={e.id} className="rounded-2xl border border-border overflow-hidden" style={{ background: "#0D1628" }}>
                <div className="flex items-center gap-4 p-4">
                  {isImageUrl(e.icon_name) ? (
                    <Image src={e.icon_name!} alt="ministerio" width={40} height={40} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(191,30,46,0.1)", border: "1px solid rgba(191,30,46,0.2)" }}>
                      <Users size={18} className="text-accent" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold">{e.nombre}</p>
                    <p className="text-white/40 text-xs mt-0.5">Líder: <span className="text-accent">{e.lideres && e.lideres.length > 0 ? e.lideres.map((l) => l.nombre).join(", ") : e.lider || "Sin asignar"}</span></p>
                  </div>

                  {pendientesEquipo.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">
                      {pendientesEquipo.length} pendiente{pendientesEquipo.length !== 1 ? "s" : ""}
                    </span>
                  )}

                  <button onClick={() => toggleEquipo(e.id)} className="p-2 text-white/30 hover:text-white transition-colors">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  <button onClick={() => void deleteEquipo(e.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/5 p-4 space-y-4">
                    {e.descripcion && <p className="text-white/40 text-sm">{e.descripcion}</p>}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          targetEquipoIdRef.current = e.id;
                          imageFileRef.current?.click();
                        }}
                        className="btn-secondary text-sm py-2 px-3 inline-flex items-center gap-2"
                        disabled={uploadingEquipoId === e.id}
                      >
                        {uploadingEquipoId === e.id ? <Upload size={14} className="animate-pulse" /> : <ImageIcon size={14} />}
                        {uploadingEquipoId === e.id ? "Subiendo..." : "Cambiar foto"}
                      </button>
                      {isImageUrl(e.icon_name) && (
                        <button
                          className="text-xs text-white/35 hover:text-red-400"
                          onClick={async () => {
                            await supabase.from("equipos").update({ icon_name: null }).eq("id", e.id);
                            void load();
                          }}
                        >
                          Quitar foto
                        </button>
                      )}
                    </div>

                    {pendientesEquipo.length > 0 && (
                      <div>
                        <p className="text-white/30 text-[10px] uppercase tracking-wider font-bold mb-2">Solicitudes pendientes</p>
                        <div className="space-y-2">
                          {pendientesEquipo.map((s) => (
                            <div key={`${s.source}-${s.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-amber-500/15" style={{ background: "rgba(245,158,11,0.05)" }}>
                              {s.usuario?.foto_url ? (
                                <Image src={s.usuario.foto_url} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" width={28} height={28} />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-white shrink-0">{s.usuario?.nombre?.[0] ?? "?"}</div>
                              )}
                              <p className="text-white/70 text-sm flex-1">{s.usuario?.nombre ?? s.usuario_id}</p>
                              <div className="flex gap-1.5">
                                <button onClick={() => void updateEstado(s, "aprobado")} className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"><Check size={13} /></button>
                                <button onClick={() => void updateEstado(s, "rechazado")} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"><X size={13} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-white/30 text-[10px] uppercase tracking-wider font-bold mb-2">
                        Líderes {e.lideres && e.lideres.length > 0 ? `(${e.lideres.length})` : ""}
                      </p>
                      {(e.lideres ?? []).map((l) => (
                        <div key={l.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/5 mb-2" style={{ background: "#080E1E" }}>
                          {l.foto_url ? (
                            <Image src={l.foto_url} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" width={28} height={28} />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">{l.nombre?.[0] ?? "?"}</div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-white/80 text-xs font-medium truncate">{l.nombre}</p>
                            <p className="text-amber-400/50 text-[10px]">Líder</p>
                          </div>
                          <button onClick={() => void removeLider(e, l.id)} className="p-1 text-white/20 hover:text-red-400 transition-colors shrink-0">
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          className="input text-sm flex-1"
                          value={assigningLiderFor[e.id] ?? ""}
                          onChange={(ev) => setAssigningLiderFor((prev) => ({ ...prev, [e.id]: ev.target.value }))}
                        >
                          <option value="">Agregar líder...</option>
                          {usuarios
                            .filter((u) => !(e.lideres ?? []).some((l) => l.id === u.id))
                            .map((u) => (
                              <option key={u.id} value={u.id}>{u.nombre} ({u.email})</option>
                            ))}
                        </select>
                        <button
                          onClick={() => void assignLider(e)}
                          disabled={!assigningLiderFor[e.id] || savingLiderFor === e.id}
                          className="btn-secondary text-sm px-3 py-2 inline-flex items-center gap-2 disabled:opacity-50"
                        >
                          <UserPlus size={14} />
                          {savingLiderFor === e.id ? "Guardando..." : "Asignar"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-white/30 text-[10px] uppercase tracking-wider font-bold mb-2">Miembros {miembrosEquipo ? `(${miembrosEquipo.length})` : ""}</p>
                      <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        <select
                          className="input text-sm flex-1"
                          value={assigningFor[e.id] ?? ""}
                          onChange={(ev) => setAssigningFor((prev) => ({ ...prev, [e.id]: ev.target.value }))}
                        >
                          <option value="">Seleccionar persona...</option>
                          {usuarios
                            .filter((u) => !(miembrosEquipo ?? []).some((m) => m.id === u.id))
                            .map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.nombre} ({u.email})
                              </option>
                            ))}
                        </select>
                        <button
                          onClick={() => void addMemberToMinisterio(e)}
                          disabled={!assigningFor[e.id] || savingAssignFor === e.id}
                          className="btn-secondary text-sm px-3 py-2 inline-flex items-center gap-2 disabled:opacity-50"
                        >
                          <UserPlus size={14} />
                          {savingAssignFor === e.id ? "Agregando..." : "Agregar"}
                        </button>
                      </div>
                      {!miembrosEquipo ? (
                        <p className="text-white/20 text-sm">Cargando...</p>
                      ) : miembrosEquipo.length === 0 ? (
                        <p className="text-white/20 text-sm">Aún no hay miembros aprobados</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {miembrosEquipo.map((m) => (
                            <div key={m.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/5" style={{ background: "#080E1E" }}>
                              {m.foto_url ? (
                                <Image src={m.foto_url} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" width={28} height={28} />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-white shrink-0">{m.nombre?.[0] ?? "?"}</div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-white/80 text-xs font-medium truncate">{m.nombre}</p>
                                <p className="text-white/30 text-[10px] truncate">{m.email}</p>
                              </div>
                              <button
                                onClick={() => void removeMemberFromMinisterio(e.id, m.id)}
                                className="p-1 text-white/20 hover:text-red-400 transition-colors shrink-0"
                                title="Remover miembro"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <input
            ref={imageFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const target = targetEquipoIdRef.current;
              const file = e.target.files?.[0];
              if (!target || !file) return;
              await uploadEquipoImage(target, file);
              e.target.value = "";
            }}
          />
          <input
            ref={newImageFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              await uploadImageOnly(file);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
