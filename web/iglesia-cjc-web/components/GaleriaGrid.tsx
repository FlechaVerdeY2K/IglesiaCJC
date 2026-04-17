"use client";
import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ArrowLeft, Images } from "lucide-react";
import type { GaleriaAlbum, GaleriaItem } from "@/lib/supabase";

type AlbumWithFotos = GaleriaAlbum & { fotos: GaleriaItem[] };

export default function GaleriaGrid({ albums }: { albums: AlbumWithFotos[] }) {
  const [openAlbum, setOpenAlbum]   = useState<AlbumWithFotos | null>(null);
  const [lightbox, setLightbox]     = useState<number | null>(null);

  const prev = () => setLightbox(i => i !== null ? (i - 1 + (openAlbum?.fotos.length ?? 1)) % (openAlbum?.fotos.length ?? 1) : null);
  const next = () => setLightbox(i => i !== null ? (i + 1) % (openAlbum?.fotos.length ?? 1) : null);

  const handleLightboxKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") setLightbox(null);
  };

  if (albums.length === 0) {
    return <p className="text-muted text-center py-20">No hay fotos disponibles aún.</p>;
  }

  /* ── Album detail ── */
  if (openAlbum) {
    const fotos = openAlbum.fotos;
    return (
      <>
        {/* Back + header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setOpenAlbum(null)}
            className="p-2 rounded-lg border border-border text-white/40 hover:text-white hover:border-white/30 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">{openAlbum.nombre}</h2>
            {openAlbum.descripcion && <p className="text-muted text-sm mt-0.5">{openAlbum.descripcion}</p>}
            <p className="text-white/20 text-xs mt-0.5">{fotos.length} foto{fotos.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Photo grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {fotos.map((foto, idx) => (
            <div
              key={foto.id}
              className="break-inside-avoid group relative overflow-hidden rounded-xl border border-border hover:border-accent transition-colors cursor-zoom-in"
              onClick={() => setLightbox(idx)}
            >
              <Image
                src={foto.image_url}
                alt=""
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                width={900}
                height={1200}
              />
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {lightbox !== null && fotos[lightbox] && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 outline-none"
            onClick={() => setLightbox(null)}
            onKeyDown={handleLightboxKey}
            tabIndex={0}
          >
            <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10" onClick={() => setLightbox(null)}>
              <X size={20} />
            </button>
            {fotos.length > 1 && (
              <>
                <button className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10" onClick={e => { e.stopPropagation(); prev(); }}>
                  <ChevronLeft size={24} />
                </button>
                <button className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10" onClick={e => { e.stopPropagation(); next(); }}>
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            <div className="relative max-w-4xl max-h-[90vh] w-full mx-20" onClick={e => e.stopPropagation()}>
              <Image
                src={fotos[lightbox].image_url}
                alt=""
                width={1200}
                height={900}
                className="rounded-xl object-contain max-h-[85vh] w-full"
              />
            </div>
            {fotos.length > 1 && (
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs">
                {lightbox + 1} / {fotos.length}
              </p>
            )}
          </div>
        )}
      </>
    );
  }

  /* ── Albums grid ── */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {albums.map(album => {
        const cover = album.fotos[0];
        return (
          <button
            key={album.id}
            className="group text-left rounded-2xl border border-border hover:border-accent transition-all overflow-hidden"
            style={{ background: "#0D1628" }}
            onClick={() => setOpenAlbum(album)}
          >
            {/* Cover photo */}
            <div className="aspect-video relative overflow-hidden bg-black/30">
              {cover ? (
                <Image
                  src={cover.image_url}
                  alt={album.nombre}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Images size={28} className="text-white/10" />
                </div>
              )}
              {/* Photo count badge */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(0,0,0,0.65)", color: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)" }}>
                {album.fotos.length} foto{album.fotos.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="text-white font-semibold group-hover:text-accent transition-colors">{album.nombre}</h3>
              {album.descripcion && <p className="text-muted text-sm mt-1 line-clamp-2">{album.descripcion}</p>}
              <p className="text-white/20 text-xs mt-2">
                {new Date(album.fecha).toLocaleDateString("es", { timeZone: "America/Costa_Rica", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
