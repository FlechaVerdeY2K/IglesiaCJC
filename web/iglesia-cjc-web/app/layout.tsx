import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticlesBackground from "@/components/ParticlesBackground";
import NavigationLoader from "@/components/NavigationLoader";
import MainWrapper from "@/components/MainWrapper";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    locale: "es_GT",
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
    icon: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-bg text-white">
        <NavigationLoader />
        <ParticlesBackground />
        <Navbar />
        <MainWrapper>{children}</MainWrapper>
        <Footer />
      </body>
    </html>
  );
}
