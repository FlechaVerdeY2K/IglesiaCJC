import { supabase, type ConfigHome } from "@/lib/supabase";
import { FaWhatsapp, FaInstagram, FaYoutube, FaFacebook, FaWaze } from "react-icons/fa";
import Image from "next/image";
import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacta a Iglesia CJC por WhatsApp, redes sociales o mapas para llegar a la iglesia.",
  alternates: {
    canonical: "/contacto",
  },
};

/* ─── Page ───────────────────────────────────────────── */
export default async function ContactoPage() {
  const { data } = await supabase.from("config_home").select("*").eq("id", 1).single();
  const config = data as ConfigHome | null;

  const socials = [
    config?.telefono && {
      href: `https://wa.me/${config.telefono.replace(/\D/g, "")}`,
      icon: <FaWhatsapp size={24} color="#25D366" />,
      bg: "rgba(37,211,102,0.10)",
      border: "rgba(37,211,102,0.25)",
      label: "WhatsApp",
      sub: config.telefono,
    },
    config?.instagram_url && {
      href: config.instagram_url,
      icon: <FaInstagram size={24} color="#E1306C" />,
      bg: "rgba(217,46,127,0.10)",
      border: "rgba(217,46,127,0.25)",
      label: "Instagram",
      sub: "@iglesiacjc",
    },
    config?.youtube_url && {
      href: config.youtube_url,
      icon: <FaYoutube size={24} color="#FF0000" />,
      bg: "rgba(255,0,0,0.10)",
      border: "rgba(255,0,0,0.25)",
      label: "YouTube",
      sub: "Canal de sermones y eventos",
    },
    config?.facebook_url && {
      href: config.facebook_url,
      icon: <FaFacebook size={24} color="#1877F2" />,
      bg: "rgba(24,119,242,0.10)",
      border: "rgba(24,119,242,0.25)",
      label: "Facebook",
      sub: "Página de la iglesia",
    },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; bg: string; border: string; label: string; sub: string }[];

  // Extraer coordenadas del waze_url para construir los otros links
  const wazeCoords = config?.waze_url?.match(/ll=([\d.\-]+),([\d.\-]+)/);
  const lat = wazeCoords?.[1];
  const lng = wazeCoords?.[2];
  const googleMapsUrl = config?.google_maps_url ||
    (lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : null);
  const appleMapsUrl = config?.apple_maps_url ||
    (lat && lng ? `https://maps.apple.com/?q=${lat},${lng}` : null);

  const maps = [
    config?.waze_url && {
      href: config.waze_url,
      icon: <FaWaze size={28} color="#05C8F7" />,
      label: "Waze",
      bg: "rgba(5,200,247,0.10)",
      border: "rgba(5,200,247,0.25)",
    },
    googleMapsUrl && {
      href: googleMapsUrl,
      icon: <Image src="/google-maps.svg" alt="Google Maps" width={28} height={28} />,
      label: "Google Maps",
      bg: "rgba(234,67,53,0.10)",
      border: "rgba(234,67,53,0.25)",
    },
    appleMapsUrl && {
      href: appleMapsUrl,
      icon: <Image src="/apple-maps.svg" alt="Apple Maps" width={28} height={28} />,
      label: "Apple Maps",
      bg: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.15)",
    },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string; bg: string; border: string }[];

  const sameAs = [config?.instagram_url, config?.youtube_url, config?.facebook_url].filter(Boolean) as string[];
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Iglesia CJC",
    url: siteUrl,
    telephone: config?.telefono || undefined,
    contactPoint: config?.telefono
      ? [
          {
            "@type": "ContactPoint",
            telephone: config.telefono,
            contactType: "customer support",
            availableLanguage: ["es"],
          },
        ]
      : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      {/* Header */}
      <div className="mb-14">
        <span className="section-label">Hablemos</span>
        <h1 className="text-4xl lg:text-5xl font-black mt-3 mb-3 text-white">Contacto</h1>
        <p className="text-white/40 text-lg max-w-md">Estamos aquí para ti. No dudes en comunicarte.</p>
      </div>

      <div className="space-y-10">

          {/* Redes sociales */}
          {socials.length > 0 && (
            <div>
              <p className="text-white/30 text-[10px] font-black tracking-[3px] uppercase mb-4 flex items-center gap-2">
                <span className="w-1 h-3 rounded-full bg-accent inline-block" />
                Redes y contacto
              </p>
              <div className="space-y-3">
                {socials.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.01]"
                    style={{ background: s.bg, borderColor: s.border }}
                  >
                    <div className="shrink-0">{s.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{s.label}</p>
                      <p className="text-white/40 text-xs truncate">{s.sub}</p>
                    </div>
                    <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Cómo llegar */}
          {maps.length > 0 && (
            <div>
              <p className="text-white/30 text-[10px] font-black tracking-[3px] uppercase mb-4 flex items-center gap-2">
                <span className="w-1 h-3 rounded-full bg-accent inline-block" />
                Cómo llegar
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {maps.map((m) => (
                  <a
                    key={m.href}
                    href={m.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-200 hover:scale-[1.03] text-center"
                    style={{ background: m.bg, borderColor: m.border }}
                  >
                    <div>{m.icon}</div>
                    <span className="text-white text-sm font-semibold">{m.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
