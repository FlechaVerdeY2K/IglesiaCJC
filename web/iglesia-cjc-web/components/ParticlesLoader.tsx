"use client";
import dynamic from "next/dynamic";

const ParticlesBackground = dynamic(() => import("@/components/ParticlesBackground"), { ssr: false });

export default function ParticlesLoader() {
  return <ParticlesBackground />;
}
