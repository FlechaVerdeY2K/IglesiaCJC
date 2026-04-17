"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Users } from "lucide-react";

type UsuarioRow = {
  id: string;
  nombre: string | null;
  email: string | null;
  rol: string | null;
  created_at: string | null;
  ultimo_acceso?: string | null;
};

export default function AdminDashboard() {
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const withAccess = await supabase
        .from("usuarios")
        .select("id, nombre, email, rol, created_at, ultimo_acceso")
        .order("created_at", { ascending: false })
        .limit(15);

      if (withAccess.error) {
        const fallback = await supabase
          .from("usuarios")
          .select("id, nombre, email, rol, created_at")
          .order("created_at", { ascending: false })
          .limit(15);
        setUsuarios(((fallback.data ?? []) as UsuarioRow[]).map((u) => ({ ...u, ultimo_acceso: null })));
      } else {
        setUsuarios((withAccess.data ?? []) as UsuarioRow[]);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white tracking-tight">Panel de Administracion</h1>
        <p className="text-white/40 text-sm mt-1">Vista general con usuarios recientes y accesos rapidos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link
          href="/admin/usuarios"
          className="group p-4 rounded-2xl border border-border hover:border-accent/40 transition-all"
          style={{ background: "#0D1628" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(191,30,46,0.12)" }}>
              <Users size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-white font-semibold">Usuarios</p>
              <p className="text-white/40 text-xs">Administrar usuarios</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/eventos"
          className="group p-4 rounded-2xl border border-border hover:border-accent/40 transition-all"
          style={{ background: "#0D1628" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(191,30,46,0.12)" }}>
              <CalendarDays size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-white font-semibold">Eventos</p>
              <p className="text-white/40 text-xs">Administrar eventos</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "#0D1628" }}>
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-white font-bold">Usuarios recientes</h2>
        </div>

        <div className="md:hidden divide-y divide-border/70">
          {loading ? (
            <div className="px-4 py-4 text-sm text-white/50">Cargando usuarios...</div>
          ) : usuarios.length === 0 ? (
            <div className="px-4 py-4 text-sm text-white/50">No hay usuarios para mostrar.</div>
          ) : (
            usuarios.map((u) => (
              <div key={u.id} className="px-4 py-3">
                <p className="text-sm font-semibold text-white/90 truncate">{u.nombre || "Sin nombre"}</p>
                <p className="text-xs text-white/60 mt-1 break-all">{u.email || "-"}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold"
                    style={{ background: "rgba(191,30,46,0.15)", color: "#ff5b6b", border: "1px solid rgba(191,30,46,0.3)" }}
                  >
                    {u.rol || "miembro"}
                  </span>
                  <span className="text-[11px] text-white/50">
                    {u.ultimo_acceso
                      ? new Date(u.ultimo_acceso).toLocaleString("es-CR")
                      : "Sin acceso"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="text-left text-xs text-white/40 uppercase tracking-wider border-b border-border">
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Registro</th>
                <th className="px-4 py-3 font-semibold">Ultimo acceso</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-sm text-white/50" colSpan={5}>Cargando usuarios...</td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-sm text-white/50" colSpan={5}>No hay usuarios para mostrar.</td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3 text-sm text-white/90">{u.nombre || "Sin nombre"}</td>
                    <td className="px-4 py-3 text-sm text-white/70">{u.email || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold" style={{ background: "rgba(191,30,46,0.15)", color: "#ff5b6b", border: "1px solid rgba(191,30,46,0.3)" }}>
                        {u.rol || "miembro"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-3 text-sm text-white/60">
                      {u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString("es-CR") : "Sin acceso"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
