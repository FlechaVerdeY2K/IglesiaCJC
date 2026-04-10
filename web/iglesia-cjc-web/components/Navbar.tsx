"use client";
import Link from "next/link";
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
  { href: "/sermones", label: "Sermones" },
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
  const [memberOpen, setMemberOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

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
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
              CJC
            </div>
            <span className="font-bold text-white text-lg hidden sm:block">Iglesia CJC</span>
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
                  <div className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-xl shadow-xl py-2 min-w-[160px] z-50">
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
                <Link href="/perfil" className="text-muted hover:text-white text-sm transition-colors truncate max-w-[180px]">
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
          <button className="lg:hidden ml-auto text-white p-1" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-surface border-t border-border px-6 py-4 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
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
