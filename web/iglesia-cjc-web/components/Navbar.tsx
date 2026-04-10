"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { Menu, X, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

const supabase = createBrowserClient(
  "https://fvffsnenebscigtywgwn.supabase.co",
  "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN"
);

// Links públicos (sin login)
const PUBLIC_LINKS = [
  { href: "/sermones", label: "Prédicas" },
  { href: "/eventos", label: "Eventos" },
  { href: "/live", label: "En Vivo" },
  { href: "/contacto", label: "Contacto" },
];

// Links solo para logueados
const MEMBER_LINKS = [
  { href: "/devocionales", label: "Devocional" },
  { href: "/galeria", label: "Galería" },
  { href: "/pastores", label: "Pastores" },
  { href: "/equipos", label: "GPS" },
  { href: "/oraciones", label: "Oraciones" },
  { href: "/recursos", label: "Recursos" },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    if (open) {
      setClosing(true);
      setTimeout(() => { setOpen(false); setClosing(false); }, 400);
    } else {
      setOpen(true);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (open) { setClosing(true); setTimeout(() => { setOpen(false); setClosing(false); }, 400); }
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

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
          <div className="hidden lg:flex items-center gap-1 flex-1">
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
          <div className="hidden lg:flex items-center gap-3 shrink-0 ml-auto">
            {user ? (
              <>
                <Link href="/perfil" className="text-muted hover:text-white text-sm transition-colors truncate max-w-45">
                  {user.email}
                </Link>
                <button onClick={handleSignOut} className="btn-secondary text-sm py-2 px-4">
                  Salir
                </button>
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
          <button className="lg:hidden ml-auto text-white p-1 relative w-7 h-7" onClick={toggleMenu}>
            <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${open ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`}>
              <Menu size={24} />
            </span>
            <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}>
              <X size={24} />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {(open || closing) && (
        <div
          className="lg:hidden bg-surface border-t border-border px-6 py-4 flex flex-col gap-1 max-h-[80vh] overflow-y-auto"
          style={{ animation: closing ? "menu-slide-up 0.4s ease forwards" : "menu-slide-down 0.4s ease forwards", transformOrigin: "top" }}
        >
          <p className="text-muted text-xs uppercase font-bold tracking-wider mb-2 mt-1">General</p>
          {PUBLIC_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-muted hover:text-white py-2 text-sm">
              {l.label}
            </Link>
          ))}

          {user ? (
            <>
              <p className="text-muted text-xs uppercase font-bold tracking-wider mb-2 mt-4">Comunidad</p>
              {MEMBER_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="text-muted hover:text-white py-2 text-sm">
                  {l.label}
                </Link>
              ))}
              <div className="border-t border-border mt-4 pt-4 space-y-2">
                <Link href="/perfil" className="block text-muted hover:text-white text-sm py-1">{user.email}</Link>
                <button onClick={handleSignOut} className="btn-secondary text-sm w-full text-center">Cerrar sesión</button>
              </div>
            </>
          ) : (
            <div className="border-t border-border mt-4 pt-4 space-y-2">
              <p className="text-muted text-xs mb-3">Inicia sesión para acceder a Devocional, Galería, Pastores, GPS y más.</p>
              <Link href="/login" className="btn-secondary text-sm text-center block">Iniciar sesión</Link>
              <Link href="/register" className="btn-primary text-sm text-center block">Registrarse</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
