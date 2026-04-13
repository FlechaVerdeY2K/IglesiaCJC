import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oraciones",
  description: "Comparte tu petición y ora con la comunidad de Iglesia CJC.",
  alternates: {
    canonical: "/oraciones",
  },
};

export default function OracionesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
