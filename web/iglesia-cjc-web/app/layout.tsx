import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NavigationLoader from "@/components/NavigationLoader";
import MainWrapper from "@/components/MainWrapper";
import ParticlesLoader from "@/components/ParticlesLoader";
import { SITE_URL } from "@/lib/site-url";

const navLinks = [
  { name: "Inicio", url: `${SITE_URL}/` },
  { name: "Eventos", url: `${SITE_URL}/eventos` },
  { name: "Sermones", url: `${SITE_URL}/sermones` },
  { name: "Devocionales", url: `${SITE_URL}/devocionales` },
  { name: "En Vivo", url: `${SITE_URL}/live` },
  { name: "Contacto", url: `${SITE_URL}/contacto` },
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Iglesia CJC | Comunidad Jesucristo es el Camino",
    template: "%s | Iglesia CJC",
  },
  description: "Iglesia CJC: comunidad cristiana. Predicas, eventos, en vivo, recursos y contacto.",
  applicationName: "Iglesia CJC",
  keywords: [
    "Iglesia CJC",
    "Comunidad Jesucristo es el Camino",
    "iglesia cristiana",
    "predicas cristianas",
    "eventos iglesia",
    "en vivo iglesia",
  ],
  openGraph: {
    type: "website",
    locale: "es_CR",
    url: "/",
    siteName: "Iglesia CJC",
    title: "Iglesia CJC | Comunidad Jesucristo es el Camino",
    description: "Comunidad cristiana: predicas, eventos, en vivo, recursos y contacto.",
    images: [
      {
        url: "/logo-cjc.png",
        width: 512,
        height: 512,
        alt: "Logo Iglesia CJC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Iglesia CJC | Comunidad Jesucristo es el Camino",
    description: "Comunidad cristiana: predicas, eventos, en vivo, recursos y contacto.",
    images: ["/logo-cjc.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: [{ url: "/logo-cjc.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Iglesia CJC",
    alternateName: "Comunidad Jesucristo es el Camino",
    url: SITE_URL,
    inLanguage: "es",
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Iglesia CJC",
    alternateName: "Comunidad Jesucristo es el Camino",
    url: SITE_URL,
    logo: `${SITE_URL}/logo-cjc.png`,
    image: `${SITE_URL}/logo-cjc.png`,
  };

  const navJsonLd = navLinks.map((item) => ({
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: item.name,
    url: item.url,
  }));

  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-bg text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(navJsonLd) }}
        />
        <NavigationLoader />
        <ParticlesLoader />
        <Navbar />
        <MainWrapper>{children}</MainWrapper>
        <Footer />
      </body>
    </html>
  );
}
