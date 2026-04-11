"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { usePathname } from "next/navigation";

const supabase = createBrowserClient(
  "https://fvffsnenebscigtywgwn.supabase.co",
  "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN"
);

const NAV_PUBLIC = [
  { href: "/sermones", label: "Prédicas" },
  { href: "/eventos", label: "Eventos" },
];

const NAV_MEMBER = [
  { href: "/devocionales", label: "Devocionales" },
  { href: "/galeria", label: "Galería" },
  { href: "/pastores", label: "Pastores" },
];

const COMMUNITY_PUBLIC = [
  { href: "/live", label: "En Vivo" },
  { href: "/contacto", label: "Contacto" },
];

const COMMUNITY_MEMBER = [
  { href: "/equipos", label: "GPS – Grupos" },
  { href: "/oraciones", label: "Oraciones" },
];

export default function Footer() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="relative mt-6 border-t border-white/5 overflow-hidden">
      {/* glow rojo fondo */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-125 h-32 rounded-full blur-[80px] pointer-events-none" style={{ background: "rgba(191,30,46,0.07)" }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo-cjc.png" alt="Logo CJC" width={36} height={36} className="object-contain" />
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-8 bg-[#BF1E2E] rounded-full" />
                <div className="flex flex-col leading-none gap-0.75">
                  <span className="text-[9px] font-bold tracking-[4px] uppercase text-white/30">Iglesia</span>
                  <span className="text-[15px] font-black tracking-tight text-white">Casa CJC</span>
                </div>
              </div>
            </div>
            <p className="text-white/35 text-sm leading-relaxed max-w-xs">
              Una familia que camina en adoración y servicio a Dios.
            </p>
          </div>

          {/* Navegación */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-3 rounded-full bg-accent" />
              <h4 className="text-white/60 text-[10px] font-bold tracking-[3px] uppercase">Navegación</h4>
            </div>
            <div className="flex flex-col gap-2.5">
              {[...NAV_PUBLIC, ...(loggedIn ? NAV_MEMBER : [])].map((l) => (
                <Link key={l.href} href={l.href} className="text-white/40 hover:text-white text-sm transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Comunidad */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-3 rounded-full bg-accent" />
              <h4 className="text-white/60 text-[10px] font-bold tracking-[3px] uppercase">Comunidad</h4>
            </div>
            <div className="flex flex-col gap-2.5">
              {[...COMMUNITY_PUBLIC, ...(loggedIn ? COMMUNITY_MEMBER : [])].map((l) => (
                <Link key={l.href} href={l.href} className="text-white/40 hover:text-white text-sm transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/20 text-xs">© {new Date().getFullYear()} Iglesia CJC. Todos los derechos reservados.</p>
          <div className="h-px w-16 hidden sm:block" style={{ background: "linear-gradient(90deg, transparent, #BF1E2E)" }} />
        </div>
      </div>
    </footer>
  );
}
