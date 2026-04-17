"use client";
import { getBrowserClient } from "@/lib/supabase-browser";

const supabase = getBrowserClient();

type AccessSource = "navbar" | "login_password" | "oauth_callback";

export async function recordBrowserAccess(
  userId: string,
  source: AccessSource,
  minIntervalMs = 15 * 60 * 1000
) {
  try {
    const key = `last-access-write:${userId}:${source}`;
    const now = Date.now();
    const prev = Number(window.localStorage.getItem(key) ?? "0");
    if (now - prev < minIntervalMs) return;
    window.localStorage.setItem(key, String(now));

    const timestamp = new Date().toISOString();
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null;

    await supabase.from("usuarios").update({ ultimo_acceso: timestamp }).eq("id", userId);
    await supabase.from("access_logs").insert({
      user_id: userId,
      source,
      user_agent: userAgent,
      created_at: timestamp,
    });
  } catch {
    // fail silently: logging should never block UX
  }
}
