"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";

import Link from "next/link";
import { Users, CalendarDays, Video, Newspaper, BookOpen, HandHeart, UsersRound, Radio, Church, FileText } from "lucide-react";


const CARDS = [
  { label: "Usuarios",     href: "/admin/usuarios",     icon: Users,       table: "usuarios" },
  { label: "Eventos",      href: "/admin/eventos",      icon: CalendarDays, table: "eventos" },
  { label: "Prédicas",     href: "/admin/sermones",     icon: Video,       table: "sermones" },
  { label: "Anuncios",     href: "/admin/anuncios",     icon: Newspaper,   table: "anuncios" },
  { label: "Devocionales", href: "/admin/devocionales", icon: BookOpen,    table: "devocionales" },
  { label: "Pastores",     href: "/admin/pastores",     icon: Church,      table: "pastores" },
  { label: "Oraciones",    href: "/admin/oraciones",    icon: HandHeart,   table: "oraciones" },
  { label: "GPS Equipos",  href: "/admin/equipos",      icon: UsersRound,  table: "equipos" },
  { label: "Recursos",     href: "/admin/recursos",     icon: FileText,    table: "recursos" },
  { label: "En Vivo",      href: "/admin/live",         icon: Radio,       table: null },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    CARDS.filter(c => c.table).forEach(async ({ table }) => {
      const { count } = await supabase.from(table!).select("*", { count: "exact", head: true });
      setCounts(prev => ({ ...prev, [table!]: count ?? 0 }));
    });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white tracking-tight">Panel de Administración</h1>
        <p className="text-white/40 text-sm mt-1">Gestiona todo el contenido de Iglesia CJC</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {CARDS.map(({ label, href, icon: Icon, table }) => (
          <Link key={href} href={href}
            className="group p-5 rounded-2xl border border-border hover:border-accent/40 transition-all duration-200 flex flex-col gap-3"
            style={{ background: "#0D1628" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(191,30,46,0.12)" }}>
              <Icon size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm group-hover:text-white transition-colors">{label}</p>
              {table && (
                <p className="text-white/30 text-xs mt-0.5">
                  {counts[table] !== undefined ? `${counts[table]} registros` : "..."}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
