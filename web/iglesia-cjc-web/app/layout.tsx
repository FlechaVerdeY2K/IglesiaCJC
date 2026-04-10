import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticlesBackground from "@/components/ParticlesBackground";
import NavigationLoader from "@/components/NavigationLoader";

export const metadata: Metadata = {
  title: "Iglesia CJC",
  description: "Una familia que camina en adoración y servicio a Dios.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-bg text-white">
        <NavigationLoader />
        <ParticlesBackground />
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
