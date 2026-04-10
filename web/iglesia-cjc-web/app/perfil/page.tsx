"use client";
import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Camera, Shield, Users } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

const supabase = createBrowserClient(
  "https://fvffsnenebscigtywgwn.supabase.co",
  "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN"
);

const ROL_LABEL: Record<string, { label: string; color: string }> = {
  admin:   { label: "Administrador", color: "#BF1E2E" },
  lider:   { label: "Líder",         color: "#f59e0b" },
  miembro: { label: "Miembro",       color: "#3b82f6" },
};

export default function PerfilPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser]       = useState<User | null>(null);
  const [nombre, setNombre]   = useState("");
  const [rol, setRol]         = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [gps, setGps]         = useState<{ nombre: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setUser(data.user);

      const { data: perfil } = await supabase
        .from("usuarios")
        .select("nombre, rol, foto_url")
        .eq("id", data.user.id)
        .single();

      setNombre(perfil?.nombre ?? data.user.user_metadata?.full_name ?? "");
      setRol(perfil?.rol ?? "miembro");
      setFotoUrl(perfil?.foto_url ?? data.user.user_metadata?.avatar_url ?? null);

      // GPS
      const { data: gpsData } = await supabase
        .from("gps_registros")
        .select("equipo_nombre")
        .eq("usuario_id", data.user.id)
        .limit(1)
        .single();
      if (gpsData) setGps({ nombre: gpsData.equipo_nombre });

      setLoading(false);
    });
  }, [router]);

  const handleGuardar = async () => {
    if (!user) return;
    setGuardando(true);
    await supabase.from("usuarios").update({ nombre }).eq("id", user.id);
    await supabase.auth.updateUser({ data: { full_name: nombre } });
    setGuardando(false);
    setMensaje("¡Perfil actualizado!");
    setTimeout(() => setMensaje(""), 3000);
  };

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = urlData.publicUrl;
      await supabase.from("usuarios").update({ foto_url: url }).eq("id", user.id);
      await supabase.auth.updateUser({ data: { avatar_url: url } });
      setFotoUrl(url);
    }
    setUploading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <LoadingScreen />;

  const rolInfo = ROL_LABEL[rol] ?? ROL_LABEL.miembro;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">

      {/* Header perfil */}
      <div className="relative rounded-2xl border border-white/5 p-6 mb-5 overflow-hidden" style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
        <div className="absolute top-0 left-1/4 right-1/4 h-px" style={{ background: "linear-gradient(90deg, transparent, #BF1E2E, transparent)" }} />

        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full border-2 border-accent/40 overflow-hidden flex items-center justify-center" style={{ backgroundColor: "rgba(191,30,46,0.1)" }}>
              {fotoUrl
                ? <img src={fotoUrl} alt="avatar" className="w-full h-full object-cover" />
                : <UserIcon className="text-accent" size={36} />
              }
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full border border-white/20 flex items-center justify-center transition-colors hover:border-accent"
              style={{ backgroundColor: "#0F1C30" }}
            >
              {uploading ? <span className="w-2.5 h-2.5 rounded-full border border-accent border-t-transparent animate-spin" /> : <Camera size={11} className="text-white/60" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-white tracking-tight">{nombre || user?.email}</h1>
            <p className="text-white/35 text-xs mt-0.5 truncate">{user?.email}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {/* Badge rol */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border"
                style={{ color: rolInfo.color, borderColor: `${rolInfo.color}40`, backgroundColor: `${rolInfo.color}10` }}>
                <Shield size={9} /> {rolInfo.label}
              </span>

              {/* Badge GPS */}
              {gps && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10 text-white/50" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                  <Users size={9} /> GPS — {gps.nombre}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información personal */}
      <div className="rounded-2xl border border-white/5 p-6 mb-4" style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-3 rounded-full bg-accent" />
          <h2 className="text-white/60 text-[10px] font-black tracking-[3px] uppercase">Información personal</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white/40 text-xs block mb-1.5">Nombre completo</label>
            <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1.5">Email</label>
            <input className="input opacity-40 cursor-not-allowed" value={user?.email ?? ""} disabled />
          </div>
          {mensaje && <p className="text-green-400 text-xs">{mensaje}</p>}
          <button onClick={handleGuardar} disabled={guardando} className="btn-primary">
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* Cerrar sesión */}
      <button
        onClick={handleSignOut}
        className="w-full rounded-2xl border border-white/5 p-4 flex items-center gap-3 text-white/40 hover:text-accent hover:border-accent/30 transition-all duration-200"
        style={{ background: "linear-gradient(135deg, #0F1C30 0%, #080E1E 100%)" }}
      >
        <LogOut size={18} />
        <span className="text-sm font-medium">Cerrar sesión</span>
      </button>
    </div>
  );
}
