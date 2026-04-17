"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Camera, Shield, Users, BookOpen, Heart, CalendarDays, Palette, X, Bell, Radio, BookMarked, FileText, Mic2, BookOpenCheck, UserCheck, UserX, UserPlus, UserMinus } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import { getLibro, LIBROS } from "@/lib/bible-books";
import type { Oracion } from "@/lib/supabase";
import { CLOUDINARY_PRESET, cloudinaryUploadUrl } from "@/lib/cloudinary";

function computeCurrentChapter(
  libro: string, capitulo: number, autoAvance: boolean, fechaInicio: string | null,
): number {
  if (!autoAvance || !fechaInicio) return capitulo;
  const libroData = LIBROS.find(l => l.id === libro);
  if (!libroData) return capitulo;

  // Costa Rica is UTC-6 (no DST). Monday 12:00 PM CR = 18:00 UTC.
  const [y, m, d] = fechaInicio.split("-").map(Number);
  const startMs = Date.UTC(y, m - 1, d, 18, 0, 0);
  const nowMs = Date.now();

  if (nowMs < startMs) return capitulo;
  const weeksPassed = Math.floor((nowMs - startMs) / (7 * 24 * 60 * 60 * 1000));
  return ((capitulo + weeksPassed - 1) % libroData.caps) + 1;
}

const ROL_LABEL: Record<string, { label: string; color: string }> = {
  admin:   { label: "Administrador", color: "#BF1E2E" },
  lider:   { label: "Líder",         color: "#f59e0b" },
  cocina:  { label: "Cocina",        color: "#fb923c" },
  miembro: { label: "Miembro",       color: "#3b82f6" },
};

type BibliaConfig = {
  libro: string; capitulo: number; versiculo: number;
  titulo: string; activo: boolean; auto_avance: boolean; fecha_inicio: string | null;
};
type GpsRegistro = {
  equipo_id: string | null;
  equipo_nombre: string | null;
  estado: string | null;
  created_at?: string | null;
};
type GpsState = { nombre: string; estado: "aprobada" | "pendiente" | "rechazada" | "desconocido" };
type MinisterioRegistro = { equipo_id: string | null; equipo_nombre: string | null };
type MinisterioInfo = { id: string; nombre: string; icon_name?: string | null };
type Notificacion = { id: string; tipo: string; titulo: string; cuerpo: string | null; leida: boolean; created_at: string; meta: Record<string, unknown> | null };

const COVERS = [
  { id: "red",    label: "Rojo",    bg: "linear-gradient(135deg, #1A0A0D 0%, #2a0810 60%, #0D1020 100%)", glow: "rgba(191,30,46,0.35)",   line: "#BF1E2E" },
  { id: "blue",   label: "Azul",    bg: "linear-gradient(135deg, #080E1E 0%, #0a1a3a 60%, #0D1020 100%)", glow: "rgba(59,130,246,0.30)",   line: "#3b82f6" },
  { id: "purple", label: "Morado",  bg: "linear-gradient(135deg, #0D0820 0%, #1a0d38 60%, #0D1020 100%)", glow: "rgba(139,92,246,0.30)",   line: "#8b5cf6" },
  { id: "gold",   label: "Dorado",  bg: "linear-gradient(135deg, #150e00 0%, #2a1e00 60%, #0D1020 100%)", glow: "rgba(245,158,11,0.28)",   line: "#f59e0b" },
  { id: "green",  label: "Verde",   bg: "linear-gradient(135deg, #001510 0%, #002a1a 60%, #0D1020 100%)", glow: "rgba(16,185,129,0.28)",   line: "#10b981" },
  { id: "teal",   label: "Celeste", bg: "linear-gradient(135deg, #001520 0%, #002a38 60%, #0D1020 100%)", glow: "rgba(6,182,212,0.28)",    line: "#06b6d4" },
];

const COVER_KEY = "perfil_cover";
const COVER_IMG_KEY = "perfil_cover_img";
const ORACIONES_PAGE_SIZE = 3;

export default function PerfilPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser]             = useState<User | null>(null);
  const [nombre, setNombre]         = useState("");
  const [rol, setRol]               = useState("");
  const [roles, setRoles]           = useState<string[]>([]);
  const [fotoUrl, setFotoUrl]       = useState<string | null>(null);
  const [imgError, setImgError]     = useState(false);
  const [gps, setGps]               = useState<GpsState | null>(null);
  const [ministerios, setMinisterios] = useState<MinisterioInfo[]>([]);
  const [oraciones, setOraciones]   = useState<Oracion[]>([]);
  const [orCount, setOrCount]       = useState(0);
  const [biblia, setBiblia]         = useState<BibliaConfig | null>(null);
  const [loading, setLoading]       = useState(true);
  const [guardando, setGuardando]   = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [mensaje, setMensaje]       = useState("");
  const [errorUpload, setErrorUpload] = useState("");
  const [coverId, setCoverId]       = useState(() => {
    if (typeof window === "undefined") return "red";
    return localStorage.getItem(COVER_KEY) ?? "red";
  });
  const [coverImg, setCoverImg]     = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(COVER_IMG_KEY);
  });
  const [banners, setBanners]       = useState<{ id: string; url: string; label: string }[]>([]);
  const [showCovers, setShowCovers] = useState(false);
  const [activeTab, setActiveTab]   = useState<"resumen" | "oraciones" | "cuenta" | "notificaciones">("cuenta");
  const [telefono, setTelefono]     = useState("");
  const [orPage, setOrPage]         = useState(1);
  const [notifs, setNotifs]         = useState<Notificacion[]>([]);
  const [unread, setUnread]         = useState(0);

  useEffect(() => {
    supabase
      .from("config_banners")
      .select("id, url, label")
      .eq("activo", true)
      .order("orden")
      .then(({ data }: { data: { id: string; url: string; label: string }[] | null }) => setBanners(data ?? []));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { router.push("/login"); return; }
      const data = { user: session.user as User };
      setUser(data.user);

      const [perfilRes, bibliaRes] = await Promise.all([
        supabase.from("usuarios").select("nombre, rol, roles, foto_url, telefono").eq("id", session.user.id).single(),
        supabase.from("config_biblia").select("*").eq("id", 1).single(),
      ]);

      const { data: gpsRegs, error: gpsError } = await supabase
        .from("gps_registros")
        .select("equipo_id, equipo_nombre, estado, created_at")
        .eq("usuario_id", data.user.id);

      let gpsNombre: string | null = null;
      let gpsEstado: GpsState["estado"] = "desconocido";
      if (!gpsError) {
        const registros = (gpsRegs ?? []) as GpsRegistro[];
        const preferred = registros.find(r => r.estado === "aprobada")
          ?? registros.find(r => r.estado === "pendiente")
          ?? registros[0];

        if (preferred?.equipo_id) {
          const { data: equipoData } = await supabase
            .from("equipos")
            .select("nombre")
            .eq("id", preferred.equipo_id)
            .maybeSingle();
          gpsNombre = equipoData?.nombre ?? preferred.equipo_nombre ?? null;
        } else {
          gpsNombre = preferred?.equipo_nombre ?? null;
        }
        if (preferred?.estado === "aprobada" || preferred?.estado === "pendiente" || preferred?.estado === "rechazada") {
          gpsEstado = preferred.estado;
        }
      }

      const { data: ministerioRegs } = await supabase
        .from("equipo_solicitudes")
        .select("equipo_id, equipo_nombre")
        .eq("usuario_id", data.user.id)
        .eq("estado", "aprobado");

      const ministeriosBase = (ministerioRegs ?? []) as MinisterioRegistro[];
      const ids = Array.from(new Set(ministeriosBase.map((m) => m.equipo_id).filter(Boolean))) as string[];
      if (ids.length > 0) {
        const { data: equiposData } = await supabase.from("equipos").select("id, nombre, icon_name").in("id", ids);
        const list = ((equiposData ?? []) as Array<{ id: string; nombre: string | null; icon_name?: string | null }>)
          .map((e) => ({ id: e.id, nombre: String(e.nombre ?? ""), icon_name: e.icon_name ?? null }));
        setMinisterios(list);
      } else {
        setMinisterios([]);
      }

      const { data: ownOraciones, error: ownOrError } = await supabase
        .from("oraciones")
        .select("*")
        .eq("autor_uid", data.user.id)
        .neq("estado", "eliminada")
        .order("fecha", { ascending: false })
        .limit(50);

      let myOraciones = ownOrError ? [] : (ownOraciones ?? []) as Oracion[];

      if (myOraciones.length === 0 && perfilRes.data?.nombre) {
        const { data: byName, error: byNameError } = await supabase
          .from("oraciones")
          .select("*")
          .eq("nombre", perfilRes.data.nombre)
          .eq("anonima", false)
          .neq("estado", "eliminada")
          .order("fecha", { ascending: false })
          .limit(50);
        if (byNameError) {
        } else {
          myOraciones = (byName ?? []) as Oracion[];
        }
      }

      const { count: ownCount } = await supabase
        .from("oraciones")
        .select("id", { count: "exact", head: true })
        .eq("autor_uid", data.user.id)
        .neq("estado", "eliminada");

      let finalCount = ownCount ?? 0;
      if (finalCount === 0 && perfilRes.data?.nombre) {
        const { count: byNameCount } = await supabase
          .from("oraciones")
          .select("id", { count: "exact", head: true })
          .eq("nombre", perfilRes.data.nombre)
          .eq("anonima", false)
          .neq("estado", "eliminada");
        finalCount = byNameCount ?? 0;
      }

      setNombre(perfilRes.data?.nombre ?? data.user.user_metadata?.full_name ?? "");
      setRol(perfilRes.data?.rol ?? "miembro");
      const rawRoles = perfilRes.data?.roles;
      setRoles(Array.isArray(rawRoles) ? rawRoles : (rawRoles ? Object.values(rawRoles) : [perfilRes.data?.rol ?? "miembro"]));
      setTelefono(perfilRes.data?.telefono ?? "");
      setFotoUrl(perfilRes.data?.foto_url ?? data.user.user_metadata?.avatar_url ?? null);
      if (gpsNombre) setGps({ nombre: gpsNombre, estado: gpsEstado });
      else setGps(null);
      setOraciones(myOraciones);
      setOrPage(1);
      if (bibliaRes.data) setBiblia(bibliaRes.data as BibliaConfig);
      setOrCount(finalCount);

      setLoading(false);

      // Notificaciones
      const { data: notifData } = await supabase
        .from("notificaciones")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      const notifList = (notifData ?? []) as Notificacion[];
      setNotifs(notifList);
      setUnread(notifList.filter(n => !n.leida).length);
    });
  }, [router]);

  const selectCover = (id: string) => {
    setCoverId(id);
    localStorage.setItem(COVER_KEY, id);
  };

  const selectCoverImg = (url: string | null) => {
    setCoverImg(url);
    if (url) localStorage.setItem(COVER_IMG_KEY, url);
    else localStorage.removeItem(COVER_IMG_KEY);
  };

  const handleGuardar = async () => {
    if (!user) return;
    setGuardando(true);
    await supabase.from("usuarios").update({ nombre, telefono: telefono || null }).eq("id", user.id);
    await supabase.auth.updateUser({ data: { full_name: nombre } });
    setGuardando(false);
    setMensaje("¡Perfil actualizado!");
    setTimeout(() => setMensaje(""), 3000);
  };

  const uploadCloudinary = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    const res = await fetch(cloudinaryUploadUrl(), {
      method: "POST",
      body: fd,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.secure_url ?? null;
  };

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setMensaje("");
    setErrorUpload("");

    if (!file.type.startsWith("image/")) {
      setErrorUpload("Solo se permiten imágenes.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorUpload("La imagen debe pesar menos de 5MB.");
      e.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const cloudinaryUrl = await uploadCloudinary(file);
      if (!cloudinaryUrl) {
        setErrorUpload("No se pudo subir la imagen a Cloudinary.");
        return;
      }

      const versionedUrl = `${cloudinaryUrl}?v=${Date.now()}`;

      const { error: dbError } = await supabase.from("usuarios").update({ foto_url: versionedUrl }).eq("id", user.id);
      if (dbError) {
        setErrorUpload(`Se subió la imagen, pero no se guardó en perfil: ${dbError.message}`);
        return;
      }

      await supabase.auth.updateUser({ data: { avatar_url: versionedUrl } });
      setFotoUrl(versionedUrl);
      setImgError(false);
      setMensaje("Foto actualizada.");
    } catch {
      setErrorUpload("No se pudo actualizar la foto. Intenta de nuevo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut({ scope: "global" });
    router.replace("/login?logout=1");
    router.refresh();
  };

  const handleDeleteOracion = async (id: string) => {
    if (!user) return;
    if (!confirm("¿Eliminar esta oración?")) return;
    await supabase.from("oracion_orantes").delete().eq("oracion_id", id);

    // Hide everywhere immediately even if hard delete is blocked by RLS.
    await supabase.from("oraciones").update({ estado: "eliminada" }).eq("id", id);
    await supabase.from("oraciones").delete().eq("id", id);

    setOraciones((prev) => prev.filter((o) => o.id !== id));
    setOrCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    if (!user || unread === 0) return;
    await supabase.from("notificaciones").update({ leida: true }).eq("user_id", user.id).eq("leida", false);
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
    setUnread(0);
  };

  if (loading) return <LoadingScreen />;

  const rolInfo   = ROL_LABEL[rol] ?? ROL_LABEL.miembro;
  const cover     = COVERS.find(c => c.id === coverId) ?? COVERS[0];
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("es", { month: "short", year: "numeric", timeZone: "America/Costa_Rica" })
    : "—";
  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Costa_Rica" })
    : "—";


  const currentCap     = biblia ? computeCurrentChapter(biblia.libro, biblia.capitulo, biblia.auto_avance, biblia.fecha_inicio) : null;
  const libroData      = biblia ? getLibro(biblia.libro) : null;
  const bibliaProgress = libroData && currentCap ? Math.round((currentCap / libroData.caps) * 100) : 0;
  const showAvatar     = fotoUrl && !imgError;
  const gpsStatusLabel = gps?.estado === "aprobada"
    ? "Aprobado"
    : gps?.estado === "pendiente"
      ? "Pendiente"
      : gps?.estado === "rechazada"
        ? "Rechazado"
        : "Sin estado";
  const gpsStatusClass = gps?.estado === "aprobada"
    ? "text-green-400 bg-green-400/10 border-green-400/20"
    : gps?.estado === "pendiente"
      ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
      : gps?.estado === "rechazada"
        ? "text-red-400 bg-red-400/10 border-red-400/20"
        : "text-white/40 bg-white/5 border-white/10";
  const totalOrPages = Math.max(1, Math.ceil(oraciones.length / ORACIONES_PAGE_SIZE));
  const safeOrPage = Math.min(orPage, totalOrPages);
  const paginatedOraciones = oraciones.slice(
    (safeOrPage - 1) * ORACIONES_PAGE_SIZE,
    safeOrPage * ORACIONES_PAGE_SIZE
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-4">

      {/* ── HEADER ── */}
      {/* Outer card: NO overflow-hidden → picker puede salir sin clipping */}
      <div className="relative rounded-2xl border border-white/5" style={{ background: "#080E1E" }}>

        {/* Cover — tiene su propio overflow-hidden para efectos internos */}
        <div className="h-32 rounded-t-2xl overflow-hidden relative" style={{ background: cover.bg }}>
          {/* Imagen de fondo si está seleccionada */}
          {coverImg && (
            <Image
              src={coverImg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
              fill
              sizes="100vw"
              style={{ opacity: 0.62 }}
            />
          )}
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 14px)" }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-24 rounded-full blur-[70px] pointer-events-none"
            style={{ background: cover.glow }} />
          <div className="absolute top-0 left-1/4 right-1/4 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${cover.line}, transparent)` }} />
          {/* Botón Banner */}
          <button onClick={() => setShowCovers(v => !v)}
            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/20 backdrop-blur-sm text-white/70 hover:text-white hover:border-white/40 transition-all text-xs font-medium"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
            <Palette size={11} /> Banner
          </button>
        </div>

        {/* Picker — fuera del cover, z-50 → encima del avatar */}
        {showCovers && (
          <div className="absolute top-10 right-3 z-50 rounded-xl border border-white/15 p-4 shadow-2xl"
            style={{ background: "rgba(8,14,30,0.97)", backdropFilter: "blur(20px)", minWidth: "230px" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold">Color</p>
              <button onClick={() => setShowCovers(false)} className="text-white/30 hover:text-white transition-colors">
                <X size={13} />
              </button>
            </div>
            <div className="flex gap-2 flex-wrap mb-4">
              {COVERS.map(c => (
                <button key={c.id} onClick={() => selectCover(c.id)} title={c.label}
                  className={`w-9 h-6 rounded-lg border-2 transition-all ${coverId === c.id ? "border-white scale-110" : "border-transparent hover:border-white/40"}`}
                  style={{ background: c.bg }} />
              ))}
            </div>

            {banners.length > 0 && (
              <>
                <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold mb-2">Imagen</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {/* Sin imagen */}
                  <button onClick={() => selectCoverImg(null)}
                    className={`h-14 rounded-lg border-2 flex items-center justify-center transition-all text-[10px] text-white/30 ${!coverImg ? "border-white" : "border-white/10 hover:border-white/30"}`}
                    style={{ background: "#080E1E" }}>
                    Ninguna
                  </button>
                  {banners.map(b => (
                    <button key={b.id} onClick={() => selectCoverImg(b.url)} title={b.label}
                      className={`h-14 rounded-lg border-2 overflow-hidden transition-all ${coverImg === b.url ? "border-white scale-105" : "border-white/10 hover:border-white/40"}`}>
                      <Image src={b.url} className="w-full h-full object-cover" alt={b.label} width={56} height={56} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Avatar + info */}
        <div className="px-6 pt-4 pb-6">
          <div className="flex items-center gap-4">
            {/* Avatar sobresale del cover */}
            <div className="relative shrink-0 -mt-14">
              <div className="w-20 h-20 rounded-full border-4 overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: "rgba(191,30,46,0.12)", borderColor: "#080E1E" }}>
                {showAvatar
                  ? <Image src={fotoUrl!} alt="avatar" className="w-full h-full object-cover" width={80} height={80} onError={() => setImgError(true)} />
                  : <UserIcon className="text-accent" size={32} />
                }
              </div>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full border border-white/20 flex items-center justify-center hover:border-accent transition-colors"
                style={{ backgroundColor: "#0F1C30" }}>
                {uploading
                  ? <span className="w-2.5 h-2.5 rounded-full border border-accent border-t-transparent animate-spin" />
                  : <Camera size={11} className="text-white/60" />
                }
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
            </div>

            {/* Nombre + email */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight break-words">
                {nombre || user?.email}
              </h1>
              <p className="text-white/35 text-xs mt-0.5 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {(roles.length > 0 ? roles : [rol]).map((r) => {
              const info = ROL_LABEL[r] ?? ROL_LABEL.miembro;
              return (
                <span key={r} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border"
                  style={{ color: info.color, borderColor: `${info.color}40`, backgroundColor: `${info.color}10` }}>
                  <Shield size={9} /> {info.label}
                </span>
              );
            })}
            {gps && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10 text-white/50"
                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                <Users size={9} /> {gps.nombre}
              </span>
            )}
            {gps && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${gpsStatusClass}`}>
                {gpsStatusLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {([
          { icon: CalendarDays, label: "Miembro desde", value: memberSince,              color: "#3b82f6" },
          { icon: Heart,        label: "Oraciones",     value: String(orCount),          color: "#BF1E2E" },
          { icon: Users,        label: "GPS",           value: gps?.nombre ?? "Sin GPS", color: "#f59e0b" },
        ] as const).map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/5 p-4 flex flex-col items-center text-center gap-1.5"
            style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
              <Icon size={14} style={{ color }} />
            </div>
            <p className="text-white font-bold text-sm leading-tight w-full truncate">{value}</p>
            <p className="text-white/30 text-[10px]">{label}</p>
          </div>
        ))}
        <div className="rounded-xl border border-white/5 p-4 flex flex-col items-center text-center gap-1.5"
          style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
          {ministerios.length === 0 ? (
            <>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#10b98115" }}>
                <Shield size={14} style={{ color: "#10b981" }} />
              </div>
              <p className="text-white font-bold text-sm leading-tight">Sin ministerio</p>
            </>
          ) : (
            <div className="flex items-center justify-center flex-wrap gap-1">
              {ministerios.map((m) =>
                m.icon_name && /^https?:\/\//i.test(m.icon_name) ? (
                  <Image key={m.id} src={m.icon_name} alt={m.nombre} width={32} height={32}
                    className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0" title={m.nombre} />
                ) : (
                  <div key={m.id} className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ background: "#10b98120", border: "1px solid #10b98130" }} title={m.nombre}>
                    {m.nombre[0]}
                  </div>
                )
              )}
            </div>
          )}
          <p className="text-white/30 text-[10px]">Ministerio{ministerios.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 p-1 rounded-xl border border-white/10 w-max min-w-full" style={{ background: "#080E1E" }}>
        {([
          { id: "cuenta", label: "Cuenta" },
          { id: "oraciones", label: "Oraciones" },
          { id: "resumen", label: "Resumen" },
          { id: "notificaciones", label: "Notificaciones" },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if (tab.id === "notificaciones") markAllRead(); }}
            className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id ? "bg-accent text-white" : "text-white/45 hover:text-white"
            }`}>
            {tab.label}
            {tab.id === "notificaciones" && unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-black flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        ))}
        </div>
      </div>

      {/* ── LECTURA DOMINICAL ── */}
      {activeTab === "resumen" && biblia?.activo && libroData && currentCap && (
        <div className="rounded-2xl border border-accent/20 p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
          <div className="absolute top-0 left-1/4 right-1/4 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #BF1E2E, transparent)" }} />
          <div className="absolute right-4 top-3 text-accent/10 pointer-events-none select-none font-black"
            style={{ fontSize: 72, lineHeight: 1 }}>{currentCap}</div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={15} className="text-accent" />
              <p className="text-white/40 text-[10px] uppercase tracking-wider">Lectura de la Semana</p>
            </div>
            <p className="text-white font-bold text-lg">
              {libroData.nombre} <span className="text-accent">{currentCap}</span>
            </p>
            <p className="text-white/35 text-xs mb-4">Capítulo {currentCap} de {libroData.caps}</p>
            <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${bibliaProgress}%`, background: "linear-gradient(90deg, #BF1E2E, #ff4d5e)" }} />
            </div>
            <p className="text-white/25 text-[10px]">{bibliaProgress}% del libro completado</p>
          </div>
        </div>
      )}

      {/* ── MIS ORACIONES ── */}
      {activeTab === "oraciones" && (
      <div className="rounded-2xl border border-white/5 p-5"
        style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 rounded-full bg-accent" />
            <h2 className="text-white/60 text-[10px] font-black tracking-[3px] uppercase">Mis Oraciones</h2>
          </div>
          <Link href="/oraciones" className="text-xs text-accent hover:underline">Nueva</Link>
        </div>
        {oraciones.length === 0 ? (
          <p className="text-white/35 text-sm">Aún no encontramos oraciones ligadas a tu cuenta.</p>
        ) : (
          <div className="space-y-2.5">
            {paginatedOraciones.map(o => (
              <div key={o.id} className="rounded-xl border border-white/5 p-3.5" style={{ background: "#080E1E" }}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-white/70 text-sm leading-relaxed line-clamp-2 flex-1">{o.peticion}</p>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      o.estado === "aprobada"  ? "text-green-400 bg-green-400/10 border-green-400/20" :
                      o.estado === "pendiente" ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" :
                      "text-white/30 bg-white/5 border-white/10"
                    }`}>{o.estado}</span>
                    <button
                      onClick={() => void handleDeleteOracion(o.id)}
                      className="text-[11px] text-red-400/80 hover:text-red-400 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <p className="text-white/25 text-xs mt-2">
                  {new Date(o.fecha).toLocaleDateString("es", { timeZone: "America/Costa_Rica", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            ))}
            {totalOrPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setOrPage(p => Math.max(1, p - 1))}
                  disabled={safeOrPage === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/70 disabled:opacity-40">
                  Anterior
                </button>
                <span className="text-white/35 text-xs">Página {safeOrPage} de {totalOrPages}</span>
                <button
                  onClick={() => setOrPage(p => Math.min(totalOrPages, p + 1))}
                  disabled={safeOrPage === totalOrPages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/70 disabled:opacity-40">
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* ── INFORMACIÓN PERSONAL ── */}
      {activeTab === "cuenta" && (
      <div className="rounded-2xl border border-white/5 p-6"
        style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-3 rounded-full bg-accent" />
          <h2 className="text-white/60 text-[10px] font-black tracking-[3px] uppercase">Información personal</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-white/40 text-xs block mb-1.5">Nombre completo</label>
            <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" />
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1.5">Email</label>
            <input className="input opacity-40 cursor-not-allowed" value={user?.email ?? ""} disabled />
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1.5">Número (opcional)</label>
            <input
              className="input"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="+506 8888-8888"
              type="tel"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/5 p-3" style={{ background: "#080E1E" }}>
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Último acceso</p>
              <p className="text-white/80 text-sm mt-1">{lastSignIn}</p>
            </div>
            <div className="rounded-xl border border-white/5 p-3" style={{ background: "#080E1E" }}>
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Mi GPS</p>
              <p className="text-white/80 text-sm mt-1">{gps?.nombre ?? "Sin GPS"}</p>
              {gps && <p className="text-white/35 text-xs mt-1">Estado: {gpsStatusLabel}</p>}
            </div>
            <div className="rounded-xl border border-white/5 p-3" style={{ background: "#080E1E" }}>
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Ministerios</p>
              <p className="text-white/80 text-sm mt-1">
                {ministerios.length > 0 ? `${ministerios.length} asignado${ministerios.length > 1 ? "s" : ""}` : "Sin ministerios"}
              </p>
              {ministerios.length > 0 && <p className="text-white/35 text-xs mt-1 line-clamp-2">{ministerios.map((m) => m.nombre).join(", ")}</p>}
            </div>
          </div>
          {mensaje && <p className="text-green-400 text-xs">{mensaje}</p>}
          {errorUpload && <p className="text-red-400 text-xs">{errorUpload}</p>}
          <button onClick={handleGuardar} disabled={guardando} className="btn-primary w-fit text-sm px-5 py-2">
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
      )}

      {/* ── NOTIFICACIONES ── */}
      {activeTab === "notificaciones" && (
        <div className="rounded-2xl border border-white/5 p-5"
          style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 rounded-full bg-accent" />
              <h2 className="text-white/60 text-[10px] font-black tracking-[3px] uppercase">Notificaciones</h2>
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-accent hover:underline">
                Marcar todas leídas
              </button>
            )}
          </div>
          {notifs.length === 0 ? (
            <p className="text-white/35 text-sm">Sin notificaciones aún.</p>
          ) : (
            <div className="space-y-2">
              {notifs.map(n => {
                const Icon =
                  n.tipo === "oracion_orada"       ? Heart :
                  n.tipo === "evento_nuevo"        ? CalendarDays :
                  n.tipo === "live_inicio"         ? Radio :
                  n.tipo === "biblia_avance"       ? BookMarked :
                  n.tipo === "predica_nueva"       ? Mic2 :
                  n.tipo === "devocional_nuevo"    ? BookOpenCheck :
                  n.tipo === "recurso_nuevo"       ? FileText :
                  n.tipo === "ministerio_agregado" ? UserPlus :
                  n.tipo === "ministerio_removido" ? UserMinus :
                  n.tipo === "rol_asignado"        ? UserCheck :
                  n.tipo === "rol_removido"        ? UserX : Bell;
                const iconColor =
                  n.tipo === "oracion_orada"       ? "#BF1E2E" :
                  n.tipo === "evento_nuevo"        ? "#3b82f6" :
                  n.tipo === "live_inicio"         ? "#10b981" :
                  n.tipo === "biblia_avance"       ? "#f59e0b" :
                  n.tipo === "predica_nueva"       ? "#8b5cf6" :
                  n.tipo === "devocional_nuevo"    ? "#06b6d4" :
                  n.tipo === "recurso_nuevo"       ? "#f97316" :
                  n.tipo === "ministerio_agregado" ? "#10b981" :
                  n.tipo === "ministerio_removido" ? "#ef4444" :
                  n.tipo === "rol_asignado"        ? "#f59e0b" :
                  n.tipo === "rol_removido"        ? "#6b7280" : "#6b7280";
                return (
                  <div key={n.id}
                    className={`flex items-start gap-3 rounded-xl p-3 border transition-all ${
                      n.leida ? "border-white/5 opacity-60" : "border-white/10"
                    }`}
                    style={{ background: n.leida ? "transparent" : "#0D1628" }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${iconColor}15` }}>
                      <Icon size={13} style={{ color: iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/90 text-xs font-semibold leading-snug">{n.titulo}</p>
                      {n.cuerpo && <p className="text-white/45 text-xs mt-0.5 line-clamp-2">{n.cuerpo}</p>}
                      <p className="text-white/25 text-[10px] mt-1">
                        {new Date(n.created_at).toLocaleDateString("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Costa_Rica" })}
                      </p>
                    </div>
                    {!n.leida && <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CERRAR SESIÓN ── */}
      <button onClick={handleSignOut}
        className="w-full rounded-2xl border border-white/5 p-4 flex items-center gap-3 text-white/40 hover:text-accent hover:border-accent/30 transition-all duration-200"
        style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
        <LogOut size={18} />
        <span className="text-sm font-medium">Cerrar sesión</span>
      </button>

    </div>
  );
}
