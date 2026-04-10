"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, Users, CalendarDays, HandHeart,
  UsersRound, ShieldAlert, LogOut, Menu, X,
  Video, BookOpen, Newspaper, Radio, Church, Settings, FileText
} from "lucide-react";

const supabase = createBrowserClient(
  "https://fvffsnenebscigtywgwn.supabase.co",
  "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN"
);

const NAV = [
  { href: "/admin",                label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/usuarios",       label: "Usuarios",     icon: Users },
  { href: "/admin/eventos",        label: "Eventos",      icon: CalendarDays },
  { href: "/admin/sermones",       label: "Prédicas",     icon: Video },
  { href: "/admin/anuncios",       label: "Anuncios",     icon: Newspaper },
  { href: "/admin/devocionales",   label: "Devocionales", icon: BookOpen },
  { href: "/admin/pastores",       label: "Pastores",     icon: Church },
  { href: "/admin/live",           label: "En Vivo",      icon: Radio },
  { href: "/admin/oraciones",      label: "Oraciones",    icon: HandHeart },
  { href: "/admin/equipos",        label: "GPS Equipos",  icon: UsersRound },
  { href: "/admin/recursos",       label: "Recursos",     icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data } = await supabase.from("usuarios").select("rol").eq("id", user.id).single();
      if (data?.rol !== "admin") { router.replace("/"); return; }
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <Image src="/logo-cjc.png" alt="CJC" width={56} height={56}
        className="animate-pulse" style={{ filter: "drop-shadow(0 0 16px rgba(191,30,46,0.5))" }} />
    </div>
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col border-r border-border transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
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
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                  ? "bg-accent/15 text-white border border-accent/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                <Icon size={16} className={active ? "text-accent" : ""} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-border">
          <button onClick={handleSignOut}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors w-full">
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top bar mobile */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border sticky top-0 z-30"
          style={{ background: "#08111f" }}>
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1">
            <Menu size={20} />
          </button>
          <span className="text-sm font-bold text-white">Admin</span>
        </div>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
