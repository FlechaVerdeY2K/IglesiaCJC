"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";
import Image from "next/image";

import { Search } from "lucide-react";


const ALL_ROLES = ["miembro", "lider", "cocina", "admin"] as const;
type Rol = typeof ALL_ROLES[number];

const ROLE_STYLE: Record<Rol, { bg: string; color: string; border: string }> = {
  miembro: { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)",  border: "rgba(255,255,255,0.12)" },
  lider:   { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa",                border: "rgba(59,130,246,0.3)" },
  cocina:  { bg: "rgba(251,146,60,0.15)",  color: "#fb923c",                border: "rgba(251,146,60,0.3)" },
  admin:   { bg: "rgba(191,30,46,0.15)",   color: "#BF1E2E",                border: "rgba(191,30,46,0.3)" },
};

type Usuario = { id: string; nombre: string; email: string; foto_url: string | null; roles: Rol[] };

function normalize(u: { id: string; nombre: string; email: string; foto_url: string | null; rol?: Rol; roles?: Rol[] }): Usuario {
  let roles: Rol[] = u.roles ?? (u.rol ? [u.rol] : ["miembro"]);
  if (!Array.isArray(roles) || roles.length === 0) roles = ["miembro"];
  return { id: u.id, nombre: u.nombre, email: u.email, foto_url: u.foto_url, roles };
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("usuarios").select("id, nombre, email, foto_url, rol, roles").order("nombre");
    setUsuarios((data ?? []).map(normalize));
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleRole = async (usuario: Usuario, rol: Rol) => {
    // miembro cannot be removed — it's the base role
    if (rol === "miembro") return;

    const current = usuario.roles;
    const hasRole = current.includes(rol);
    const newRoles: Rol[] = hasRole
      ? current.filter(r => r !== rol)
      : [...current, rol];

    // Always keep miembro
    if (!newRoles.includes("miembro")) newRoles.unshift("miembro");

    setUpdating(usuario.id + rol);
    // Derive primary rol for backward compat (highest privilege)
    const priority: Rol[] = ["admin", "cocina", "lider", "miembro"];
    const primaryRol = priority.find(r => newRoles.includes(r)) ?? "miembro";

    await supabase.from("usuarios")
      .update({ roles: newRoles, rol: primaryRol })
      .eq("id", usuario.id);

    setUsuarios(prev => prev.map(u => u.id === usuario.id ? { ...u, roles: newRoles } : u));
    setUpdating(null);
  };

  const filtered = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Usuarios</h1>
        <p className="text-white/40 text-sm mt-1">{usuarios.length} usuarios registrados</p>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 max-w-sm"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "#0D1628" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Usuario</th>
              <th className="text-left px-5 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Email</th>
              <th className="text-left px-5 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Roles</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center py-12 text-white/30">Cargando...</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 shrink-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-accent/20 absolute inset-0">
                        {u.nombre?.[0] ?? "?"}
                      </div>
                      {u.foto_url && (
                        <Image
                          src={u.foto_url}
                          className="w-8 h-8 rounded-full object-cover absolute inset-0"
                          alt=""
                          width={32}
                          height={32}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      )}
                    </div>
                    <span className="text-white font-medium">{u.nombre || "Sin nombre"}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-white/50 hidden md:table-cell">{u.email}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_ROLES.map(rol => {
                      const active = u.roles.includes(rol);
                      const isBase = rol === "miembro";
                      const style = ROLE_STYLE[rol];
                      const isUpdating = updating === u.id + rol;
                      return (
                        <button
                          key={rol}
                          disabled={isBase || isUpdating}
                          onClick={() => toggleRole(u, rol)}
                          title={isBase ? "Rol base, no se puede quitar" : active ? `Quitar ${rol}` : `Dar rol ${rol}`}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border transition-all ${
                            active
                              ? "opacity-100"
                              : "opacity-25 hover:opacity-60"
                          } ${isBase ? "cursor-default" : "cursor-pointer"}`}
                          style={active
                            ? { background: style.bg, color: style.color, borderColor: style.border }
                            : { background: "transparent", color: style.color, borderColor: style.border }
                          }
                        >
                          {isUpdating ? "..." : rol}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
