"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays, HandHeart,
  UsersRound, ShieldAlert, LogOut, Menu, X, Compass,
  Video, BookOpen, Newspaper, Radio, Church, ExternalLink, FileText, BookMarked, Image as ImageIcon, Images, HandCoins, Home
} from "lucide-react";

type BadgeKey = "ministerios" | "gps" | "oraciones";

const NAV: Array<{ href: string; label: string; icon: typeof LayoutDashboard; badge?: BadgeKey; liveIndicator?: boolean }> = [
  { href: "/admin",                label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/inicio",        label: "Inicio",       icon: Home },
  { href: "/admin/eventos",        label: "Eventos",      icon: CalendarDays },
  { href: "/admin/sermones",       label: "Prédicas",     icon: Video },
  { href: "/admin/anuncios",       label: "Anuncios",     icon: Newspaper },
  { href: "/admin/devocionales",   label: "Devocionales", icon: BookOpen },
  { href: "/admin/pastores",       label: "Pastores",     icon: Church },
  { href: "/admin/live",           label: "En Vivo",      icon: Radio, liveIndicator: true },
  { href: "/admin/oraciones",      label: "Oraciones",    icon: HandHeart, badge: "oraciones" },
  { href: "/admin/equipos",        label: "Ministerios",  icon: UsersRound, badge: "ministerios" },
  { href: "/admin/gps",            label: "GPS",          icon: Compass, badge: "gps" },
  { href: "/admin/recursos",       label: "Recursos",     icon: FileText },
  { href: "/admin/biblia",         label: "Biblia",       icon: BookMarked },
  { href: "/admin/banners",        label: "Banners",      icon: ImageIcon },
  { href: "/admin/galeria",        label: "Galería",      icon: Images },
  { href: "/admin/ofrenda",        label: "Ofrenda",      icon: HandCoins },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState<Record<BadgeKey, number>>({ ministerios: 0, gps: 0, oraciones: 0 });
  const [liveActive, setLiveActive] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut({ scope: "global" });
    router.replace("/login");
  };

  useEffect(() => {
    const load = async () => {
      const [pendingSolsRes, aperturasRes, oracionesRes, liveCfgRes, liveAutoRes] = await Promise.all([
        supabase
          .from("equipo_solicitudes")
          .select("equipo_id, equipos:equipos(tipo)")
          .eq("estado", "pendiente"),
        supabase.from("gps_aperturas").select("id", { count: "exact", head: true }).eq("estado", "pendiente"),
        supabase.from("oraciones").select("id", { count: "exact", head: true }).eq("estado", "pendiente"),
        supabase.from("config_live").select("activo, manual_override, video_id").eq("id", 1).maybeSingle(),
        fetch("/api/live-status").then((r) => r.json()).catch(() => ({ isLive: false })),
      ]);
      const sols = (pendingSolsRes.data ?? []) as Array<{ equipos: { tipo?: string } | null }>;
      const ministeriosPending = sols.filter((s) => (s.equipos?.tipo ?? "ministerio") === "ministerio").length;
      const gpsSolicPending = sols.filter((s) => s.equipos?.tipo === "gps").length;
      const aperturasPending = aperturasRes.count ?? 0;
      setBadges({
        ministerios: ministeriosPending,
        gps: gpsSolicPending + aperturasPending,
        oraciones: oracionesRes.count ?? 0,
      });
      const manual = !!liveCfgRes.data && !!liveCfgRes.data.video_id && (!!liveCfgRes.data.activo || !!liveCfgRes.data.manual_override);
      setLiveActive(manual || !!liveAutoRes?.isLive);
    };
    void load();
    const interval = setInterval(() => void load(), 30_000);

    const channel = supabase
      .channel("admin-badges")
      .on("postgres_changes", { event: "*", schema: "public", table: "equipo_solicitudes" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "gps_aperturas" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "oraciones" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "config_live" }, () => void load())
      .subscribe();

    return () => {
      clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [pathname]);

  const totalPending = Object.values(badges).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen flex bg-bg overflow-x-hidden">
      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col overflow-y-auto border-r border-border transition-transform duration-300 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.22)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "#08111f" }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <Image src="/logo-cjc.png" alt="Logo" width={32} height={32} className="object-contain" />
          <div>
            <p className="text-[9px] font-bold tracking-[3px] uppercase text-white/30">Panel</p>
            <p className="text-xs font-black tracking-widest uppercase text-white">Admin</p>
          </div>
          <button className="ml-auto lg:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Badge */}
        <div className="px-5 py-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
            style={{ background: "rgba(191,30,46,0.15)", color: "#BF1E2E", border: "1px solid rgba(191,30,46,0.3)" }}>
            <ShieldAlert size={10} /> Administrador
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, badge, liveIndicator }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            const count = badge ? badges[badge] : 0;
            const showLive = liveIndicator && liveActive;
            return (
              <Link key={href} href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                  ? "bg-accent/15 text-white border border-accent/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                <Icon size={16} className={active ? "text-accent" : ""} />
                <span className="flex-1">{label}</span>
                {showLive && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-green-500/15 text-green-400 border border-green-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Live
                  </span>
                )}
                {count > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold bg-accent text-white">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-border space-y-2">
          {/* Panel quick links */}
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <Link href="/lider"
              className="flex items-center justify-center py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:opacity-80"
              style={{ background: "rgba(59,130,246,0.10)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
              Líder
            </Link>
            <Link href="/cocina"
              className="flex items-center justify-center py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:opacity-80"
              style={{ background: "rgba(251,146,60,0.10)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.2)" }}>
              Cocina
            </Link>
          </div>
          <Link href="/"
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors w-full py-1">
            <ExternalLink size={15} /> Ver sitio
          </Link>
          <button onClick={handleSignOut}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors w-full py-1">
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-64 overflow-x-hidden">
        {/* Top bar mobile */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border sticky top-0 z-30"
          style={{ background: "#08111f" }}>
          <button onClick={() => setSidebarOpen(true)} className="relative text-white p-1">
            <Menu size={20} />
            {totalPending > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </button>
          <Image src="/logo-cjc.png" alt="Logo" width={24} height={24} className="object-contain" />
          <div className="leading-tight">
            <p className="text-[8px] font-bold tracking-[3px] uppercase text-white/30">Panel</p>
            <p className="text-xs font-black tracking-widest uppercase text-white">Admin</p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase ml-1"
            style={{ background: "rgba(191,30,46,0.15)", color: "#BF1E2E", border: "1px solid rgba(191,30,46,0.3)" }}>
            <ShieldAlert size={9} /> Admin
          </span>
          <div className="ml-auto flex items-center gap-2">
            {liveActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-500/15 text-green-400 border border-green-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live
              </span>
            )}
            {totalPending > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-accent font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                {totalPending}
              </span>
            )}
            <Link href="/" className="text-white/50 hover:text-white p-1" aria-label="Ver sitio">
              <ExternalLink size={16} />
            </Link>
            <button onClick={handleSignOut} className="text-white/50 hover:text-white p-1" aria-label="Cerrar sesión">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <main className="flex-1 p-6 lg:p-8 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.22)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
          {children}
        </main>
      </div>
    </div>
  );
}
