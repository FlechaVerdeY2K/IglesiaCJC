import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Equipos",
  description: "Únete a un equipo o GPS en Iglesia CJC y crece en comunidad.",
  alternates: {
    canonical: "/equipos",
  },
};

export default function EquiposLayout({ children }: { children: React.ReactNode }) {
  return children;
}
