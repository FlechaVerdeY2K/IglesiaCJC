"use client";
import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function ParticlesBackground() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <Particles
      id="tsparticles"
      className="fixed inset-0 z-40 pointer-events-none"
      options={{
        background: { color: { value: "transparent" } },
        fpsLimit: 40,
        particles: {
          number: { value: 200, density: { enable: true } },
          color: { value: ["#ffffff", "#BF1E2E"] },
          opacity: {
            value: { min: 0.04, max: 0.22 },
            animation: { enable: true, speed: 0.4, sync: false },
          },
          size: {
            value: { min: 0.5, max: 2 },
          },
          move: {
            enable: true,
            speed: 0.25,
            direction: "none",
            random: true,
            straight: false,
            outModes: { default: "out" },
          },
          links: { enable: false },
        },
        detectRetina: true,
      }}
    />
  );
}
