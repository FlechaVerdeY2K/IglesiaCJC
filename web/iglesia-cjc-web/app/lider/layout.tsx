"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, UsersRound,
  CalendarDays, FileText, LogOut, Menu, X,
  ExternalLink, ShieldCheck,
} from "lucide-react";


const NAV = [
  { href: "/lider",          label: "Inicio",     icon: LayoutDashboard },
  { href: "/lider/equipo",   label: "Mi Equipo",  icon: UsersRound },
  { href: "/lider/eventos",  label: "Eventos",    icon: CalendarDays },
  { href: "/lider/recursos", label: "Recursos",   icon: FileText },
];


export default function LiderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.replace("/login"); return; }
      const userId = session.user.id;

      const [profileRes, liderIdRes, lideresRes] = await Promise.all([
        supabase.from("usuarios").select("nombre, roles").eq("id", userId).single(),
        supabase.from("equipos").select("id").eq("lider_id", userId).limit(1),
        supabase.from("equipos").select("id").contains("lideres", [{ id: userId }]).limit(1),
      ]);

      const roles = (profileRes.data?.roles as string[] | null) ?? [];
      const isAdmin = roles.includes("admin");
      const leadsAny = (liderIdRes.data?.length ?? 0) > 0 || (lideresRes.data?.length ?? 0) > 0;

      if (!isAdmin && !leadsAny) { router.replace("/perfil"); return; }

      setNombre(profileRes.data?.nombre ?? session.user.user_metadata?.full_name ?? "Líder");
    })();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen flex bg-bg">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col border-r border-border transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "#08111f" }}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <Image src="/logo-cjc.png" alt="Logo" width={32} height={32} className="object-contain" />
          <div>
            <p className="text-[9px] font-bold tracking-[3px] uppercase text-white/30">Panel</p>
            <p className="text-xs font-black tracking-widest uppercase text-white">Líder</p>
          </div>
          <button className="ml-auto lg:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
            style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}>
            <ShieldCheck size={10} /> Líder
          </span>
          {nombre && <p className="text-white/40 text-xs mt-2 truncate">{nombre}</p>}
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/lider" ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                  ? "text-white border border-blue-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"}`}
                style={active ? { background: "rgba(59,130,246,0.12)" } : {}}>
                <Icon size={16} className={active ? "text-blue-400" : ""} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
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

      <div className="flex-1 flex flex-col lg:ml-64 overflow-x-hidden">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border sticky top-0 z-30"
          style={{ background: "#08111f" }}>
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1">
            <Menu size={20} />
          </button>
          <Image src="/logo-cjc.png" alt="Logo" width={24} height={24} className="object-contain" />
          <div className="leading-tight">
            <p className="text-[8px] font-bold tracking-[3px] uppercase text-white/30">Panel</p>
            <p className="text-xs font-black tracking-widest uppercase text-white">Líder</p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase ml-1"
            style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}>
            <ShieldCheck size={9} /> Líder
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" className="text-white/50 hover:text-white p-1" aria-label="Ver sitio">
              <ExternalLink size={16} />
            </Link>
            <button onClick={handleSignOut} className="text-white/50 hover:text-white p-1" aria-label="Cerrar sesión">
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
