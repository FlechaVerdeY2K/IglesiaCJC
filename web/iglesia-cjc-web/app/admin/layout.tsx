"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useState } from "react";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays, HandHeart,
  UsersRound, ShieldAlert, LogOut, Menu, X,
  Video, BookOpen, Newspaper, Radio, Church, ExternalLink, FileText, BookMarked, Image as ImageIcon, Images, HandCoins, Home
} from "lucide-react";


const NAV = [
  { href: "/admin",                label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/inicio",        label: "Inicio",       icon: Home },
  { href: "/admin/eventos",        label: "Eventos",      icon: CalendarDays },
  { href: "/admin/sermones",       label: "Prédicas",     icon: Video },
  { href: "/admin/anuncios",       label: "Anuncios",     icon: Newspaper },
  { href: "/admin/devocionales",   label: "Devocionales", icon: BookOpen },
  { href: "/admin/pastores",       label: "Pastores",     icon: Church },
  { href: "/admin/live",           label: "En Vivo",      icon: Radio },
  { href: "/admin/oraciones",      label: "Oraciones",    icon: HandHeart },
  { href: "/admin/equipos",        label: "Ministerios",  icon: UsersRound },
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

  const handleSignOut = async () => {
    await supabase.auth.signOut({ scope: "global" });
    router.replace("/login");
  };

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
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1">
            <Menu size={20} />
          </button>
          <span className="text-sm font-bold text-white">Admin</span>
        </div>

        <main className="flex-1 p-6 lg:p-8 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.22)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
          {children}
        </main>
      </div>
    </div>
  );
}
