"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";
import Image from "next/image";

import { Clock3, Search, X } from "lucide-react";
import { sendNotification } from "@/lib/notifications";

const ALL_ROLES = ["miembro", "lider", "cocina", "admin"] as const;
type Rol = typeof ALL_ROLES[number];

const ROLE_STYLE: Record<Rol, { bg: string; color: string; border: string }> = {
  miembro: { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", border: "rgba(255,255,255,0.12)" },
  lider: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  cocina: { bg: "rgba(251,146,60,0.15)", color: "#fb923c", border: "rgba(251,146,60,0.3)" },
  admin: { bg: "rgba(191,30,46,0.15)", color: "#BF1E2E", border: "rgba(191,30,46,0.3)" },
};

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  foto_url: string | null;
  roles: Rol[];
  telefono: string | null;
  created_at: string | null;
  ultimo_acceso: string | null;
};

type AccessLog = {
  id: string;
  created_at: string;
  source: string | null;
  ip: string | null;
  user_agent: string | null;
};

function normalize(u: {
  id: string;
  nombre: string;
  email: string;
  foto_url: string | null;
  rol?: Rol;
  roles?: Rol[];
  telefono?: string | null;
  created_at?: string | null;
  ultimo_acceso?: string | null;
}): Usuario {
  let roles: Rol[] = u.roles ?? (u.rol ? [u.rol] : ["miembro"]);
  if (!Array.isArray(roles) || roles.length === 0) roles = ["miembro"];
  return {
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    foto_url: u.foto_url,
    roles,
    telefono: u.telefono ?? null,
    created_at: u.created_at ?? null,
    ultimo_acceso: u.ultimo_acceso ?? null,
  };
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyUser, setHistoryUser] = useState<Usuario | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRows, setHistoryRows] = useState<AccessLog[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);

    const withAccess = await supabase
      .from("usuarios")
      .select("id, nombre, email, foto_url, rol, roles, telefono, created_at, ultimo_acceso")
      .order("nombre");

    if (withAccess.error) {
      const fallback = await supabase
        .from("usuarios")
        .select("id, nombre, email, foto_url, rol, roles, telefono, created_at")
        .order("nombre");
      setUsuarios((fallback.data ?? []).map(normalize));
    } else {
      setUsuarios((withAccess.data ?? []).map(normalize));
    }

    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleRole = async (usuario: Usuario, rol: Rol) => {
    if (rol === "miembro") return;

    const previous = usuario.roles;
    const isCurrentPrimary = previous[0] === rol || (previous.includes(rol) && !["admin","cocina","lider"].some(r => r !== rol && previous.includes(r as Rol)));

    const ROLE_SETS: Record<Rol, Rol[]> = {
      admin:   ["admin", "lider", "cocina", "miembro"],
      lider:   ["lider", "miembro"],
      cocina:  ["cocina", "miembro"],
      miembro: ["miembro"],
    };

    const newRoles: Rol[] = isCurrentPrimary ? ["miembro"] : ROLE_SETS[rol];
    const priority: Rol[] = ["admin", "cocina", "lider", "miembro"];
    const primaryRol = priority.find((r) => newRoles.includes(r)) ?? "miembro";

    setUpdating(usuario.id + rol);
    setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? { ...u, roles: newRoles } : u)));

    const { data: updated, error } = await supabase
      .from("usuarios")
      .update({ roles: newRoles, rol: primaryRol })
      .eq("id", usuario.id)
      .select("id, roles, rol");

    if (error || !updated || updated.length === 0) {
      setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? { ...u, roles: previous } : u)));
    } else {
      const gained = newRoles.filter((r) => r !== "miembro" && !previous.includes(r));
      const lost = previous.filter((r) => r !== "miembro" && !newRoles.includes(r));
      const ROL_NAME: Record<string, string> = { admin: "Administrador", lider: "Líder", cocina: "Cocina" };
      gained.forEach((r) => void sendNotification(usuario.id, "rol_asignado", `Se te asignó el rol de ${ROL_NAME[r] ?? r}`, null, { rol: r }));
      lost.forEach((r) => void sendNotification(usuario.id, "rol_removido", `Se te removió el rol de ${ROL_NAME[r] ?? r}`, null, { rol: r }));
      const { data: fresh } = await supabase
        .from("usuarios")
        .select("id, nombre, email, foto_url, rol, roles, telefono, created_at, ultimo_acceso")
        .eq("id", usuario.id)
        .single();
      if (fresh) setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? normalize(fresh) : u)));
    }

    setUpdating(null);
  };

  const openHistory = async (u: Usuario) => {
    setHistoryUser(u);
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryError(null);
    setHistoryRows([]);

    const { data, error } = await supabase
      .from("access_logs")
      .select("id, created_at, source, ip, user_agent")
      .eq("user_id", u.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      setHistoryError("No se pudo cargar historial. Verifica la tabla access_logs y politicas.");
      setHistoryLoading(false);
      return;
    }

    setHistoryRows((data ?? []) as AccessLog[]);
    setHistoryLoading(false);
  };

  const filtered = usuarios.filter(
    (u) => u.nombre?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
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
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "#0D1628" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Usuario</th>
                <th className="text-left px-5 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Telefono</th>
                <th className="text-left px-5 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Desde</th>
                <th className="text-left px-5 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Ultimo acceso</th>
                <th className="text-left px-5 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Roles</th>
                <th className="text-left px-5 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Historial</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/30">Cargando...</td>
                </tr>
              ) : filtered.map((u) => (
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
                  <td className="px-5 py-3 text-white/50 text-xs">{u.email}</td>
                  <td className="px-5 py-3 text-white/40 text-xs">{u.telefono ?? "-"}</td>
                  <td className="px-5 py-3 text-white/40 text-xs">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString("es", { month: "short", year: "numeric", timeZone: "America/Costa_Rica" })
                      : "-"}
                  </td>
                  <td className="px-5 py-3 text-white/40 text-xs">{u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString("es-CR") : "Sin acceso"}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_ROLES.map((rol) => {
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
                              active ? "opacity-100" : "opacity-25 hover:opacity-60"
                            } ${isBase ? "cursor-default" : "cursor-pointer"}`}
                            style={
                              active
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
                  <td className="px-5 py-3">
                    <button
                      onClick={() => openHistory(u)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/15 text-white/70 hover:text-white hover:border-accent/50 text-xs transition-colors"
                    >
                      <Clock3 size={13} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {historyOpen && historyUser && (
        <div
          className="fixed inset-0 z-[90] p-4 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setHistoryOpen(false);
          }}
        >
          <div className="w-full max-w-3xl rounded-2xl border border-border overflow-hidden" style={{ background: "#0D1628" }}>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <p className="text-white font-bold">Historial de accesos</p>
                <p className="text-white/50 text-xs mt-0.5">{historyUser.nombre} - {historyUser.email}</p>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="w-8 h-8 rounded-lg border border-white/15 text-white/60 hover:text-white hover:border-accent/40 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {historyLoading ? (
                <div className="px-4 py-5 text-sm text-white/50">Cargando historial...</div>
              ) : historyError ? (
                <div className="px-4 py-5 text-sm text-accent">{historyError}</div>
              ) : historyRows.length === 0 ? (
                <div className="px-4 py-5 text-sm text-white/50">Sin accesos registrados.</div>
              ) : (
                <div className="divide-y divide-border/70">
                  {historyRows.map((row) => (
                    <div key={row.id} className="px-4 py-3">
                      <p className="text-white/90 text-sm font-semibold">{new Date(row.created_at).toLocaleString("es-CR")}</p>
                      <p className="text-white/50 text-xs mt-1">Origen: {row.source ?? "-"}</p>
                      <p className="text-white/50 text-xs mt-0.5 break-all">IP: {row.ip ?? "-"}</p>
                      <p className="text-white/40 text-[11px] mt-1 break-all">{row.user_agent ?? "-"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
