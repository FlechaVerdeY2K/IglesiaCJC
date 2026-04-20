"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader, ImageIcon, ArrowLeft, Upload, FolderOpen } from "lucide-react";
import { CLOUDINARY_PRESET, cloudinaryUploadUrl } from "@/lib/cloudinary";
import type { GaleriaAlbum, GaleriaItem } from "@/lib/supabase";

type AlbumWithCount = GaleriaAlbum & { fotos: GaleriaItem[] };

export default function AdminGaleria() {
  const [albums, setAlbums]           = useState<AlbumWithCount[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeAlbum, setActiveAlbum] = useState<AlbumWithCount | null>(null);
  const [uploading, setUploading]     = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [totalCount, setTotalCount]   = useState(0);
  const [showForm, setShowForm]       = useState(false);
  const [nombre, setNombre]           = useState("");
  const [descripcion, setDesc]        = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data: albumsData } = await supabase
      .from("galeria_albums")
      .select("*")
      .order("fecha", { ascending: false });
    if (!albumsData) { setLoading(false); return; }

    const { data: fotosData } = await supabase
      .from("galeria")
      .select("*")
      .order("fecha", { ascending: true });

    const fotos = (fotosData ?? []) as GaleriaItem[];
    const result: AlbumWithCount[] = (albumsData as GaleriaAlbum[]).map(a => ({
      ...a,
      fotos: fotos.filter(f => f.album_id === a.id),
    }));
    setAlbums(result);
    if (activeAlbum) {
      const updated = result.find(a => a.id === activeAlbum.id);
      if (updated) setActiveAlbum(updated);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const createAlbum = async () => {
    if (!nombre.trim()) return;
    await supabase.from("galeria_albums").insert({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
    });
    setNombre("");
    setDesc("");
    setShowForm(false);
    void load();
  };

  const deleteAlbum = async (id: string) => {
    if (!confirm("¿Eliminar álbum y todas sus fotos?")) return;
    await supabase.from("galeria_albums").delete().eq("id", id);
    setAlbums(prev => prev.filter(a => a.id !== id));
    if (activeAlbum?.id === id) setActiveAlbum(null);
  };

  const uploadOne = async (file: File, albumId: string): Promise<void> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    const res = await fetch(cloudinaryUploadUrl(), { method: "POST", body: fd });
    const data = await res.json();
    const url = data.secure_url;
    if (!url) return;
    await supabase.from("galeria").insert({ image_url: url, album_id: albumId });
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeAlbum) return;
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadCount(0);
    setTotalCount(files.length);
    for (const file of files) {
      await uploadOne(file, activeAlbum.id);
      setUploadCount(c => c + 1);
    }
    setUploading(false);
    e.target.value = "";
    void load();
  };

  const deletePhoto = async (id: string) => {
    await supabase.from("galeria").delete().eq("id", id);
    if (activeAlbum) {
      setActiveAlbum(prev => prev ? { ...prev, fotos: prev.fotos.filter(f => f.id !== id) } : null);
    }
  };

  /* ── Album list view ── */
  if (!activeAlbum) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">Galería</h1>
            <p className="text-white/40 text-sm mt-1">Álbumes de momentos de la comunidad</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> Nuevo álbum
          </button>
        </div>

        {/* New album form */}
        {showForm && (
          <div className="rounded-2xl border border-accent/30 p-5 mb-6 space-y-3" style={{ background: "#0D1628" }}>
            <h2 className="text-white font-bold text-sm">Nuevo álbum</h2>
            <div>
              <label className="text-white/40 text-xs block mb-1">Nombre *</label>
              <input
                className="input w-full"
                placeholder="Ej: Culto Dominical 13 Abril, Paseo de Jóvenes..."
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createAlbum()}
                autoFocus
              />
            </div>
            <div>
              <label className="text-white/40 text-xs block mb-1">Descripción</label>
              <input
                className="input w-full"
                placeholder="Opcional..."
                value={descripcion}
                onChange={e => setDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={createAlbum} disabled={!nombre.trim()} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                Crear álbum
              </button>
              <button onClick={() => { setShowForm(false); setNombre(""); setDesc(""); }} className="px-4 py-2 rounded-lg text-white/40 hover:text-white text-sm transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-white/30 text-sm">Cargando...</p>
        ) : albums.length === 0 ? (
          <div className="rounded-2xl border border-border p-10 text-center" style={{ background: "#0D1628" }}>
            <FolderOpen size={32} className="mx-auto text-white/10 mb-3" />
            <p className="text-white/30 text-sm">No hay álbumes aún. Crea el primero.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {albums.map(album => {
              const cover = album.fotos[0];
              return (
                <div
                  key={album.id}
                  className="group rounded-2xl border border-border hover:border-accent transition-all overflow-hidden cursor-pointer"
                  style={{ background: "#0D1628" }}
                  onClick={() => setActiveAlbum(album)}
                >
                  {/* Cover */}
                  <div className="aspect-video relative overflow-hidden bg-black/30">
                    {cover ? (
                      <Image src={cover.image_url} alt={album.nombre} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={28} className="text-white/10" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.7)" }}>
                      {album.fotos.length} foto{album.fotos.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{album.nombre}</p>
                      {album.descripcion && <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{album.descripcion}</p>}
                      <p className="text-white/20 text-xs mt-1">
                        {new Date(album.fecha).toLocaleDateString("es", { timeZone: "America/Costa_Rica", day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteAlbum(album.id); }}
                      className="shrink-0 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ── Album detail view ── */
  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button onClick={() => setActiveAlbum(null)} className="mt-1 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black text-white">{activeAlbum.nombre}</h1>
          {activeAlbum.descripcion && <p className="text-white/40 text-sm mt-0.5">{activeAlbum.descripcion}</p>}
          <p className="text-white/20 text-xs mt-1">{activeAlbum.fotos.length} foto{activeAlbum.fotos.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Upload button */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn-primary flex items-center gap-2 shrink-0 disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader size={15} className="animate-spin" />
              {uploadCount}/{totalCount}
            </>
          ) : (
            <>
              <Upload size={15} /> Subir fotos
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      </div>

      {/* Photos grid */}
      {activeAlbum.fotos.length === 0 ? (
        <div
          className="rounded-2xl border-2 border-dashed border-white/10 p-16 text-center cursor-pointer hover:border-accent/30 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={32} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/30 text-sm">Haz click o arrastra fotos para subir</p>
          <p className="text-white/15 text-xs mt-1">Puedes seleccionar varias a la vez</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Upload tile */}
          <div
            className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-accent/30 transition-colors"
            style={{ background: "#0D1628" }}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader size={20} className="text-accent/50 animate-spin mb-1" />
                <span className="text-white/30 text-xs">{uploadCount}/{totalCount}</span>
              </>
            ) : (
              <>
                <Plus size={20} className="text-white/20 mb-1" />
                <span className="text-white/20 text-xs">Agregar</span>
              </>
            )}
          </div>

          {activeAlbum.fotos.map(foto => (
            <div key={foto.id} className="group relative aspect-square rounded-xl overflow-hidden border border-border">
              <Image src={foto.image_url} alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => deletePhoto(foto.id)} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
