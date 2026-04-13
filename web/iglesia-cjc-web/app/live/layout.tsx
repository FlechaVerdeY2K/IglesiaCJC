import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "En Vivo",
  description: "Transmisión en vivo de Iglesia CJC y últimos contenidos emitidos.",
  alternates: {
    canonical: "/live",
  },
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
