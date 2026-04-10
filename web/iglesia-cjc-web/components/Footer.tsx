import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                CJC
              </div>
              <span className="font-bold text-white text-lg">Iglesia CJC</span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Una familia que camina en adoración y servicio a Dios.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Navegación</h4>
            <div className="flex flex-col gap-2">
              {[
                { href: "/sermones", label: "Sermones" },
                { href: "/eventos", label: "Eventos" },
                { href: "/devocionales", label: "Devocionales" },
                { href: "/galeria", label: "Galería" },
                { href: "/pastores", label: "Pastores" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-muted hover:text-white text-sm transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Comunidad</h4>
            <div className="flex flex-col gap-2">
              {[
                { href: "/equipos", label: "GPS – Grupos" },
                { href: "/live", label: "En Vivo" },
                { href: "/oraciones", label: "Oraciones" },
                { href: "/contacto", label: "Contacto" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-muted hover:text-white text-sm transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-10 pt-6 text-center text-muted text-xs">
          © {new Date().getFullYear()} Iglesia CJC. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
