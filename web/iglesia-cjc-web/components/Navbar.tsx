"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

import type { User } from "@supabase/supabase-js";
import { Menu, X, ChevronDown, User as UserIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { recordBrowserAccess } from "@/lib/access-log";


// Links públicos (sin login)
const PUBLIC_LINKS = [
  { href: "/sermones", label: "Prédicas" },
  { href: "/eventos", label: "Eventos" },
  { href: "/pastores", label: "Pastores" },
  { href: "/biblia", label: "Biblia" },
  { href: "/live", label: "En Vivo" },
  { href: "/contacto", label: "Contacto" },
];

// Links solo para logueados
const MEMBER_LINKS = [
  { href: "/devocionales", label: "Devocional" },
  { href: "/galeria", label: "Galería" },
  { href: "/equipos", label: "GPS" },
  { href: "/ministerios", label: "Ministerios" },
  { href: "/oraciones", label: "Oraciones" },
  { href: "/recursos", label: "Recursos" },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [leadsAny, setLeadsAny] = useState(false);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const hasMountedPathRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startClosingMenu = () => {
    setClosing(true);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      closeTimerRef.current = null;
    }, 400);
  };

  const toggleMenu = () => {
    if (open || closing) {
      startClosingMenu();
    } else {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setClosing(false);
      setOpen(true);
    }
  };

  const fetchUnread = async (userId: string) => {
    const { count } = await supabase
      .from("notificaciones")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("leida", false);
    setUnread(count ?? 0);
  };

  const fetchAvatar = async (userId: string, fallback: string | null) => {
    const { data } = await supabase.from("usuarios").select("foto_url, rol, roles").eq("id", userId).single();
    setAvatarUrl(data?.foto_url ?? fallback ?? null);
    const r: string[] = Array.isArray(data?.roles) && data.roles.length > 0
      ? data.roles
      : (data?.rol ? [data.rol] : ["miembro"]);
    setRoles(r);

    const needsLiderCheck = r.includes("lider") && !r.includes("admin");
    if (needsLiderCheck) {
      const [liderIdRes, lideresRes] = await Promise.all([
        supabase.from("equipos").select("id").eq("lider_id", userId).limit(1),
        supabase.from("equipos").select("id").contains("lideres", [{ id: userId }]).limit(1),
      ]);
      setLeadsAny((liderIdRes.data?.length ?? 0) > 0 || (lideresRes.data?.length ?? 0) > 0);
    } else {
      setLeadsAny(r.includes("admin"));
    }

    await fetchUnread(userId);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user);
      if (data.user) {
        fetchAvatar(data.user.id, data.user.user_metadata?.avatar_url ?? null);
        recordBrowserAccess(data.user.id, "navbar");
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_: string, session: { user: User } | null) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAvatar(session.user.id, session.user.user_metadata?.avatar_url ?? null);
        recordBrowserAccess(session.user.id, "navbar");
      }
      else { setAvatarUrl(null); setRoles([]); setLeadsAny(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetchUnread(user.id);
  }, [pathname, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const onFocus = () => fetchUnread(user!.id);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user?.id]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!hasMountedPathRef.current) {
      hasMountedPathRef.current = true;
      prevPathnameRef.current = pathname;
      return;
    }
    if (prevPathnameRef.current === pathname) return;
    prevPathnameRef.current = pathname;
    if (!open && !closing) return;
    startClosingMenu();
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut({ scope: "global" });
    setUser(null);
    setAvatarUrl(null);
    setRoles([]);
    setLeadsAny(false);
    setUnread(0);
    window.location.replace("/login?logout=1");
  };

  if (pathname.startsWith("/admin") || pathname.startsWith("/lider") || pathname.startsWith("/cocina")) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center h-16 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image src="/logo-cjc.png" alt="Logo CJC" width={36} height={36} className="object-contain" />
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-[2px] h-8 bg-[#BF1E2E] rounded-full" />
              <div className="flex flex-col leading-none gap-[3px]">
                <span className="text-[9px] font-bold tracking-[4px] uppercase text-white/30">Comunidad</span>
                <span
                  className="text-[12px] font-black tracking-widest uppercase"
                  style={{ color: "#fff", textShadow: "0 0 12px rgba(255,255,255,0.25)" }}
                >
                  Jesucristo es el camino
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden min-[1250px]:flex items-center gap-1 flex-1">
            {PUBLIC_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                  pathname === l.href ? "text-white bg-border" : "text-muted hover:text-white hover:bg-border"
                }`}
              >
                {l.label}
              </Link>
            ))}

            {/* Dropdown miembros */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setMemberOpen(!memberOpen)}
                  className="text-sm px-3 py-2 rounded-lg text-muted hover:text-white hover:bg-border transition-colors flex items-center gap-1"
                >
                  Comunidad <ChevronDown size={14} className={memberOpen ? "rotate-180 transition-transform" : "transition-transform"} />
                </button>
                {memberOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-xl shadow-xl py-2 min-w-40 z-50">
                    {MEMBER_LINKS.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="block px-4 py-2 text-sm text-muted hover:text-white hover:bg-border transition-colors"
                        onClick={() => setMemberOpen(false)}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Auth desktop */}
          <div className="hidden min-[1250px]:flex items-center gap-3 shrink-0 ml-auto">
            {user ? (
              <>
                <div className="flex items-center gap-1.5">
                  {roles.includes("admin") && (
                    <Link href="/admin"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:opacity-80"
                      style={{ background: "rgba(191,30,46,0.12)", color: "#BF1E2E", border: "1px solid rgba(191,30,46,0.25)" }}>
                      Admin
                    </Link>
                  )}
                  {roles.includes("lider") && leadsAny && (
                    <Link href="/lider"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:opacity-80"
                      style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }}>
                      Líder
                    </Link>
                  )}
                  {roles.includes("cocina") && (
                    <Link href="/cocina"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:opacity-80"
                      style={{ background: "rgba(251,146,60,0.12)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.25)" }}>
                      Cocina
                    </Link>
                  )}
                </div>
                <Link
                  href="/perfil"
                  className="group flex items-center py-1.5 px-1.5 hover:px-3 rounded-xl border border-white/10 hover:border-accent/40 transition-all duration-300 overflow-hidden"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                >
                  <div className="relative w-7 h-7 shrink-0">
                    <div className="w-7 h-7 rounded-full border border-accent/40 flex items-center justify-center overflow-hidden" style={{ backgroundColor: "rgba(191,30,46,0.15)" }}>
                      {avatarUrl
                        ? <Image src={avatarUrl} className="w-7 h-7 rounded-full object-cover" alt="avatar" width={28} height={28} />
                        : <UserIcon size={14} className="text-accent" />
                      }
                    </div>
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-accent text-white text-[9px] font-black flex items-center justify-center px-0.5 leading-none">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white/60 group-hover:text-white max-w-0 group-hover:max-w-[8rem] overflow-hidden whitespace-nowrap pl-0 group-hover:pl-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {user.user_metadata?.full_name ?? user.email}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-muted hover:text-white text-sm transition-colors">
                  Iniciar sesión
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="min-[1250px]:hidden ml-auto text-white p-1 relative w-7 h-7" onClick={toggleMenu}>
            <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${open ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`}>
              <Menu size={24} />
            </span>
            <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}>
              <X size={24} />
            </span>
            {unread > 0 && !open && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-accent text-white text-[9px] font-black flex items-center justify-center px-0.5 leading-none pointer-events-none">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {(open || closing) && (
        <div
          className="min-[1250px]:hidden absolute top-full left-0 right-0 border-t border-white/5 px-5 py-5 flex flex-col max-h-[80vh] overflow-y-auto shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            background: "linear-gradient(180deg, #0D1628 0%, #080E1E 100%)",
            animation: closing ? "menu-slide-up 0.4s ease forwards" : "menu-slide-down 0.4s ease forwards",
            transformOrigin: "top"
          }}
        >
          {/* Label General */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-3 rounded-full bg-accent" />
            <span className="text-white/30 text-[9px] font-black tracking-[3px] uppercase">General</span>
          </div>

          {PUBLIC_LINKS.map((l) => (
            <Link
              key={l.href} href={l.href}
              className={`py-2.5 text-sm border-b border-white/5 transition-colors ${pathname === l.href ? "text-white font-semibold" : "text-white/50 hover:text-white"}`}
            >
              {l.label}
            </Link>
          ))}

          {user ? (
            <>
              <div className="flex items-center gap-2 mt-5 mb-3">
                <div className="w-1 h-3 rounded-full bg-accent" />
                <span className="text-white/30 text-[9px] font-black tracking-[3px] uppercase">Comunidad</span>
              </div>
              {MEMBER_LINKS.map((l) => (
                <Link
                  key={l.href} href={l.href}
                  className={`py-2.5 text-sm border-b border-white/5 transition-colors ${pathname === l.href ? "text-white font-semibold" : "text-white/50 hover:text-white"}`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-5 pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-2 mb-3">
                  {roles.includes("admin") && (
                    <Link href="/admin" className="inline-flex items-center px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: "rgba(191,30,46,0.12)", color: "#BF1E2E", border: "1px solid rgba(191,30,46,0.25)" }}>
                      Admin
                    </Link>
                  )}
                  {roles.includes("lider") && leadsAny && (
                    <Link href="/lider" className="inline-flex items-center px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }}>
                      Líder
                    </Link>
                  )}
                  {roles.includes("cocina") && (
                    <Link href="/cocina" className="inline-flex items-center px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: "rgba(251,146,60,0.12)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.25)" }}>
                      Cocina
                    </Link>
                  )}
                </div>
                <Link
                  href="/perfil"
                  className="flex items-center gap-3 mb-4 p-3 rounded-xl border border-white/8 hover:border-accent/30 transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                >
                  <div className="relative w-9 h-9 shrink-0">
                    <div className="w-9 h-9 rounded-full border border-accent/40 flex items-center justify-center overflow-hidden" style={{ backgroundColor: "rgba(191,30,46,0.15)" }}>
                      {avatarUrl
                        ? <Image src={avatarUrl} className="w-9 h-9 rounded-full object-cover" alt="avatar" width={36} height={36} />
                        : <UserIcon size={16} className="text-accent" />
                      }
                    </div>
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-accent text-white text-[9px] font-black flex items-center justify-center px-0.5 leading-none">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{user.user_metadata?.full_name ?? "Mi perfil"}</p>
                    <p className="text-white/30 text-xs truncate">{user.email}</p>
                  </div>
                </Link>
                <button onClick={handleSignOut} className="btn-secondary text-sm w-full text-center">Cerrar sesión</button>
              </div>
            </>
          ) : (
            <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
              <Link href="/login" className="btn-secondary text-sm text-center block">Iniciar sesión</Link>
              <Link href="/register" className="btn-primary text-sm text-center block">Registrarse</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}


