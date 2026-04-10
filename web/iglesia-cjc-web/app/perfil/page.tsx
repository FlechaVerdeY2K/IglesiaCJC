"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setUser(data.user);
      const { data: perfil } = await supabase
        .from("usuarios")
        .select("nombre")
        .eq("id", data.user.id)
        .single();
      setNombre(perfil?.nombre ?? "");
      setLoading(false);
    });
  }, [router]);

  const handleGuardar = async () => {
    if (!user) return;
    setGuardando(true);
    await supabase.from("usuarios").update({ nombre }).eq("id", user.id);
    setGuardando(false);
    setMensaje("¡Perfil actualizado!");
    setTimeout(() => setMensaje(""), 3000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted">Cargando...</p></div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
          <UserIcon className="text-white" size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
          <p className="text-muted text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="font-semibold text-white mb-5">Información personal</h2>
        <div className="space-y-4">
          <div>
            <label className="text-muted text-sm block mb-2">Nombre completo</label>
            <input
              className="input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="text-muted text-sm block mb-2">Email</label>
            <input className="input opacity-60 cursor-not-allowed" value={user?.email ?? ""} disabled />
          </div>
          {mensaje && <p className="text-green-400 text-sm">{mensaje}</p>}
          <button onClick={handleGuardar} disabled={guardando} className="btn-primary">
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="card w-full flex items-center gap-3 text-accent hover:border-accent transition-colors"
      >
        <LogOut size={20} />
        Cerrar sesión
      </button>
    </div>
  );
}
