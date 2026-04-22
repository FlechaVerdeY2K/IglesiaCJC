"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { Check, X, Plus, Users, ChevronDown, ChevronUp, Trash2, Upload, Image as ImageIcon, UserPlus, Pencil, Copy } from "lucide-react";
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
  tipo?: string | null;
  temporada?: number | null;
  tipo_gps?: string | null;
};

type Solicitud = {
  id: string;
  source: "equipo_solicitudes" | "gps_registros";
  usuario_id: string;
  equipo_id: string | null;
  equipo_nombre: string;
  estado: string;
  created_at: string;
  motivo: string | null;
  usuario?: { nombre: string; foto_url: string | null; email?: string | null; telefono?: string | null };
};

type Usuario = { id: string; nombre: string; email: string; foto_url: string | null; rol: string };

type Apertura = {
  id: string;
  usuario_id: string;
  usuario_nombre: string;
  usuario_email: string;
  nombre_gps: string;
  lideres: string;
  telefono: string;
  tipo: string;
  poblacion: string;
  rango_edad: string;
  dia_semana: string;
  hora_inicio: string;
  duracion_min: number;
  modalidad: string;
  max_personas: number;
  explicacion: string;
  materiales: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  nota_admin: string | null;
  creado_en: string;
};

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
  const [tab, setTab] = useState<"solicitudes" | "equipos" | "aperturas">("solicitudes");
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEquipo, setExpandedEquipo] = useState<string | null>(null);
  const [miembros, setMiembros] = useState<Record<string, Usuario[]>>({});

  const pathname = usePathname();
  const scope: "ministerio" | "gps" = pathname?.startsWith("/admin/gps") ? "gps" : "ministerio";
  const scopeLabel = scope === "gps" ? "GPS" : "Ministerio";
  const scopePlural = scope === "gps" ? "GPS" : "Ministerios";

  const [showForm, setShowForm] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", lider_id: "", icon_name: "", tipo: scope, temporada: 2, tipo_gps: "curricular" });
  const [temporadaFilter, setTemporadaFilter] = useState<2 | 3 | 4>(2);
  const [editing, setEditing] = useState<Equipo | null>(null);
  const [editForm, setEditForm] = useState({ nombre: "", descripcion: "", tipo: "ministerio", temporada: 2, tipo_gps: "curricular" });
  const [editLiderSelect, setEditLiderSelect] = useState("");
  const [copyFrom, setCopyFrom] = useState<Equipo | null>(null);
  const [copyTemporada, setCopyTemporada] = useState<number>(3);
  const [copying, setCopying] = useState(false);
  const [temporadasInfo, setTemporadasInfo] = useState<Record<number, { titulo: string; descripcion: string; foto_portada: string | null; estado: string }>>({});
  const [aperturas, setAperturas] = useState<Apertura[]>([]);
  const [selectedApertura, setSelectedApertura] = useState<Apertura | null>(null);
  const [revisionNote, setRevisionNote] = useState("");
  const [revisionFor, setRevisionFor] = useState<Apertura | null>(null);
  const [deletingApertura, setDeletingApertura] = useState<Apertura | null>(null);
  const [editingTemporada, setEditingTemporada] = useState<number | null>(null);
  const [tempForm, setTempForm] = useState({ titulo: "", descripcion: "", foto_portada: "", estado: "futura" });
  const [uploadingTempCover, setUploadingTempCover] = useState(false);
  const tempCoverFileRef = useRef<HTMLInputElement>(null);
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

    const [eqRes, usrRes, solsModernRes, solsLegacyRes, tempRes, apRes] = await Promise.all([
      supabase.from("equipos").select("*").eq("tipo", scope).order("nombre"),
      supabase.from("usuarios").select("id, nombre, email, foto_url, rol").order("nombre"),
      supabase
        .from("equipo_solicitudes")
        .select("id, usuario_id, equipo_id, equipo_nombre, estado, creado_en, motivo, usuario:usuarios(nombre, foto_url, email, telefono)")
        .order("creado_en", { ascending: false }),
      supabase
        .from("gps_registros")
        .select("id, usuario_id, equipo_id, equipo_nombre, estado, created_at, usuario:usuarios(nombre, foto_url, email)")
        .order("created_at", { ascending: false }),
      scope === "gps"
        ? supabase.from("temporadas").select("*").order("numero")
        : Promise.resolve({ data: [] }),
      scope === "gps"
        ? supabase.from("gps_aperturas").select("*").order("creado_en", { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);
    setAperturas(((apRes.data ?? []) as Apertura[]));

    setEquipos((eqRes.data ?? []) as Equipo[]);
    setUsuarios((usrRes.data ?? []) as Usuario[]);

    const tempMap: Record<number, { titulo: string; descripcion: string; foto_portada: string | null; estado: string }> = {};
    for (const row of ((tempRes.data ?? []) as Array<{ numero: number; titulo: string; descripcion: string; foto_portada: string | null; estado?: string }>)) {
      tempMap[row.numero] = { titulo: row.titulo ?? "", descripcion: row.descripcion ?? "", foto_portada: row.foto_portada, estado: row.estado ?? "futura" };
    }
    setTemporadasInfo(tempMap);

    const modern = ((solsModernRes.data ?? []) as Array<Record<string, unknown>>).map((s) => ({
      id: String(s.id),
      source: "equipo_solicitudes" as const,
      usuario_id: String(s.usuario_id ?? ""),
      equipo_id: (s.equipo_id as string | null) ?? null,
      equipo_nombre: String(s.equipo_nombre ?? ""),
      estado: normalizeEstado(String(s.estado ?? "pendiente")),
      created_at: String(s.creado_en ?? new Date().toISOString()),
      motivo: (s.motivo as string | null) ?? null,
      usuario: (s.usuario as { nombre: string; foto_url: string | null; email?: string | null; telefono?: string | null } | null) ?? undefined,
    }));

    const legacy = ((solsLegacyRes.data ?? []) as Array<Record<string, unknown>>).map((s) => ({
      id: String(s.id),
      source: "gps_registros" as const,
      usuario_id: String(s.usuario_id ?? ""),
      equipo_id: (s.equipo_id as string | null) ?? null,
      equipo_nombre: String(s.equipo_nombre ?? ""),
      estado: normalizeEstado(String(s.estado ?? "pendiente")),
      created_at: String(s.created_at ?? new Date().toISOString()),
      motivo: null,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  useEffect(() => {
    setForm((f) => ({ ...f, tipo: scope }));
  }, [scope]);

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
      tipo: form.tipo,
      temporada: form.tipo === "gps" ? form.temporada : null,
      tipo_gps: form.tipo === "gps" ? form.tipo_gps : null,
    });
    setForm({ nombre: "", descripcion: "", lider_id: "", icon_name: "", tipo: scope, temporada: 2, tipo_gps: "curricular" });
    setShowForm(false);
    setSaving(false);
    void load();
  };

  const openTemporadaEdit = (numero: number) => {
    const info = temporadasInfo[numero] ?? { titulo: "", descripcion: "", foto_portada: null, estado: "futura" };
    setTempForm({ titulo: info.titulo, descripcion: info.descripcion, foto_portada: info.foto_portada ?? "", estado: info.estado });
    setEditingTemporada(numero);
  };

  const saveTemporada = async () => {
    if (editingTemporada == null) return;
    await supabase.from("temporadas").update({
      titulo: tempForm.titulo.trim(),
      descripcion: tempForm.descripcion.trim(),
      foto_portada: tempForm.foto_portada || null,
      estado: tempForm.estado,
      actualizado_en: new Date().toISOString(),
    }).eq("numero", editingTemporada);
    setEditingTemporada(null);
    void load();
  };

  const uploadTempCover = async (file: File) => {
    setUploadingTempCover(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    fd.append("folder", "temporadas");
    const res = await fetch(cloudinaryUploadUrl(), { method: "POST", body: fd });
    const data = await res.json();
    if (data.secure_url) setTempForm((p) => ({ ...p, foto_portada: data.secure_url }));
    setUploadingTempCover(false);
  };

  const openEdit = (e: Equipo) => {
    setEditing(e);
    setEditForm({
      nombre: e.nombre,
      descripcion: e.descripcion ?? "",
      tipo: (e.tipo ?? "ministerio"),
      temporada: e.temporada ?? 2,
      tipo_gps: e.tipo_gps ?? "curricular",
    });
  };

  const saveEdit = async () => {
    if (!editing || !editForm.nombre.trim()) return;
    await supabase.from("equipos").update({
      nombre: editForm.nombre.trim(),
      descripcion: editForm.descripcion.trim(),
      tipo: editForm.tipo,
      temporada: editForm.tipo === "gps" ? editForm.temporada : null,
      tipo_gps: editForm.tipo === "gps" ? editForm.tipo_gps : null,
    }).eq("id", editing.id);
    setEditing(null);
    void load();
  };

  const copyToTemporada = async () => {
    if (!copyFrom) return;
    setCopying(true);
    await supabase.from("equipos").insert({
      nombre: copyFrom.nombre,
      descripcion: copyFrom.descripcion ?? "",
      icon_name: copyFrom.icon_name ?? null,
      tipo: "gps",
      temporada: copyTemporada,
      lider_id: copyFrom.lider_id ?? null,
      lider: copyFrom.lider ?? "",
      lideres: copyFrom.lideres ?? null,
    });
    setCopying(false);
    setCopyFrom(null);
    void load();
  };

  const promoteToLider = async (userId: string) => {
    const { data: userRow } = await supabase.from("usuarios").select("roles, rol").eq("id", userId).maybeSingle();
    const current: string[] = (userRow?.roles as string[] | null) ?? [];
    const isAdmin = current.includes("admin") || userRow?.rol === "admin";
    const newRoles = Array.from(new Set([...current, "lider"])).filter(Boolean);
    const newRol = isAdmin ? "admin" : "lider";
    if (!current.includes("lider") || userRow?.rol !== newRol) {
      await supabase.from("usuarios").update({ roles: newRoles, rol: newRol }).eq("id", userId);
    }
  };

  const addLiderInEdit = async () => {
    if (!editing || !editLiderSelect) return;
    const user = usuarios.find((u) => u.id === editLiderSelect);
    if (!user) return;
    const current: LiderInfo[] = editing.lideres ?? [];
    if (current.some((l) => l.id === user.id)) { setEditLiderSelect(""); return; }
    const updated: LiderInfo[] = [...current, { id: user.id, nombre: user.nombre, foto_url: user.foto_url }];
    await supabase.from("equipos").update({
      lideres: updated,
      lider_id: updated[0].id,
      lider: updated[0].nombre,
    }).eq("id", editing.id);
    await promoteToLider(user.id);
    void sendNotification(user.id, "rol_asignado", `Te asignaron como líder de ${editing.nombre}`, null, { equipo_id: editing.id });
    setEditing({ ...editing, lideres: updated, lider_id: updated[0].id, lider: updated[0].nombre });
    setEditLiderSelect("");
  };

  const removeLiderInEdit = async (liderId: string) => {
    if (!editing) return;
    const updated = (editing.lideres ?? []).filter((l) => l.id !== liderId);
    const first = updated[0] ?? null;
    await supabase.from("equipos").update({
      lideres: updated,
      lider_id: first?.id ?? null,
      lider: first?.nombre ?? "",
    }).eq("id", editing.id);
    await maybeRevertLider(liderId);
    void sendNotification(liderId, "rol_removido", `Ya no sos líder de ${editing.nombre}`, null, { equipo_id: editing.id });
    setEditing({ ...editing, lideres: updated, lider_id: first?.id ?? null, lider: first?.nombre ?? "" });
  };

  const maybeRevertLider = async (userId: string) => {
    if (!userId) return;
    const [directRes, allEqRes] = await Promise.all([
      supabase.from("equipos").select("id", { count: "exact", head: true }).eq("lider_id", userId),
      supabase.from("equipos").select("lideres").not("lideres", "is", null),
    ]);
    let stillLeads = (directRes.count ?? 0) > 0;
    if (!stillLeads) {
      for (const row of (allEqRes.data ?? []) as Array<{ lideres: Array<{ id: string }> | null }>) {
        if ((row.lideres ?? []).some((l) => l?.id === userId)) { stillLeads = true; break; }
      }
    }
    if (stillLeads) return;
    const { data: usr } = await supabase.from("usuarios").select("rol, roles").eq("id", userId).maybeSingle();
    const currentRoles = ((usr?.roles as string[] | null) ?? []).filter(Boolean);
    const newRoles = currentRoles.filter((r) => r !== "lider");
    const currentRol = (usr?.rol as string | null) ?? null;
    const newRol = currentRol === "lider" ? "miembro" : currentRol;
    if (newRoles.length !== currentRoles.length || newRol !== currentRol) {
      await supabase.from("usuarios").update({ roles: newRoles, rol: newRol }).eq("id", userId);
    }
  };

  const deleteEquipo = async (id: string) => {
    if (!confirm("¿Eliminar este ministerio/GPS? Los líderes que no lideren otro equipo perderán el rol.")) return;
    const { data: eq } = await supabase.from("equipos").select("lider_id, lideres").eq("id", id).maybeSingle();
    const liderIds = new Set<string>();
    if (eq?.lider_id) liderIds.add(eq.lider_id as string);
    for (const l of ((eq?.lideres as Array<{ id: string }> | null) ?? [])) {
      if (l?.id) liderIds.add(l.id);
    }
    await supabase.from("equipo_solicitudes").update({ equipo_id: null }).eq("equipo_id", id);
    await supabase.from("gps_registros").update({ equipo_id: null }).eq("equipo_id", id);
    await supabase.from("equipos").delete().eq("id", id);
    for (const userId of liderIds) {
      await maybeRevertLider(userId);
    }
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
    await maybeRevertLider(liderId);
    void load();
  };

  const scopedSolicitudes = solicitudes.filter((s) => equipos.some((e) => e.id === s.equipo_id));
  const pendientes = scopedSolicitudes.filter((s) => s.estado === "pendiente");
  const aperturasPendientesCount = aperturas.filter((a) => a.estado === "pendiente").length;

  const updateAperturaEstado = async (ap: Apertura, estado: "aprobada" | "rechazada") => {
    await supabase.from("gps_aperturas").update({ estado, nota_admin: null, actualizado_en: new Date().toISOString() }).eq("id", ap.id);

    if (estado === "aprobada") {
      const { data: activaTemp } = await supabase.from("temporadas").select("numero").eq("estado", "activa").maybeSingle();
      const destTemporada = activaTemp?.numero ?? 2;

      const { data: liderUsr } = await supabase
        .from("usuarios")
        .select("id, nombre, foto_url, rol, roles")
        .eq("id", ap.usuario_id)
        .maybeSingle();

      const liderEntry = {
        id: ap.usuario_id,
        nombre: liderUsr?.nombre ?? ap.usuario_nombre,
        foto_url: (liderUsr?.foto_url as string | null) ?? null,
      };

      const { data: insEq } = await supabase.from("equipos").insert({
        nombre: ap.nombre_gps,
        descripcion: ap.explicacion,
        lider: liderEntry.nombre,
        lider_id: ap.usuario_id,
        tipo: "gps",
        temporada: destTemporada,
        tipo_gps: ap.tipo,
        lideres: [liderEntry],
      }).select("id").single();

      if (insEq?.id) {
        await supabase.from("equipo_solicitudes").insert({
          usuario_id: ap.usuario_id,
          equipo_id: insEq.id,
          equipo_nombre: ap.nombre_gps,
          usuario_nombre: ap.usuario_nombre,
          usuario_email: ap.usuario_email,
          estado: "aprobado",
          motivo: "Líder fundador (apertura aprobada automáticamente)",
        });

        const currentRoles = ((liderUsr?.roles as string[] | null) ?? []).filter(Boolean);
        const currentRol = (liderUsr?.rol as string | null) ?? null;
        const newRoles = currentRoles.includes("lider") ? currentRoles : [...currentRoles, "lider"];
        const newRol = currentRol === "admin" ? "admin" : "lider";
        if (JSON.stringify(newRoles) !== JSON.stringify(currentRoles) || newRol !== currentRol) {
          await supabase.from("usuarios").update({ rol: newRol, roles: newRoles }).eq("id", ap.usuario_id);
        }
      }
    }

    void sendNotification(
      ap.usuario_id,
      "apertura_gps",
      estado === "aprobada" ? `Tu GPS "${ap.nombre_gps}" fue aprobado` : `Tu solicitud "${ap.nombre_gps}" fue rechazada`,
      estado === "aprobada" ? "El equipo GPS te contactará con los siguientes pasos." : null,
      { apertura_id: ap.id, estado }
    );
    void load();
  };

  const confirmDeleteApertura = async () => {
    if (!deletingApertura) return;
    const ap = deletingApertura;
    await supabase.from("notificaciones").delete().contains("meta", { apertura_id: ap.id });
    await supabase.from("gps_aperturas").delete().eq("id", ap.id);
    void sendNotification(
      ap.usuario_id,
      "apertura_gps",
      `Tu solicitud GPS "${ap.nombre_gps}" fue eliminada`,
      "El equipo GPS eliminó tu solicitud de apertura. Si tenés dudas, comunicate con un pastor.",
      { deleted: true }
    );
    setDeletingApertura(null);
    setSelectedApertura(null);
    void load();
  };

  const enviarARevision = async () => {
    if (!revisionFor || !revisionNote.trim()) return;
    await supabase
      .from("gps_aperturas")
      .update({ estado: "en_revision", nota_admin: revisionNote.trim(), actualizado_en: new Date().toISOString() })
      .eq("id", revisionFor.id);
    void sendNotification(
      revisionFor.usuario_id,
      "apertura_gps",
      `Tu solicitud GPS "${revisionFor.nombre_gps}" requiere ajustes`,
      revisionNote.trim(),
      { apertura_id: revisionFor.id, estado: "en_revision" }
    );
    setRevisionFor(null);
    setRevisionNote("");
    setSelectedApertura(null);
    void load();
  };
  const lideresOpciones = usuarios.filter((u) => ["lider", "admin"].includes(u.rol));

  const getEquipoNombre = (s: Solicitud) => {
    if (s.equipo_id) return equipos.find((e) => e.id === s.equipo_id)?.nombre ?? s.equipo_nombre;
    return s.equipo_nombre;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">{scopePlural}</h1>
          <p className="text-white/40 text-sm mt-1">{pendientes.length} solicitudes pendientes</p>
        </div>
        {tab === "equipos" && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "rgba(191,30,46,0.15)", color: "#BF1E2E", border: "1px solid rgba(191,30,46,0.3)" }}
          >
            <Plus size={15} /> Nuevo {scopeLabel}
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-5 p-1 rounded-xl border border-border w-fit flex-wrap" style={{ background: "#080E1E" }}>
        {(scope === "gps"
          ? (["solicitudes", "equipos", "aperturas"] as const)
          : (["solicitudes", "equipos"] as const)
        ).map((t) => {
          const badgeCount = t === "solicitudes" ? pendientes.length : t === "aperturas" ? aperturasPendientesCount : 0;
          const label = t === "solicitudes" ? "Solicitudes" : t === "equipos" ? scopePlural : "Aperturas";
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-1.5 ${tab === t ? "bg-accent text-white" : "text-white/40 hover:text-white"}`}
            >
              {label}
              {badgeCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t ? "bg-white/20" : "bg-amber-500/20 text-amber-400"}`}>
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-white/30 text-sm py-8">Cargando...</p>
      ) : tab === "solicitudes" ? (
        <div className="space-y-3">
          {scopedSolicitudes.length === 0 && <p className="text-white/30 text-sm text-center py-12">No hay solicitudes</p>}

          {scopedSolicitudes.map((s) => (
            <button
              key={`${s.source}-${s.id}`}
              onClick={() => setSelectedSolicitud(s)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-accent/40 transition-all text-left"
              style={{ background: "#0D1628" }}
            >
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
                <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button onClick={(e) => { e.stopPropagation(); void updateEstado(s, "aprobado"); }} className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors">
                    <Check size={15} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); void updateEstado(s, "rechazado"); }} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                    <X size={15} />
                  </button>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : tab === "aperturas" ? (
        <div className="space-y-3">
          {aperturas.length === 0 && <p className="text-white/30 text-sm text-center py-12">No hay solicitudes de apertura</p>}

          {aperturas.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedApertura(a)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-accent/40 transition-all text-left"
              style={{ background: "#0D1628" }}
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                <Plus size={18} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{a.nombre_gps}</p>
                <p className="text-white/40 text-xs mt-0.5 truncate">
                  {a.usuario_nombre} · <span className="text-accent/80">{a.tipo}</span> · <span className="capitalize">{a.dia_semana}</span> {a.hora_inicio?.slice(0, 5)} · {a.modalidad}
                </p>
                <p className="text-white/20 text-xs mt-0.5">{new Date(a.creado_en).toLocaleDateString("es", { timeZone: "America/Costa_Rica", day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <span className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                a.estado === "aprobada"
                  ? "bg-green-500/15 text-green-400 border border-green-500/20"
                  : a.estado === "rechazada"
                    ? "bg-red-500/15 text-red-400 border border-red-500/20"
                    : a.estado === "en_revision"
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
              }`}>
                {a.estado === "en_revision" ? "En revisión" : a.estado}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {showForm && (
            <div className="p-5 rounded-2xl border border-accent/20 space-y-4" style={{ background: "#0D1628" }}>
              <h3 className="text-white font-bold">Nuevo {scopeLabel}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Nombre *</label>
                  <input className="input w-full" placeholder={scope === "gps" ? "Ej: Matrimonios que crecen" : "Ej: Benjamines"} value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
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

              {scope === "gps" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Temporada</label>
                    <select className="input w-full" value={form.temporada} onChange={(e) => setForm((f) => ({ ...f, temporada: Number(e.target.value) }))}>
                      {[2, 3, 4].map((t) => <option key={t} value={t}>Temporada {t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Tipo GPS</label>
                    <select className="input w-full" value={form.tipo_gps} onChange={(e) => setForm((f) => ({ ...f, tipo_gps: e.target.value }))}>
                      <option value="curricular">Curricular</option>
                      <option value="afinidad">Afinidad</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Descripción</label>
                <textarea className="input w-full resize-none" rows={2} placeholder="Descripción..." value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
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
                  {saving ? "Guardando..." : `Crear ${scopeLabel}`}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary px-5 py-2 text-sm">Cancelar</button>
              </div>
            </div>
          )}

          {scope === "gps" && (
            <>
              <div className="flex gap-2 p-1 rounded-xl border border-border w-fit mb-3" style={{ background: "#080E1E" }}>
                {([2, 3, 4] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemporadaFilter(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${temporadaFilter === t ? "bg-accent text-white" : "text-white/40 hover:text-white"}`}
                  >
                    Temporada {t}
                  </button>
                ))}
              </div>

              {(() => {
                const info = temporadasInfo[temporadaFilter];
                return (
                  <div className="flex items-center gap-4 p-3 rounded-2xl border border-border mb-4" style={{ background: "#0D1628" }}>
                    <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10" style={{ background: "#080E1E" }}>
                      {info?.foto_portada ? (
                        <Image src={info.foto_portada} alt="" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] text-center px-2">Sin portada</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{info?.titulo || `Temporada ${temporadaFilter}`}</p>
                      <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{info?.descripcion || "Sin descripción"}</p>
                    </div>
                    <button onClick={() => openTemporadaEdit(temporadaFilter)} className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5">
                      <Pencil size={12} /> Editar temporada
                    </button>
                  </div>
                );
              })()}
            </>
          )}

          {equipos.length === 0 && !showForm && <p className="text-white/30 text-sm text-center py-12">No hay {scopePlural.toLowerCase()}. Crea el primero.</p>}

          {equipos.filter((e) => scope === "ministerio" || (e.temporada ?? null) === temporadaFilter).map((e) => {
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-bold">{e.nombre}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                        (e.tipo ?? "ministerio") === "gps"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-accent/10 text-accent border-accent/20"
                      }`}>
                        {(e.tipo ?? "ministerio") === "gps" ? "GPS" : "Ministerio"}
                      </span>
                      {(e.tipo ?? "ministerio") === "gps" && e.temporada && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide border bg-blue-500/5 text-blue-300 border-blue-500/15">
                          T{e.temporada}
                        </span>
                      )}
                      {(e.tipo ?? "ministerio") === "gps" && e.tipo_gps && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                          e.tipo_gps === "afinidad"
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        }`}>
                          {e.tipo_gps}
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">Líder: <span className="text-accent">{e.lideres && e.lideres.length > 0 ? e.lideres.map((l) => l.nombre).join(", ") : e.lider || "Sin asignar"}</span></p>
                  </div>

                  {pendientesEquipo.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">
                      {pendientesEquipo.length} pendiente{pendientesEquipo.length !== 1 ? "s" : ""}
                    </span>
                  )}

                  <button onClick={() => openEdit(e)} title="Editar" className="p-2 text-white/30 hover:text-white transition-colors">
                    <Pencil size={13} />
                  </button>

                  {(e.tipo ?? "ministerio") === "gps" && (
                    <button
                      onClick={() => { setCopyFrom(e); setCopyTemporada(e.temporada === 4 ? 1 : (e.temporada ?? 2) + 1); }}
                      title="Copiar a otra temporada"
                      className="p-2 text-white/30 hover:text-blue-400 transition-colors"
                    >
                      <Copy size={13} />
                    </button>
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

                    {e.lideres && e.lideres.length > 0 && (
                      <div>
                        <p className="text-white/30 text-[10px] uppercase tracking-wider font-bold mb-2">
                          Líderes ({e.lideres.length}) <span className="text-white/20 normal-case font-normal">· Gestionar desde ✏️ editar</span>
                        </p>
                        {e.lideres.map((l) => (
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
                          </div>
                        ))}
                      </div>
                    )}

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

      {editingTemporada != null && (
        <div
          className="fixed inset-0 z-[90] p-4 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditingTemporada(null); }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-border p-5 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-bold">Editar Temporada {editingTemporada}</h3>
              <button onClick={() => setEditingTemporada(null)} className="text-white/50 hover:text-white"><X size={18} /></button>
            </div>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Foto de portada</label>
              <div className="flex gap-3 items-start">
                <div className="relative w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-border" style={{ background: "#080E1E" }}>
                  {tempForm.foto_portada ? (
                    <Image src={tempForm.foto_portada} alt="" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] text-center px-2">Sin portada</div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => tempCoverFileRef.current?.click()}
                    disabled={uploadingTempCover}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-white/60 hover:text-white hover:border-accent/40 transition-all w-full"
                  >
                    <Upload size={14} />
                    {uploadingTempCover ? "Subiendo..." : tempForm.foto_portada ? "Cambiar portada" : "Subir portada"}
                  </button>
                  {tempForm.foto_portada && (
                    <button
                      type="button"
                      onClick={() => setTempForm((p) => ({ ...p, foto_portada: "" }))}
                      className="text-xs text-white/30 hover:text-red-400 transition-colors"
                    >
                      Quitar portada
                    </button>
                  )}
                  <input
                    ref={tempCoverFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) void uploadTempCover(e.target.files[0]); e.target.value = ""; }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Título</label>
                <input className="input w-full" placeholder={`Temporada ${editingTemporada}`} value={tempForm.titulo} onChange={(e) => setTempForm((p) => ({ ...p, titulo: e.target.value }))} />
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Estado</label>
                <select className="input w-full" value={tempForm.estado} onChange={(e) => setTempForm((p) => ({ ...p, estado: e.target.value }))}>
                  <option value="futura">Futura (no activa aún)</option>
                  <option value="activa">Activa (en curso)</option>
                  <option value="concluida">Concluida</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Descripción</label>
              <textarea className="input w-full h-24 resize-none" placeholder="Qué caracteriza esta temporada..." value={tempForm.descripcion} onChange={(e) => setTempForm((p) => ({ ...p, descripcion: e.target.value }))} />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setEditingTemporada(null)} className="btn-secondary py-2 px-4 text-sm">Cancelar</button>
              <button onClick={() => void saveTemporada()} className="btn-primary py-2 px-4 text-sm">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-[90] p-4 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-border p-5 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-bold">Editar {editing.nombre}</h3>
              <button onClick={() => setEditing(null)} className="text-white/50 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Nombre</label>
                <input className="input w-full" value={editForm.nombre} onChange={(e) => setEditForm((p) => ({ ...p, nombre: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Tipo</label>
                  <select className="input w-full" value={editForm.tipo} onChange={(e) => setEditForm((p) => ({ ...p, tipo: e.target.value }))}>
                    <option value="ministerio">Ministerio</option>
                    <option value="gps">GPS</option>
                  </select>
                </div>
                {editForm.tipo === "gps" && (
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Temporada</label>
                    <select className="input w-full" value={editForm.temporada} onChange={(e) => setEditForm((p) => ({ ...p, temporada: Number(e.target.value) }))}>
                      {[2, 3, 4].map((t) => <option key={t} value={t}>Temporada {t}</option>)}
                    </select>
                  </div>
                )}
              </div>
              {editForm.tipo === "gps" && (
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Tipo GPS</label>
                  <select className="input w-full" value={editForm.tipo_gps} onChange={(e) => setEditForm((p) => ({ ...p, tipo_gps: e.target.value }))}>
                    <option value="curricular">Curricular</option>
                    <option value="afinidad">Afinidad</option>
                  </select>
                </div>
              )}
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Descripción</label>
                <textarea className="input w-full resize-none" rows={3} value={editForm.descripcion} onChange={(e) => setEditForm((p) => ({ ...p, descripcion: e.target.value }))} />
              </div>

              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                  Líderes {editing.lideres && editing.lideres.length > 0 ? `(${editing.lideres.length})` : ""}
                </label>
                <div className="space-y-2 mb-3">
                  {(editing.lideres ?? []).map((l) => (
                    <div key={l.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-amber-500/15" style={{ background: "rgba(245,158,11,0.05)" }}>
                      {l.foto_url ? (
                        <Image src={l.foto_url} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" width={28} height={28} />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">{l.nombre?.[0] ?? "?"}</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-white/85 text-xs font-medium truncate">{l.nombre}</p>
                        <p className="text-amber-400/50 text-[10px]">Líder</p>
                      </div>
                      <button onClick={() => void removeLiderInEdit(l.id)} className="p-1.5 text-white/30 hover:text-red-400 transition-colors shrink-0" title="Quitar como líder">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  {(!editing.lideres || editing.lideres.length === 0) && (
                    <p className="text-white/30 text-xs italic">Sin líderes asignados.</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    className="input text-sm flex-1"
                    value={editLiderSelect}
                    onChange={(e) => setEditLiderSelect(e.target.value)}
                  >
                    <option value="">Agregar líder...</option>
                    {usuarios
                      .filter((u) => !(editing.lideres ?? []).some((l) => l.id === u.id))
                      .map((u) => (
                        <option key={u.id} value={u.id}>{u.nombre} ({u.email})</option>
                      ))}
                  </select>
                  <button
                    onClick={() => void addLiderInEdit()}
                    disabled={!editLiderSelect}
                    className="btn-secondary text-sm px-3 py-2 inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <UserPlus size={14} /> Asignar
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setEditing(null)} className="btn-secondary py-2 px-4 text-sm">Cerrar</button>
              <button onClick={() => void saveEdit()} disabled={!editForm.nombre.trim()} className="btn-primary py-2 px-4 text-sm">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {copyFrom && (
        <div
          className="fixed inset-0 z-[90] p-4 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setCopyFrom(null); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border p-5 space-y-4" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-bold">Copiar &quot;{copyFrom.nombre}&quot;</h3>
              <button onClick={() => setCopyFrom(null)} className="text-white/50 hover:text-white"><X size={18} /></button>
            </div>

            <p className="text-white/60 text-sm">
              Se creará un nuevo GPS con el mismo nombre y <strong>líderes</strong>. Los integrantes NO se copian — la temporada inicia desde cero.
            </p>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Temporada destino</label>
              <select className="input w-full" value={copyTemporada} onChange={(e) => setCopyTemporada(Number(e.target.value))}>
                {[2, 3, 4].map((t) => (
                  <option key={t} value={t} disabled={t === copyFrom.temporada}>
                    Temporada {t}{t === copyFrom.temporada ? " (actual)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setCopyFrom(null)} className="btn-secondary py-2 px-4 text-sm">Cancelar</button>
              <button onClick={() => void copyToTemporada()} disabled={copying || copyTemporada === copyFrom.temporada} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
                <Copy size={13} /> {copying ? "Copiando..." : "Copiar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingApertura && (
        <div
          className="fixed inset-0 z-[100] p-4 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.9)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeletingApertura(null); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 p-5 space-y-4" style={{ background: "#0D1628" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <h3 className="text-white text-lg font-bold">Eliminar solicitud</h3>
            </div>

            {deletingApertura.estado === "aprobada" && (
              <div className="p-3 rounded-xl border border-green-500/30 bg-green-500/10 text-green-300 text-sm">
                <p className="font-semibold mb-1">⚠ Este GPS ya estaba aprobado</p>
                <p className="text-green-300/80">Si el GPS ya se creó en la pestaña GPS, eliminar esta solicitud no lo borra — tenés que borrarlo aparte.</p>
              </div>
            )}
            {(deletingApertura.estado === "pendiente" || deletingApertura.estado === "en_revision") && (
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm">
                <p className="font-semibold mb-1">⚠ Este GPS está en aprobación</p>
                <p className="text-amber-300/80">La solicitud aún está siendo revisada. Eliminarla cancelará el proceso y notificará a {deletingApertura.usuario_nombre}.</p>
              </div>
            )}
            {deletingApertura.estado === "rechazada" && (
              <p className="text-white/70 text-sm">Esta solicitud ya fue rechazada. Al eliminarla se borrará del historial y se notificará a {deletingApertura.usuario_nombre}.</p>
            )}

            <p className="text-white/80 text-sm">
              ¿Seguro que querés eliminar la solicitud &quot;<span className="text-accent font-semibold">{deletingApertura.nombre_gps}</span>&quot;?
              {" "}Se enviará una notificación a {deletingApertura.usuario_nombre}.
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setDeletingApertura(null)} className="btn-secondary py-2 px-4 text-sm">Cancelar</button>
              <button
                onClick={() => void confirmDeleteApertura()}
                className="btn-primary py-2 px-4 text-sm flex items-center gap-2 bg-red-500 hover:bg-red-600 border-red-500"
              >
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {revisionFor && (
        <div
          className="fixed inset-0 z-[95] p-4 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.9)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setRevisionFor(null); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-amber-500/30 p-5 space-y-4" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-bold">Enviar a revisión</h3>
              <button onClick={() => setRevisionFor(null)} className="text-white/50 hover:text-white"><X size={18} /></button>
            </div>
            <p className="text-white/60 text-sm">
              Escribí qué necesita ajustar <span className="text-accent font-semibold">{revisionFor.usuario_nombre}</span> en su solicitud &quot;{revisionFor.nombre_gps}&quot;. Recibirá una notificación con tu mensaje.
            </p>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Tus comentarios</label>
              <textarea
                className="input w-full h-32 resize-none"
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Ej: Ajustá el horario para evitar el bloqueo del domingo, o especificá los materiales…"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setRevisionFor(null)} className="btn-secondary py-2 px-4 text-sm">Cancelar</button>
              <button
                onClick={() => void enviarARevision()}
                disabled={!revisionNote.trim()}
                className="btn-primary py-2 px-4 text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Pencil size={14} /> Enviar a revisión
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedApertura && (
        <div
          className="fixed inset-0 z-[90] p-4 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedApertura(null); }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-border p-5 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-bold">Solicitud de Apertura</h3>
              <button onClick={() => setSelectedApertura(null)} className="text-white/50 hover:text-white"><X size={18} /></button>
            </div>

            <div className="p-3 rounded-xl border border-white/10" style={{ background: "#080E1E" }}>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">Solicitante</p>
              <p className="text-white font-semibold mt-0.5">{selectedApertura.usuario_nombre}</p>
              <p className="text-white/50 text-xs">{selectedApertura.usuario_email}</p>
              <p className="text-white/50 text-xs">{selectedApertura.telefono}</p>
            </div>

            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Nombre del GPS</p>
              <p className="text-accent font-semibold text-lg">{selectedApertura.nombre_gps}</p>
            </div>

            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Líder(es)</p>
              <p className="text-white/80 text-sm">{selectedApertura.lideres}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Tipo</p>
                <p className="text-white/80 text-sm capitalize">{selectedApertura.tipo}</p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Población</p>
                <p className="text-white/80 text-sm capitalize">{selectedApertura.poblacion}</p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Rango de edad</p>
                <p className="text-white/80 text-sm">{selectedApertura.rango_edad}</p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Modalidad</p>
                <p className="text-white/80 text-sm capitalize">{selectedApertura.modalidad}</p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Día y hora</p>
                <p className="text-white/80 text-sm capitalize">
                  {selectedApertura.dia_semana} · {selectedApertura.hora_inicio?.slice(0, 5)} · {selectedApertura.duracion_min} min
                </p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Capacidad</p>
                <p className="text-white/80 text-sm">hasta {selectedApertura.max_personas} personas</p>
              </div>
            </div>

            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Período</p>
              <p className="text-white/80 text-sm">
                {selectedApertura.fecha_inicio} → {selectedApertura.fecha_fin}
              </p>
            </div>

            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Explicación</p>
              <div className="p-3 rounded-xl border border-white/10 text-white/80 text-sm whitespace-pre-wrap" style={{ background: "#080E1E" }}>
                {selectedApertura.explicacion}
              </div>
            </div>

            {selectedApertura.materiales && (
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Materiales</p>
                <div className="p-3 rounded-xl border border-white/10 text-white/80 text-sm whitespace-pre-wrap" style={{ background: "#080E1E" }}>
                  {selectedApertura.materiales}
                </div>
              </div>
            )}

            {selectedApertura.nota_admin && (
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Nota anterior del admin</p>
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm whitespace-pre-wrap">
                  {selectedApertura.nota_admin}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-between pt-2 border-t border-border">
              <button
                onClick={() => setDeletingApertura(selectedApertura)}
                className="py-2 px-3 text-xs text-white/40 hover:text-red-400 transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 size={13} /> Eliminar
              </button>
              {(selectedApertura.estado === "pendiente" || selectedApertura.estado === "en_revision") && (
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={async () => { await updateAperturaEstado(selectedApertura, "rechazada"); setSelectedApertura(null); }}
                    className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 text-red-400 border-red-500/30"
                  >
                    <X size={15} /> Rechazar
                  </button>
                  <button
                    onClick={() => { setRevisionFor(selectedApertura); setRevisionNote(selectedApertura.nota_admin ?? ""); }}
                    className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 text-amber-400 border-amber-500/30"
                  >
                    <Pencil size={14} /> Enviar a revisión
                  </button>
                  <button
                    onClick={async () => { await updateAperturaEstado(selectedApertura, "aprobada"); setSelectedApertura(null); }}
                    className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                  >
                    <Check size={15} /> Aprobar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedSolicitud && (
        <div
          className="fixed inset-0 z-[90] p-4 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedSolicitud(null);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-border p-5 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-bold">Detalle de solicitud</h3>
              <button onClick={() => setSelectedSolicitud(null)} className="text-white/50 hover:text-white"><X size={18} /></button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10" style={{ background: "#080E1E" }}>
              {selectedSolicitud.usuario?.foto_url ? (
                <Image src={selectedSolicitud.usuario.foto_url} className="w-12 h-12 rounded-full object-cover shrink-0" alt="" width={48} height={48} />
              ) : (
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-lg font-bold text-white shrink-0">
                  {selectedSolicitud.usuario?.nombre?.[0] ?? "?"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold truncate">{selectedSolicitud.usuario?.nombre ?? selectedSolicitud.usuario_id}</p>
                {selectedSolicitud.usuario?.email && <p className="text-white/50 text-xs truncate">{selectedSolicitud.usuario.email}</p>}
                {selectedSolicitud.usuario?.telefono && <p className="text-white/50 text-xs truncate">{selectedSolicitud.usuario.telefono}</p>}
              </div>
              <span
                className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                  selectedSolicitud.estado === "aprobado"
                    ? "bg-green-500/15 text-green-400 border border-green-500/20"
                    : selectedSolicitud.estado === "rechazado"
                      ? "bg-red-500/15 text-red-400 border border-red-500/20"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                }`}
              >
                {selectedSolicitud.estado}
              </span>
            </div>

            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Ministerio</p>
              <p className="text-accent font-semibold">{getEquipoNombre(selectedSolicitud)}</p>
            </div>

            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Fecha de solicitud</p>
              <p className="text-white/80 text-sm">
                {new Date(selectedSolicitud.created_at).toLocaleString("es-CR", {
                  timeZone: "America/Costa_Rica", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>

            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Motivo</p>
              <div className="p-3 rounded-xl border border-white/10 text-white/80 text-sm whitespace-pre-wrap" style={{ background: "#080E1E" }}>
                {selectedSolicitud.motivo || <span className="text-white/30 italic">Sin motivo indicado</span>}
              </div>
            </div>

            {selectedSolicitud.estado === "pendiente" && (
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={async () => { await updateEstado(selectedSolicitud, "rechazado"); setSelectedSolicitud(null); }}
                  className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 text-red-400 border-red-500/30"
                >
                  <X size={15} /> Rechazar
                </button>
                <button
                  onClick={async () => { await updateEstado(selectedSolicitud, "aprobado"); setSelectedSolicitud(null); }}
                  className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                >
                  <Check size={15} /> Aprobar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
