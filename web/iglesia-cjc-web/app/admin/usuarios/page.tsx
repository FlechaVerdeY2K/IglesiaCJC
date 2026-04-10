"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Shield, Search } from "lucide-react";

const supabase = createBrowserClient(
  "https://fvffsnenebscigtywgwn.supabase.co",
  "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN"
);

const ROLES = ["miembro", "lider", "admin"];
const ROLE_COLORS: Record<string, string> = {
  admin:   "rgba(191,30,46,0.15)",
  lider:   "rgba(245,158,11,0.15)",
  miembro: "rgba(59,130,246,0.15)",
};
const ROLE_TEXT: Record<string, string> = {
  admin:   "#BF1E2E",
  lider:   "#F59E0B",
  miembro: "#3B82F6",
};

type Usuario = { id: string; nombre: string; email: string; foto_url: string | null; rol: string };

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("usuarios").select("id, nombre, email, foto_url, rol").order("nombre");
    setUsuarios(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (id: string, rol: string) => {
    setUpdating(id);
    await supabase.from("usuarios").update({ rol }).eq("id", id);
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, rol } : u));
    setUpdating(null);
  };

  const filtered = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Usuarios</h1>
          <p className="text-white/40 text-sm mt-1">{usuarios.length} usuarios registrados</p>
        </div>
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
              <th className="text-left px-5 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Rol</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center py-12 text-white/30">Cargando...</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-white/2 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {u.foto_url
                      ? <img src={u.foto_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                      : <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-accent/20">{u.nombre?.[0] ?? "?"}</div>
                    }
                    <span className="text-white font-medium">{u.nombre || "Sin nombre"}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-white/50 hidden md:table-cell">{u.email}</td>
                <td className="px-5 py-3">
                  <select
                    value={u.rol ?? "miembro"}
                    disabled={updating === u.id}
                    onChange={e => changeRole(u.id, e.target.value)}
                    className="text-xs font-bold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent/50"
                    style={{
                      background: ROLE_COLORS[u.rol] ?? ROLE_COLORS.miembro,
                      color: ROLE_TEXT[u.rol] ?? ROLE_TEXT.miembro,
                    }}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
