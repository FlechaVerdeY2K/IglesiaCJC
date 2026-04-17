"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://iglesiacjc.com").replace(/\/+$/, "");
const AUTH_CALLBACK_URL = `${SITE_URL}/auth/callback`;

type RegisterErrors = {
  nombre?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [success, setSuccess] = useState(false);

  const inputClass = (hasError: boolean) =>
    `input ${hasError ? "border-accent/90 focus:border-accent" : ""}`;

  const validate = (): RegisterErrors => {
    const next: RegisterErrors = {};
    if (!nombre.trim()) next.nombre = "Ingresa tu nombre completo.";
    if (!email.trim()) next.email = "Ingresa tu email.";
    if (!password) next.password = "Ingresa una contraseña.";
    else if (password.length < 6) next.password = "La contraseña debe tener mínimo 6 caracteres.";
    if (!confirmPassword) next.confirmPassword = "Confirma tu contraseña.";
    else if (password !== confirmPassword) next.confirmPassword = "Las contraseñas no coinciden.";
    return next;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre },
        emailRedirectTo: AUTH_CALLBACK_URL,
      },
    });
    setLoading(false);

    if (error) setErrors({ form: error.message });
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
          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div>
              <input
                type="text"
                className={inputClass(!!errors.nombre)}
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: undefined }));
                }}
                aria-invalid={!!errors.nombre}
              />
              {errors.nombre && <p className="text-accent text-xs mt-1.5">{errors.nombre}</p>}
            </div>

            <div>
              <input
                type="email"
                className={inputClass(!!errors.email)}
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-accent text-xs mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`${inputClass(!!errors.password)} pr-11`}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password || errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, password: undefined, confirmPassword: undefined }));
                    }
                  }}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-accent text-xs mt-1.5">{errors.password}</p>}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`${inputClass(!!errors.confirmPassword)} pr-11`}
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white transition-colors"
                  aria-label={showConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-accent text-xs mt-1.5">{errors.confirmPassword}</p>}
            </div>

            {errors.form && (
              <div
                className="rounded-lg border px-3 py-2.5 flex items-start gap-2"
                style={{ borderColor: "rgba(229,57,53,0.45)", background: "rgba(229,57,53,0.10)" }}
              >
                <AlertCircle size={16} className="text-accent mt-0.5 shrink-0" />
                <p className="text-red-100/95 text-sm leading-relaxed">{errors.form}</p>
              </div>
            )}

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
