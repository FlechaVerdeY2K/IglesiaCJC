"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const supabase = createBrowserClient(
  "https://fvffsnenebscigtywgwn.supabase.co",
  "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN"
);

export default function RegisterPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-400 text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">¡Cuenta creada!</h2>
          <p className="text-muted mb-6">Revisa tu email para confirmar tu cuenta y luego inicia sesión.</p>
          <Link href="/login" className="btn-primary inline-block">Ir a iniciar sesión</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo-cjc.png" alt="Logo CJC" width={64} height={64} className="object-contain mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">Crear cuenta</h1>
          <p className="text-muted mt-2">Únete a la familia CJC</p>
        </div>

        <div className="card">
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              className="input"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input
              type="email"
              className="input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="input"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {error && <p className="text-accent text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creando cuenta..." : "Registrarse"}
            </button>
          </form>

          <p className="text-center text-muted text-sm mt-6">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-accent hover:underline">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
