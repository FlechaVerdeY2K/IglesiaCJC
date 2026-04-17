import { getBrowserClient } from "./supabase-browser";

export type NotifTipo =
  | "oracion_orada"
  | "ministerio_agregado"
  | "ministerio_removido"
  | "rol_asignado"
  | "rol_removido"
  | "evento_nuevo"
  | "predica_nueva"
  | "devocional_nuevo"
  | "recurso_nuevo"
  | "live_inicio"
  | "biblia_avance";

export async function sendNotification(
  userId: string,
  tipo: NotifTipo,
  titulo: string,
  cuerpo: string | null = null,
  meta: Record<string, unknown> | null = null
) {
  const supabase = getBrowserClient();
  const { error } = await supabase.from("notificaciones").insert({ user_id: userId, tipo, titulo, cuerpo, leida: false, meta });
  if (error) console.error("[sendNotification]", error.message);
}

export async function broadcastNotification(
  tipo: NotifTipo,
  titulo: string,
  cuerpo: string | null = null,
  meta: Record<string, unknown> | null = null,
  userIds?: string[]
) {
  const supabase = getBrowserClient();
  let ids = userIds;
  if (!ids) {
    const { data, error } = await supabase.from("usuarios").select("id");
    if (error) { console.error("[broadcastNotification] fetch users:", error.message); return; }
    ids = (data ?? []).map((u: { id: string }) => u.id);
  }
  if (!ids.length) return;
  const rows = ids.map((uid) => ({ user_id: uid, tipo, titulo, cuerpo, leida: false, meta }));
  const { error } = await supabase.from("notificaciones").insert(rows);
  if (error) console.error("[broadcastNotification] insert:", error.message);
}

export async function getMinisterioMemberIds(equipoId: string): Promise<string[]> {
  const supabase = getBrowserClient();
  const [modernRes, legacyRes] = await Promise.all([
    supabase.from("equipo_solicitudes").select("usuario_id").eq("equipo_id", equipoId).eq("estado", "aprobado"),
    supabase.from("gps_registros").select("usuario_id").eq("equipo_id", equipoId).eq("estado", "aprobada"),
  ]);
  if (modernRes.error) console.error("[getMinisterioMemberIds] equipo_solicitudes:", modernRes.error.message);
  if (legacyRes.error) console.error("[getMinisterioMemberIds] gps_registros:", legacyRes.error.message);
  return Array.from(new Set([
    ...(modernRes.data ?? []).map((r: { usuario_id: string }) => r.usuario_id),
    ...(legacyRes.data ?? []).map((r: { usuario_id: string }) => r.usuario_id),
  ].filter(Boolean)));
}
