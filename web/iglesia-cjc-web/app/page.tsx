import { supabase, type ConfigHome, type Sermon, type Evento, type Anuncio } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import Link from "next/link";
import { Calendar, MapPin, Play, Users, Heart, Phone, Lock } from "lucide-react";

async function getHomeData(isLoggedIn: boolean) {
  const [configRes, sermonesRes, eventosRes, anunciosRes] = await Promise.all([
    supabase.from("config_home").select("*").eq("id", 1).single(),
    supabase.from("sermones").select("*").eq("activo", true).order("fecha", { ascending: false }).limit(3),
    isLoggedIn
      ? supabase.from("eventos").select("*").eq("activo", true).order("fecha", { ascending: true }).limit(4)
      : supabase.from("eventos").select("*").eq("activo", true).eq("visibilidad", "todos").order("fecha", { ascending: true }).limit(4),
    isLoggedIn
      ? supabase.from("anuncios").select("*").eq("activo", true).order("fecha", { ascending: false }).limit(3)
      : Promise.resolve({ data: [] }),
  ]);
  return {
    config: configRes.data as ConfigHome | null,
    sermones: (sermonesRes.data ?? []) as Sermon[],
    eventos: (eventosRes.data ?? []) as Evento[],
    anuncios: (anunciosRes.data ?? []) as Anuncio[],
  };
}

export default async function HomePage() {
  const user = await getUser();
  const isLoggedIn = !!user;
  const { config, sermones, eventos, anuncios } = await getHomeData(isLoggedIn);

  const heroImage = config?.hero_image_url;
  const serviciosImage = config?.servicios_image_url;

  return (
    <div>
      {/* Hero — imagen de fondo con overlay igual que Flutter */}
      <section className="relative h-[360px] w-full overflow-hidden">
        {/* Fondo: imagen o gradiente */}
        {heroImage ? (
          <img
            src={heroImage}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D1628] via-[#1A0A0D] to-[#080E1E]" />
        )}

        {/* Overlay oscuro degradado de arriba hacia abajo */}
        {heroImage && (
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.27) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.8) 70%, #080E1E 100%)",
            }}
          />
        )}

        {/* Contenido abajo al centro */}
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2.5 px-6 text-center">
          <span
            className="text-white text-[11px] font-extrabold tracking-[2.5px] px-3 py-1 rounded-[4px]"
            style={{ backgroundColor: "#BF1E2E", boxShadow: "0 4px 8px rgba(0,0,0,0.5)" }}
          >
            IGLESIA CJC
          </span>
          <h1
            className="text-white text-4xl lg:text-5xl font-extrabold leading-tight"
            style={{
              letterSpacing: "-0.5px",
              textShadow: "0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7)",
            }}
          >
            Bienvenidos a<br />Casa CJC
          </h1>
          <p
            className="text-white/70 text-sm"
            style={{ textShadow: "0 1px 16px rgba(0,0,0,0.9)" }}
          >
            Una familia que camina en adoración y servicio a Dios
          </p>
        </div>
      </section>

      {/* Quiénes somos */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Label con líneas decorativas a los lados */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px flex-1 max-w-[60px] bg-accent" />
            <span className="section-label">QUIÉNES SOMOS</span>
            <div className="h-px flex-1 max-w-[60px] bg-accent" />
          </div>

          <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-3" style={{ letterSpacing: "-0.3px" }}>
            {config?.bienvenida_titulo ?? "Bienvenidos a Iglesia CJC"}
          </h2>

          {/* Línea roja decorativa debajo del título */}
          <div className="w-12 h-[3px] bg-accent rounded-full mx-auto mb-5" />

          <p className="text-[#D0D8E8] leading-relaxed text-[15px]" style={{ lineHeight: "1.65" }}>
            {config?.bienvenida_texto || "Somos una iglesia que cree que todo comienza en Dios y que la vida se vive mejor en familia. Somos una comunidad que camina junta, creciendo en fe, amor y propósito, poniendo a Cristo en el centro de todo lo que somos y hacemos.\n\nEn CJC no creemos en una fe aislada, sino en una fe que se vive y se camina. Caminamos juntos en procesos reales, con personas reales, aprendiendo cada día a seguir a Jesús con honestidad, gracia y compromiso."}
          </p>
        </div>
      </section>

      {/* Servicios — con imagen de fondo igual que Flutter */}
      <section className="relative h-[220px] w-full overflow-hidden">
        {serviciosImage ? (
          <img src={serviciosImage} alt="Servicios" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D1628] to-[#080E1E]" />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom right, rgba(0,7,20,0.67), rgba(74,27,0,0.53))" }}
        />
        <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 px-6 text-center">
          <span
            className="text-white/70 text-[10px] font-bold tracking-[2.5px] px-3 py-1 rounded-[4px] border border-white/30"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            CADA SEMANA
          </span>
          <h2 className="text-white text-2xl font-extrabold" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
            Nuestros Servicios
          </h2>
          <p className="text-white/70 text-sm max-w-sm">
            {config?.servicios_texto?.split("\n")[0] ?? "Te esperamos cada semana para adorar juntos."}
          </p>
        </div>
      </section>

      {/* Cards de servicios */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { dia: "Domingo", hora: "10:00 AM", tipo: "Servicio General" },
            { dia: "Miércoles", hora: "7:00 PM", tipo: "Estudio Bíblico" },
            { dia: "Viernes", hora: "7:30 PM", tipo: "Grupo de Jóvenes" },
          ].map((s) => (
            <div key={s.dia} className="card text-center">
              <Calendar className="mx-auto text-accent mb-3" size={32} />
              <h3 className="font-bold text-white text-lg">{s.dia}</h3>
              <p className="text-accent font-semibold">{s.hora}</p>
              <p className="text-muted text-sm mt-1">{s.tipo}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sermones recientes */}
      {sermones.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-12 border-t border-border">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="section-label">Palabra de Dios</span>
              <h2 className="text-2xl font-bold mt-2">Sermones Recientes</h2>
            </div>
            <Link href="/sermones" className="text-accent hover:underline text-sm">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sermones.map((s) => (
              <a key={s.id} href={`https://www.youtube.com/watch?v=${s.video_id}`} target="_blank" rel="noopener noreferrer"
                className="card group hover:border-accent transition-colors block">
                <div className="aspect-video bg-border rounded-lg mb-4 overflow-hidden relative">
                  <img src={`https://img.youtube.com/vi/${s.video_id}/hqdefault.jpg`} alt={s.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-accent rounded-full p-3"><Play className="text-white" size={24} /></div>
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-accent transition-colors">{s.titulo}</h3>
                <p className="text-muted text-sm">{s.predicador}</p>
                <p className="text-muted text-xs mt-1">
                  {new Date(s.fecha).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Próximos eventos */}
      {eventos.length > 0 && (
        <section className="bg-surface border-y border-border py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="section-label">Agenda</span>
                <h2 className="text-2xl font-bold mt-2">Próximos Eventos</h2>
              </div>
              <Link href="/eventos" className="text-accent hover:underline text-sm">Ver todos →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {eventos.map((e) => {
                const fecha = new Date(e.fecha);
                return (
                  <div key={e.id} className="card hover:border-accent transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-accent/10 rounded-lg p-2 text-center min-w-[52px]">
                        <p className="text-accent font-bold text-lg leading-none">{fecha.getDate()}</p>
                        <p className="text-accent text-xs uppercase">{fecha.toLocaleString("es", { month: "short" })}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm leading-tight">{e.titulo}</h3>
                        {e.lugar && <p className="text-muted text-xs flex items-center gap-1 mt-1"><MapPin size={10} /> {e.lugar}</p>}
                      </div>
                    </div>
                    <p className="text-muted text-xs line-clamp-2">{e.descripcion}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* GPS Banner — solo logueados */}
      {isLoggedIn ? (
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <div className="card text-center py-16">
            <Users className="mx-auto text-accent mb-4" size={48} />
            <h2 className="text-3xl font-bold mb-4">Grupos de Proceso Semanal</h2>
            <p className="text-muted max-w-xl mx-auto mb-8">
              Los GPS son pequeños grupos donde la fe se vive en comunidad. Únete a uno cerca de ti o inicia el tuyo propio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/equipos" className="btn-primary">Unirme a un GPS</Link>
              <Link href="/contacto" className="btn-secondary">Más información</Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <div className="card text-center py-16 border-accent/30">
            <Lock className="mx-auto text-accent mb-4" size={40} />
            <h2 className="text-2xl font-bold mb-3">Accede a más contenido</h2>
            <p className="text-muted max-w-xl mx-auto mb-3">
              Crea una cuenta gratis para acceder a Devocionales, Galería, Pastores, GPS, Oraciones y más.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link href="/register" className="btn-primary">Crear cuenta gratis</Link>
              <Link href="/login" className="btn-secondary">Iniciar sesión</Link>
            </div>
          </div>
        </section>
      )}

      {/* Anuncios — solo logueados */}
      {isLoggedIn && anuncios.length > 0 && (
        <section className="bg-surface border-y border-border py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <span className="section-label">Novedades</span>
            <h2 className="text-2xl font-bold mt-2 mb-8">Anuncios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {anuncios.map((a) => (
                <div key={a.id} className="card">
                  {a.imagen_url && <img src={a.imagen_url} alt={a.titulo} className="w-full h-40 object-cover rounded-lg mb-4" />}
                  <h3 className="font-semibold text-white mb-2">{a.titulo}</h3>
                  <p className="text-muted text-sm leading-relaxed">{a.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contacto */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 text-center">
        <Heart className="mx-auto text-accent mb-4" size={40} />
        <h2 className="text-2xl font-bold mb-3">¿Tienes alguna pregunta?</h2>
        <p className="text-muted mb-6">Estamos aquí para ayudarte.</p>
        {config?.telefono ? (
          <a href={`https://wa.me/${config.telefono.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2">
            <Phone size={18} /> Escríbenos por WhatsApp
          </a>
        ) : (
          <Link href="/contacto" className="btn-primary inline-flex items-center gap-2">
            <Phone size={18} /> Contáctanos
          </Link>
        )}
      </section>
    </div>
  );
}
