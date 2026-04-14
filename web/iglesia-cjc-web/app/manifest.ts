import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Iglesia CJC",
    short_name: "Iglesia CJC",
    description: "Comunidad Jesucristo es el Camino",
    start_url: "/",
    display: "standalone",
    background_color: "#080E1E",
    theme_color: "#BF1E2E",
    lang: "es",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logo-cjc.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
