import { supabase, type ConfigHome, type Sermon, type Evento, type Anuncio } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { getLiveStatus } from "@/lib/live-status";
import { yesterdayCR } from "@/lib/date";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Play, Users, Heart, Phone, Lock, Radio } from "lucide-react";
import EventosGrid from "@/components/EventosGrid";
import { getLibro, LIBROS } from "@/lib/bible-books";
import BibleBanner from "@/components/BibleBanner";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Bienvenido a Iglesia CJC. Conoce predicas, eventos, transmisiones en vivo y contacto.",
  alternates: {
    canonical: "/",
  },
};

function computeCurrentChapter(
  libro: string,
  capitulo: number,
  autoAvance: boolean,
  fechaInicio: string | null,
): number {
  if (!autoAvance || !fechaInicio) return capitulo;
  const libroData = LIBROS.find(l => l.id === libro);
  if (!libroData) return capitulo;

  // Costa Rica is UTC-6 (no DST). Midnight CR = 06:00 UTC.
  // We represent each "CR day" as its midnight in CR time (= 06:00 UTC that day).
  const nowCR = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const todayMs = Date.UTC(nowCR.getUTCFullYear(), nowCR.getUTCMonth(), nowCR.getUTCDate()) + 6 * 60 * 60 * 1000;

  const [y, m, d] = fechaInicio.split("-").map(Number);
  const startMs = Date.UTC(y, m - 1, d) + 6 * 60 * 60 * 1000;

  if (todayMs < startMs) return capitulo;

  const weeksPassed = Math.floor((todayMs - startMs) / (7 * 24 * 60 * 60 * 1000));
  const effective = capitulo + weeksPassed;
  return ((effective - 1) % libroData.caps) + 1;
}

async function getHomeData(isLoggedIn: boolean) {
  const [configRes, sermonesRes, eventosRes, anunciosRes, bibliaRes] = await Promise.all([
    supabase.from("config_home").select("*").eq("id", 1).single(),
    supabase.from("sermones").select("*").eq("activo", true).order("fecha", { ascending: false }).limit(3),
    isLoggedIn
      ? supabase.from("eventos").select("*").eq("activo", true).gte("fecha", yesterdayCR()).order("fecha", { ascending: true }).limit(6)
      : supabase.from("eventos").select("*").eq("activo", true).eq("visibilidad", "todos").gte("fecha", yesterdayCR()).order("fecha", { ascending: true }).limit(6),
    isLoggedIn
      ? supabase.from("anuncios").select("*").eq("activo", true).order("fecha", { ascending: false }).limit(3)
      : Promise.resolve({ data: [] }),
    supabase.from("config_biblia").select("*").eq("id", 1).single(),
  ]);
  return {
    config: configRes.data as ConfigHome | null,
    sermones: (sermonesRes.data ?? []) as Sermon[],
    eventos: (eventosRes.data ?? []) as Evento[],
    anuncios: (anunciosRes.data ?? []) as Anuncio[],
    biblia: bibliaRes.data as { libro: string; capitulo: number; versiculo: number; titulo: string; activo: boolean; auto_avance: boolean; fecha_inicio: string | null } | null,
  };
}

async function getBibleVerse(libro: string, capitulo: number, versiculo: number): Promise<string> {
  try {
    const { LIBROS } = await import("@/lib/bible-books");
    const libroData = LIBROS.find(l => l.id === libro);
    if (!libroData) return "";
    const res = await fetch(
      `https://bolls.life/get-text/RV1960/${libroData.num}/${capitulo}/`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return "";
    const data = await res.json();
    const verse = data.find((v: { verse: number; text: string }) => v.verse === versiculo);
    return verse ? verse.text.replace(/<[^>]*>/g, "").trim() : "";
  } catch {
    return "";
  }
}

export default async function HomePage() {
  const user = await getUser();
  const isLoggedIn = !!user;
  const [{ config, sermones, eventos, anuncios, biblia }, liveStatus] = await Promise.all([
    getHomeData(isLoggedIn),
    getLiveStatus(),
  ]);

  const efectiveCapitulo = biblia
    ? computeCurrentChapter(biblia.libro, biblia.capitulo, biblia.auto_avance ?? false, biblia.fecha_inicio ?? null)
    : 1;

  const verseText = biblia?.activo && biblia.versiculo
    ? await getBibleVerse(biblia.libro, efectiveCapitulo, biblia.versiculo)
    : "";

  const heroImage = config?.hero_image_url;
  const serviciosImage = config?.servicios_image_url;
  const sameAs = [config?.instagram_url, config?.youtube_url, config?.facebook_url].filter(Boolean) as string[];
  const churchJsonLd = {
    "@context": "https://schema.org",
    "@type": "Church",
    name: "Iglesia CJC",
    alternateName: "Comunidad Jesucristo es el Camino",
    url: SITE_URL,
    logo: `${SITE_URL}/logo-cjc.png`,
    image: heroImage ? [heroImage] : [`${SITE_URL}/logo-cjc.png`],
    telephone: config?.telefono || undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(churchJsonLd) }}
      />
      {/* ── BANNER EN VIVO ── */}
      {liveStatus.isLive && liveStatus.videoId && (
        <Link href="/live" className="block group">
          <div className="relative overflow-hidden flex items-center justify-center gap-3 px-4 py-3 text-center"
            style={{ background: "linear-gradient(90deg, #7a0d1a 0%, #BF1E2E 50%, #7a0d1a 100%)" }}>
            {/* glow animado */}
            <div className="absolute inset-0 pointer-events-none opacity-40"
              style={{ background: "radial-gradient(ellipse at center, rgba(255,80,80,0.5) 0%, transparent 65%)", animation: "pulse 2s ease-in-out infinite" }} />
            {/* dot pulsante */}
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <Radio size={14} className="text-white/90 shrink-0" />
            <span className="text-white font-bold text-sm tracking-wide">EN VIVO</span>
            {liveStatus.title && (
              <>
                <span className="text-white/50 hidden sm:inline">—</span>
                <span className="text-white/90 text-sm hidden sm:inline truncate max-w-xs">{liveStatus.title}</span>
              </>
            )}
            <span className="text-white/70 text-xs font-semibold group-hover:text-white transition-colors ml-1">Ver ahora →</span>
          </div>
        </Link>
      )}

      {/* ── HERO ── */}
      <section className="relative h-[400px] w-full overflow-hidden">
        {heroImage ? (
          <Image src={heroImage} alt="Hero" className="absolute inset-0 w-full h-full object-cover" fill sizes="100vw" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D1628] via-[#1A0A0D] to-[#080E1E]" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,14,30,0.1) 0%, rgba(8,14,30,0.5) 50%, rgba(8,14,30,0.92) 80%, #080E1E 100%)" }} />
        {/* fade limpio en el borde inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 0%, #080E1E 100%)" }} />
        {/* glow rojo de fondo */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-125 h-45 rounded-full blur-[90px] pointer-events-none" style={{ background: "rgba(191,30,46,0.18)" }} />

        <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-3 px-6 text-center">
          <span className="text-white text-[10px] font-bold tracking-[3px] uppercase px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-sm" style={{ backgroundColor: "rgba(191,30,46,0.25)" }}>
            IGLESIA CJC
          </span>
          <h1 className="text-white text-4xl lg:text-5xl font-extrabold leading-tight" style={{ letterSpacing: "-0.5px", textShadow: "0 2px 24px rgba(0,0,0,0.9)" }}>
            Bienvenidos a<br />
            <span style={{ background: "linear-gradient(90deg, #ffffff 0%, #BF1E2E 60%, #ff4d5e 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Casa CJC
            </span>
          </h1>
          <p className="text-white text-sm max-w-xs">Una familia que camina en adoración y servicio a Dios</p>
        </div>
      </section>

      {/* fade bleed entre hero y contenido */}
      <div className="h-24 -mt-24 relative z-10 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #080E1E)" }} />

      {/* ── QUIÉNES SOMOS ── */}
      <section className="max-w-4xl mx-auto px-6 lg:px-12 py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-accent text-[10px] font-bold tracking-[3px] uppercase">Quiénes somos</span>
          </div>
          <div className="w-16 h-px mx-auto mb-8" style={{ background: "linear-gradient(90deg, transparent, #BF1E2E, transparent)" }} />
        </div>
        <div className="relative rounded-2xl border border-white/5 p-8 lg:p-10" style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
          <div className="absolute left-0 top-6 bottom-6 w-0.5 rounded-full bg-accent/60" />
          <p className="text-white/60 leading-relaxed text-[15px] pl-2" style={{ lineHeight: "1.85" }}>
            {config?.bienvenida_texto || "Somos una iglesia que cree que todo comienza en Dios y que la vida se vive mejor en familia. Somos una comunidad que camina junta, creciendo en fe, amor y propósito, poniendo a Cristo en el centro de todo lo que somos y hacemos.\n\nEn CJC no creemos en una fe aislada, sino en una fe que se vive y se camina. Caminamos juntos en procesos reales, con personas reales, aprendiendo cada día a seguir a Jesús con honestidad, gracia y compromiso."}
          </p>
        </div>
      </section>

      {/* ── SERVICIOS BANNER ── */}
      <section className="relative h-55 w-full overflow-hidden">
        {serviciosImage ? (
          <Image src={serviciosImage} alt="Servicios" className="absolute inset-0 w-full h-full object-cover" fill sizes="100vw" />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-[#0D1628] to-bg" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,14,30,0.55) 0%, rgba(8,14,30,0.75) 100%)" }} />
        {/* líneas horizontales estilo scan */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 6px)" }} />
        {/* glow rojo central */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(191,30,46,0.2) 0%, transparent 65%)" }} />
        {/* línea accent top */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px" style={{ background: "linear-gradient(90deg, transparent, #BF1E2E, transparent)" }} />

        <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex items-center gap-2">
            <div className="h-px w-8" style={{ background: "linear-gradient(to right, transparent, #BF1E2E)" }} />
            <span className="text-accent text-[9px] font-black tracking-[4px] uppercase">CADA SEMANA</span>
            <div className="h-px w-8" style={{ background: "linear-gradient(to left, transparent, #BF1E2E)" }} />
          </div>
          <h2 className="text-white text-3xl font-black tracking-tight" style={{ textShadow: "0 0 30px rgba(191,30,46,0.4), 0 2px 16px rgba(0,0,0,0.9)" }}>
            Nuestros Servicios
          </h2>
          <p className="text-white/80 text-sm max-w-xs">
            {config?.servicios_texto?.split("\n")[0] ?? "Te esperamos cada semana para adorar juntos."}
          </p>
        </div>
        {/* fade inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #080E1E)" }} />
      </section>

      {/* ── CARDS DE SERVICIOS ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {[
            { n: "01", dia: "Domingo", hora: "10:00 AM", tipo: "Servicio General" },
            { n: "02", dia: "Viernes", hora: "Variable", tipo: "Grupo de Jóvenes" },
          ].map((s) => (
            <div key={s.dia} className="relative overflow-hidden rounded-2xl border border-white/5 p-6 group hover:border-accent/25 transition-all duration-300" style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
              {/* número */}
              {/* línea accent izquierda */}
              <div className="absolute left-0 top-6 bottom-6 w-0.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(to bottom, transparent, #BF1E2E, transparent)" }} />
              {/* glow hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" style={{ background: "radial-gradient(ellipse at top left, rgba(191,30,46,0.08) 0%, transparent 65%)" }} />

              <div className="pl-4">
                <p className="text-accent font-black text-4xl tracking-tight leading-none mb-2">{s.hora}</p>
                <h3 className="font-bold text-white text-base mb-1">{s.dia}</h3>
                <p className="text-white/30 text-[10px] uppercase tracking-[2px]">{s.tipo}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERMONES ── */}
      {sermones.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-14 border-t border-white/5">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/5 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-accent text-[10px] font-bold tracking-[3px] uppercase">Palabra de Dios</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Prédicas Recientes</h2>
            </div>
            <Link href="/sermones" className="text-white/40 hover:text-accent text-sm transition-colors">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {sermones.map((s) => (
              <a key={s.id} href={`https://www.youtube.com/watch?v=${s.video_id}`} target="_blank" rel="noopener noreferrer"
                className="group relative rounded-2xl border border-white/5 overflow-hidden hover:border-accent/30 transition-all duration-300 block"
                style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, rgba(191,30,46,0.07) 0%, transparent 60%)" }} />
                <div className="aspect-video overflow-hidden relative">
                  <Image src={`https://img.youtube.com/vi/${s.video_id}/hqdefault.jpg`} alt={s.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" fill sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="rounded-full p-3 border border-white/20 backdrop-blur-sm" style={{ backgroundColor: "rgba(191,30,46,0.8)" }}>
                      <Play className="text-white" size={22} />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-accent transition-colors text-sm">{s.titulo}</h3>
                  <p className="text-white/40 text-xs">{s.predicador}</p>
                  <p className="text-white/25 text-xs mt-1">
                    {new Date(s.fecha).toLocaleDateString("es", { timeZone: "America/Costa_Rica", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── LECTURA DEL DOMINGO ── */}
      {biblia?.activo && (
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
          <BibleBanner
            libro={biblia.libro}
            capitulo={efectiveCapitulo}
            versiculo={biblia.versiculo}
            titulo={biblia.titulo}
            verseText={verseText}
            libroNombre={getLibro(biblia.libro).nombre}
          />
        </section>
      )}

      {/* ── PRÓXIMOS EVENTOS ── */}
      {eventos.length > 0 && (
        <section className="py-16 border-t border-white/5" style={{ background: "linear-gradient(180deg, #080E1E 0%, #0A1220 100%)" }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/5 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-accent text-[10px] font-bold tracking-[3px] uppercase">Agenda</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white">Próximos Eventos</h2>
              </div>
              <Link href="/eventos" className="text-white/40 hover:text-accent text-sm transition-colors">Ver todos →</Link>
            </div>
            <EventosGrid eventos={eventos} />
          </div>
        </section>
      )}

      {/* ── GPS / CTA ── */}
      {isLoggedIn ? (
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <div className="relative rounded-2xl border border-white/5 p-10 lg:p-16 text-center overflow-hidden" style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(191,30,46,0.07) 0%, transparent 65%)" }} />
            <div className="absolute top-0 left-1/4 right-1/4 h-px" style={{ background: "linear-gradient(90deg, transparent, #BF1E2E, transparent)" }} />
            <Users className="mx-auto text-accent mb-5 opacity-80" size={44} />
            <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Grupos de Proceso Semanal</h2>
            <p className="text-white/45 max-w-xl mx-auto mb-8 text-sm leading-relaxed">
              Los GPS son pequeños grupos donde la fe se vive en comunidad. Únete a uno cerca de ti o inicia el tuyo propio.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/equipos" className="btn-primary">Unirme a un GPS</Link>
              <Link href="/contacto" className="btn-secondary">Más información</Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="relative rounded-2xl border border-accent/15 px-6 py-5 overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
            <div className="absolute top-0 left-1/4 right-1/4 h-px" style={{ background: "linear-gradient(90deg, transparent, #BF1E2E, transparent)" }} />
            <div className="flex items-center gap-3">
              <Lock className="text-accent shrink-0 opacity-80" size={20} />
              <div>
                <p className="text-white font-bold text-sm">Accede a más contenido</p>
                <p className="text-white/40 text-xs">Devocionales, Galería, GPS, Oraciones y más.</p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/register" className="btn-primary text-sm py-2 px-4">Crear cuenta</Link>
              <Link href="/login" className="btn-secondary text-sm py-2 px-4">Iniciar sesión</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── ANUNCIOS ── */}
      {isLoggedIn && anuncios.length > 0 && (
        <section className="py-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/5 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-accent text-[10px] font-bold tracking-[3px] uppercase">Novedades</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-8">Anuncios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {anuncios.map((a) => (
                <div key={a.id} className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
                  {a.imagen_url
                    ? <Image src={a.imagen_url} alt={a.titulo} className="w-full h-40 object-cover" width={800} height={160} />
                    : <div className="w-full h-40 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0D1628, #1A0A0D)" }}>
                        <Image src="/logo-cjc.png" alt="CJC" className="h-16 object-contain opacity-60" width={64} height={64} />
                      </div>
                  }
                  <div className="p-5">
                    <h3 className="font-semibold text-white mb-2 text-sm">{a.titulo}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{a.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CONTACTO ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        <div className="relative rounded-2xl border border-white/5 px-6 py-5 overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
          <div className="absolute top-0 left-1/4 right-1/4 h-px" style={{ background: "linear-gradient(90deg, transparent, #BF1E2E, transparent)" }} />
          <div className="flex items-center gap-3">
            <Heart className="text-accent shrink-0 opacity-80" size={20} />
            <div>
              <p className="text-white font-bold text-sm">¿Tienes alguna pregunta?</p>
              <p className="text-white/40 text-xs">Estamos aquí para ayudarte.</p>
            </div>
          </div>
          {config?.telefono ? (
            <a href={`https://wa.me/${config.telefono.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4 shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          ) : (
            <Link href="/contacto" className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4 shrink-0">
              <Phone size={15} /> Contáctanos
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}


