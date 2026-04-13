"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Camera, Shield, Users, BookOpen, Heart, CalendarDays, Palette, X } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import { getLibro, LIBROS } from "@/lib/bible-books";
import type { Oracion } from "@/lib/supabase";

function computeCurrentChapter(
  libro: string, capitulo: number, autoAvance: boolean, fechaInicio: string | null,
): number {
  if (!autoAvance || !fechaInicio) return capitulo;
  const libroData = LIBROS.find(l => l.id === libro);
  if (!libroData) return capitulo;
  const nowCR = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const todayMs = Date.UTC(nowCR.getUTCFullYear(), nowCR.getUTCMonth(), nowCR.getUTCDate()) + 6 * 60 * 60 * 1000;
  const [y, m, d] = fechaInicio.split("-").map(Number);
  const startMs = Date.UTC(y, m - 1, d) + 6 * 60 * 60 * 1000;
  if (todayMs < startMs) return capitulo;
  const weeksPassed = Math.floor((todayMs - startMs) / (7 * 24 * 60 * 60 * 1000));
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

export default function PerfilPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser]             = useState<User | null>(null);
  const [nombre, setNombre]         = useState("");
  const [rol, setRol]               = useState("");
  const [fotoUrl, setFotoUrl]       = useState<string | null>(null);
  const [imgError, setImgError]     = useState(false);
  const [gps, setGps]               = useState<{ nombre: string } | null>(null);
  const [oraciones, setOraciones]   = useState<Oracion[]>([]);
  const [orCount, setOrCount]       = useState(0);
  const [biblia, setBiblia]         = useState<BibliaConfig | null>(null);
  const [loading, setLoading]       = useState(true);
  const [guardando, setGuardando]   = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [mensaje, setMensaje]       = useState("");
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

  useEffect(() => {
    supabase
      .from("config_banners")
      .select("id, url, label")
      .eq("activo", true)
      .order("orden")
      .then(({ data }: { data: { id: string; url: string; label: string }[] | null }) => setBanners(data ?? []));
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }: { data: { user: User | null } }) => {
      if (!data.user) { router.push("/login"); return; }
      setUser(data.user);

      const [perfilRes, gpsRes, orRes, bibliaRes] = await Promise.all([
        supabase.from("usuarios").select("nombre, rol, foto_url").eq("id", data.user.id).single(),
        supabase.from("gps_registros").select("equipo_nombre").eq("usuario_id", data.user.id).limit(1).maybeSingle(),
        supabase.from("oraciones").select("*").eq("autor_uid", data.user.id).order("fecha", { ascending: false }).limit(3),
        supabase.from("config_biblia").select("*").eq("id", 1).single(),
      ]);

      setNombre(perfilRes.data?.nombre ?? data.user.user_metadata?.full_name ?? "");
      setRol(perfilRes.data?.rol ?? "miembro");
      setFotoUrl(perfilRes.data?.foto_url ?? data.user.user_metadata?.avatar_url ?? null);
      if (gpsRes.data) setGps({ nombre: gpsRes.data.equipo_nombre });
      setOraciones(orRes.data ?? []);
      if (bibliaRes.data) setBiblia(bibliaRes.data as BibliaConfig);

      const { count } = await supabase
        .from("oraciones").select("id", { count: "exact", head: true }).eq("autor_uid", data.user.id);
      setOrCount(count ?? 0);

      setLoading(false);
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
    await supabase.from("usuarios").update({ nombre }).eq("id", user.id);
    await supabase.auth.updateUser({ data: { full_name: nombre } });
    setGuardando(false);
    setMensaje("¡Perfil actualizado!");
    setTimeout(() => setMensaje(""), 3000);
  };

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = urlData.publicUrl;
      await supabase.from("usuarios").update({ foto_url: url }).eq("id", user.id);
      await supabase.auth.updateUser({ data: { avatar_url: url } });
      setFotoUrl(url);
      setImgError(false);
    }
    setUploading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <LoadingScreen />;

  const rolInfo   = ROL_LABEL[rol] ?? ROL_LABEL.miembro;
  const cover     = COVERS.find(c => c.id === coverId) ?? COVERS[0];
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("es", { month: "short", year: "numeric", timeZone: "America/Costa_Rica" })
    : "—";

  const currentCap     = biblia ? computeCurrentChapter(biblia.libro, biblia.capitulo, biblia.auto_avance, biblia.fecha_inicio) : null;
  const libroData      = biblia ? getLibro(biblia.libro) : null;
  const bibliaProgress = libroData && currentCap ? Math.round((currentCap / libroData.caps) * 100) : 0;
  const showAvatar     = fotoUrl && !imgError;

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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border"
              style={{ color: rolInfo.color, borderColor: `${rolInfo.color}40`, backgroundColor: `${rolInfo.color}10` }}>
              <Shield size={9} /> {rolInfo.label}
            </span>
            {gps && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10 text-white/50"
                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                <Users size={9} /> {gps.nombre}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-3 gap-3">
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
      </div>

      {/* ── LECTURA DOMINICAL ── */}
      {biblia?.activo && libroData && currentCap && (
        <div className="rounded-2xl border border-accent/20 p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
          <div className="absolute top-0 left-1/4 right-1/4 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #BF1E2E, transparent)" }} />
          <div className="absolute right-4 top-3 text-accent/10 pointer-events-none select-none font-black"
            style={{ fontSize: 72, lineHeight: 1 }}>{currentCap}</div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={15} className="text-accent" />
              <p className="text-white/40 text-[10px] uppercase tracking-wider">Lectura del Domingo</p>
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
      {oraciones.length > 0 && (
        <div className="rounded-2xl border border-white/5 p-5"
          style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-3 rounded-full bg-accent" />
            <h2 className="text-white/60 text-[10px] font-black tracking-[3px] uppercase">Mis Oraciones</h2>
          </div>
          <div className="space-y-2.5">
            {oraciones.map(o => (
              <div key={o.id} className="rounded-xl border border-white/5 p-3.5" style={{ background: "#080E1E" }}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-white/70 text-sm leading-relaxed line-clamp-2 flex-1">{o.peticion}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                    o.estado === "aprobada"  ? "text-green-400 bg-green-400/10 border-green-400/20" :
                    o.estado === "pendiente" ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" :
                    "text-white/30 bg-white/5 border-white/10"
                  }`}>{o.estado}</span>
                </div>
                <p className="text-white/25 text-xs mt-2">
                  {new Date(o.fecha).toLocaleDateString("es", { timeZone: "America/Costa_Rica", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── INFORMACIÓN PERSONAL ── */}
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
          {mensaje && <p className="text-green-400 text-xs">{mensaje}</p>}
          <button onClick={handleGuardar} disabled={guardando} className="btn-primary">
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

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
